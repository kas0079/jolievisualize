import { interfaces, sendVisData, services, vscode } from '../data';
import { getServiceNetworkId, removeFromNetwork } from '../network';
import { openPopup } from '../popup';
import { getNextId } from '../service';
import { clearSidebar } from '../sidebar';

/**
 * Checks the aggregator pattern can be applied to a list of selected services.
 * @param svcs list of selected services.
 * @returns Whether of not they are aggregateable and if not, why it's not possible.
 */
export const isAggregateable = (svcs: Service[]): { reason: string; aggregateable: boolean } => {
	let res = true;
	let reason = '';
	svcs.forEach((svc) => {
		if (!res) return;
		res = svc.parent === undefined;
		if (!res) reason = 'All services must be top-level services';
		res =
			svcs.filter((t) => t.file === svc.file && t.name === svc.name && t.id !== svc.id).length ===
			0;
		if (!res) reason = 'Some of the chosen services are instances of the same service';
	});
	return { reason, aggregateable: res };
};

/**
 * Opens a popup with the fields needed for the user to create the correct ports and the aggregator service.
 * All ports, embeds and services are created and added to the system.
 * everything is then send to vscode.
 * @param svcs List of selected services
 */
export const createAggregator = (svcs: Service[]): void => {
	openPopup(
		'Add location and interfaces for each service',
		[
			{ field: 'Aggregator name' },
			{ field: 'Aggregator protocol' },
			{ field: 'Aggregator location' },
			{ field: '' }
		].concat(
			...svcs.map((t) => [
				{ field: t.id + t.name + ' location', name: `${t.name} location` },
				{ field: t.id + t.name + ' interfaces', name: `${t.name} interfaces` },
				{ field: '' }
			])
		),
		async (vals: { field: string; val: string }[]) => {
			if (vals.filter((t) => t.val === '' && t.field !== '').length > 0) return false;
			//todo validate inputs properly
			const newIps = svcs.map((s) => {
				const tmp_interfaces: { name: string }[] = [];
				vals
					.find((t) => t.field === `${s.id}${s.name} interfaces`)
					?.val.split(',')
					.forEach((str) => tmp_interfaces.push({ name: str.trim() }));

				let location = vals.find((t) => t.field === `${s.id}${s.name} location`)?.val;
				if (location === 'local') location = `!local_${s.id}${s.name}`;
				const p = {
					file: s.file,
					interfaces: tmp_interfaces,
					location,
					name: vals.find((t) => t.field === `Aggregator name`)?.val,
					protocol: vals.find((t) => t.field === `Aggregator protocol`)?.val
				};
				const isFirst = s.inputPorts === undefined || s.inputPorts.length === 0;
				const range = isFirst
					? s.ranges.find((t) => t.name === 'svc_name').range
					: s.inputPorts[0].ranges.find((t) => t.name === 'port').range;
				if (!s.inputPorts) s.inputPorts = [];
				s.inputPorts.push(p);
				return {
					isFirst,
					range,
					file: p.file,
					interfaces: tmp_interfaces.map((t) => {
						return { file: interfaces.find((i) => i.name === t.name)?.file, name: t.name };
					}),
					location: p.location,
					protocol: p.protocol,
					name: p.name
				};
			});

			const aggr: { name: string }[] = [];
			const embeds: Service[] = [];
			const embeddings: { name: string; port: string; file: string }[] = [];

			const newOps: Port[] = svcs.map((s) => {
				const tmp_interfaces = [];
				vals
					.find((t) => t.field === `${s.id}${s.name} interfaces`)
					?.val.split(',')
					.forEach((str) => tmp_interfaces.push({ name: str.trim() }));
				let location = vals.find((t) => t.field === `${s.id}${s.name} location`)?.val;
				aggr.push({ name: s.name });
				if (location === 'local') {
					location = `!local_${s.id}${s.name}`;
					embeds.push(s);
					embeddings.push({ name: s.name, port: s.name, file: s.file });
				}
				return {
					file: svcs[0].file,
					interfaces: tmp_interfaces.map((t) => {
						return { file: interfaces.find((i) => i.name === t.name)?.file, name: t.name };
					}),
					location,
					name: `${s.name}`,
					protocol: vals.find((t) => t.field === `Aggregator protocol`)?.val
				};
			});

			const newAggrPort: Port = {
				file: svcs[0].file,
				interfaces: undefined,
				aggregates: aggr,
				location: `${vals.find((t) => t.field === `Aggregator location`)?.val}`,
				name: vals.find((t) => t.field === `Aggregator name`)?.val,
				protocol: vals.find((t) => t.field === `Aggregator protocol`)?.val,
				annotation: 'aggregator'
			};

			const aggrSvc: Service = {
				id: getNextId(services.flat()),
				embeddings: [],
				execution: 'concurrent',
				file: newAggrPort.file,
				inputPorts: [newAggrPort],
				outputPorts: newOps,
				name: vals.find((t) => t.field === `Aggregator name`)?.val,
				parent: undefined,
				parentPort: undefined
			};

			const network = getServiceNetworkId(svcs[0]);
			services[network].push(aggrSvc);
			if (embeds.length > 0)
				for (let i = 0; i < embeds.length; i++) {
					const service = embeds[i];
					removeFromNetwork(embeds[i], getServiceNetworkId(embeds[i]));
					service.parent = aggrSvc;
				}

			if (!vscode) {
				aggrSvc.embeddings = embeds;
				return;
			}
			vscode.postMessage({
				command: 'create.pattern.aggregator',
				fromPopup: true,
				save: true,
				detail: {
					service: aggrSvc,
					newIps,
					embeddings
				}
			});
			aggrSvc.embeddings = embeds;
			sendVisData();
			return true;
		},
		async () => {}
	);
	clearSidebar();
};
