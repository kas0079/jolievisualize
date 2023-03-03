import { sendVisData, services, vscode } from '../data';
import { getServiceNetworkId, removeFromNetwork } from '../network';
import { openPopup } from '../popup';
import { getNextId } from '../service';
import { clearSidebar } from '../sidebar';

export const createAggregator = (svcs: Service[]): void => {
	openPopup(
		'Add location and interfaces for each service',
		['Aggregator name', 'Aggregator protocol', 'Aggregator location', ''].concat(
			...svcs.map((t) => [t.id + t.name + ' location', t.id + t.name + ' interfaces', ''])
		),
		async (vals: { field: string; val: string }[]) => {
			if (vals.filter((t) => t.val === '' && t.field !== '').length > 0) return false;
			//todo validate inputs properly
			const newIps = svcs.map((s) => {
				const tmp_interfaces = [];
				vals
					.find((t) => t.field === `${s.id}${s.name} interfaces`)
					?.val.split(',')
					.forEach((str) => tmp_interfaces.push({ name: str.trim() }));

				let location = vals.find((t) => t.field === `${s.id}${s.name} location`)?.val;
				if (location === 'local') location = `!local_${s.name}${s.id}`;
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
					interfaces: vals.find((t) => t.field === `${s.id}${s.name} interfaces`)?.val,
					location: p.location,
					protocol: p.protocol,
					name: p.name
				};
			});

			const aggr: { name: string }[] = [];
			const embeds: Service[] = [];
			const embeddings: { name: string; port: string }[] = [];

			const newOps: Port[] = svcs.map((s) => {
				const tmp_interfaces = [];
				vals
					.find((t) => t.field === `${s.id}${s.name} interfaces`)
					?.val.split(',')
					.forEach((str) => tmp_interfaces.push({ name: str.trim() }));
				aggr.push({ name: s.name });
				let location = vals.find((t) => t.field === `${s.id}${s.name} location`)?.val;
				if (location === 'local') {
					location = `!local_${s.name}${s.id}`;
					embeds.push(s);
					embeddings.push({ name: s.name, port: s.name });
				}
				return {
					file: svcs[0].file,
					interfaces: tmp_interfaces,
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
		}
	);
	clearSidebar();
};
