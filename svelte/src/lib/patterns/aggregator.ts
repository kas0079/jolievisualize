import { services, vscode } from '../data';
import { getServiceNetworkId } from '../network';
import { openPopup } from '../popup';
import { getNextId } from '../service';
import { clearSidebar } from '../sidebar';

export const createAggregator = (svcs: Service[]): void => {
	openPopup(
		'Add location and interfaces for each service',
		['Aggregator name', 'Aggregator protocol', 'Aggregator location', ''].concat(
			...svcs.map((t) => [t.id + t.name + ' location', t.id + t.name + ' interfaces', ''])
		),
		(vals: { field: string; val: string }[]) => {
			if (vals.filter((t) => t.val === '' && t.field !== '').length > 0) return false;
			//todo validate inputs properly
			const newIps: Port[] = svcs.map((s) => {
				const tmp_interfaces = [];
				vals
					.find((t) => t.field === `${s.id}${s.name} interfaces`)
					?.val.split(',')
					.forEach((str) => tmp_interfaces.push({ name: str.trim() }));
				const p = {
					file: s.file,
					interfaces: tmp_interfaces,
					location: vals.find((t) => t.field === `${s.id}${s.name} location`)?.val,
					name: vals.find((t) => t.field === `Aggregator name`)?.val,
					protocol: vals.find((t) => t.field === `Aggregator protocol`)?.val
				};
				if (!s.inputPorts) s.inputPorts = [];
				s.inputPorts.push(p);
				return p;
			});

			const newAggrPort: Port = {
				file: svcs[0].file,
				interfaces: [],
				location: vals.find((t) => t.field === `Aggregator location`)?.val,
				name: vals.find((t) => t.field === `Aggregator name`)?.val,
				protocol: vals.find((t) => t.field === `Aggregator protocol`)?.val,
				annotation: 'aggregator'
			};

			const newOps: Port[] = svcs.map((s) => {
				const tmp_interfaces = [];
				vals
					.find((t) => t.field === `${s.id}${s.name} interfaces`)
					?.val.split(',')
					.forEach((str) => tmp_interfaces.push({ name: str.trim() }));
				return {
					file: newAggrPort.file,
					interfaces: tmp_interfaces,
					location: vals.find((t) => t.field === `${s.id}${s.name} location`)?.val,
					name: `${s.name}`,
					protocol: vals.find((t) => t.field === `Aggregator protocol`)?.val
				};
			});

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

			if (!vscode) return;

			return true;
		},
		async () => {}
	);
	clearSidebar();
};
