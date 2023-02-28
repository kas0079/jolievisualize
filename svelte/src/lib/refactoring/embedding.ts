import { services, vscode } from '../data';
import { addServiceToNetwork } from '../network';
import { openPopup } from '../popup';
import { deepCopyServiceNewId, findRange, getAllServices } from '../service';

export const embed = async (service: Service, parent: Service, netwrkId: number): Promise<void> => {
	const parentPort = getParentPortName(service, parent);
	if (vscode && !parentPort) vscode.postMessage({ command: 'getRanges' });
	const oldParent = service.parent;
	await disembed(service);
	service.parent = parent;
	if (!parent.embeddings) parent.embeddings = [];
	if (!service.inputPorts) service.inputPorts = [];
	if (!parent.outputPorts) parent.outputPorts = [];
	parent.embeddings.push(service);

	if (parentPort) {
		service.parentPort = parentPort;
		const pport = parent.outputPorts.find((t) => t.name === parentPort);
		if (!vscode) return;
		vscode.postMessage({
			command: 'addEmbed',
			save: true,
			detail: {
				filename: parent.file,
				embedName: service.name,
				embedPort: service.parentPort,
				isFirst: false,
				range: findRange(pport, 'port')
			}
		});
		return;
	}
	openPopup(
		` Create new local ports for ${service.name} and ${parent.name} `,
		['input port name', 'output port name', 'protocol', 'interfaces'],
		(vals: { field: string; val: string }[]) => {
			if (vals.filter((t) => t.val === '' && t.field !== '').length > 0) return false;

			const tmp_interfaces: { name: string }[] = [];
			vals
				.find((t) => t.field === 'interfaces')
				?.val.split(',')
				.forEach((str) => tmp_interfaces.push({ name: str.trim() }));

			const newIP: Port = {
				file: service.file,
				location: `!local_${service.name}${service.id}`,
				protocol: vals.find((t) => t.field === 'protocol').val,
				name: vals.find((t) => t.field === 'input port name').val,
				interfaces: tmp_interfaces
			};

			const newOP: Port = {
				file: service.file,
				location: `!local_${service.name}${service.id}`,
				protocol: vals.find((t) => t.field === 'protocol').val,
				name: vals.find((t) => t.field === 'output port name').val,
				interfaces: tmp_interfaces
			};

			service.parentPort = vals.find((t) => t.field === 'output port name').val;

			const isParentFirst = parent.outputPorts.length === 0;
			const isSvcFirst = service.inputPorts.length === 0;

			service.inputPorts.push(newIP);
			parent.outputPorts.push(newOP);

			const parents = getAllServices(services).filter(
				(t) => t.name === parent.name && t.file === parent.file && t.id !== parent.id
			);
			if (parents.length >= 1) {
				parents.forEach((prnt) => {
					if (!prnt.embeddings) prnt.embeddings = [];
					const svc = deepCopyServiceNewId(service);
					svc.parent = prnt;
					prnt.embeddings.push(svc);
					if (!prnt.outputPorts) prnt.outputPorts = [];
					prnt.outputPorts.push(newOP);
				});
			}

			if (vscode && parent) {
				const parentRange = isParentFirst
					? findRange(parent, 'svc_name')
					: findRange(parent.outputPorts[0], 'port');

				const svcRange = isSvcFirst
					? findRange(service, 'svc_name')
					: findRange(service.inputPorts[0], 'port');

				vscode.postMessage({
					command: 'addEmbed',
					detail: {
						filename: parent.file,
						embedName: service.name,
						embedPort: service.parentPort,
						isFirst: isParentFirst,
						range: parentRange
					}
				});

				vscode.postMessage({
					command: 'newPort',
					detail: {
						file: parent.file,
						range: parentRange,
						portType: 'outputPort',
						isFirst: isParentFirst,
						port: {
							name: newOP.name,
							location: 'local',
							protocol: newOP.protocol,
							interfaces: vals.find((t) => t.field === 'interfaces').val
						}
					}
				});

				vscode.postMessage({
					command: 'newPort',
					save: true,
					fromPopup: true,
					detail: {
						file: service.file,
						range: svcRange,
						portType: 'inputPort',
						isFirst: isSvcFirst,
						port: {
							name: newIP.name,
							location: 'local',
							protocol: newIP.protocol,
							interfaces: vals.find((t) => t.field === 'interfaces').val
						}
					}
				});
			}
			return true;
		},
		async () => {
			if (oldParent) {
				service.parent = oldParent;
				parent.embeddings = parent.embeddings.filter((t) => t.id !== service.id);
				await embed(service, oldParent, netwrkId);
			} else {
				addServiceToNetwork(service, netwrkId);
				await disembed(service);
			}
		}
	);
};

export const disembed = async (service: Service): Promise<void> => {
	if (!service.parent) return;
	const parent = service.parent;
	const otherInstances = getAllServices(services).filter(
		(t) => t.name === service.name && t.file === service.file && t.id !== service.id
	);
	service.parent = undefined;

	const parentPort = parent.outputPorts.find((t) => t.name === service.parentPort);
	const parentPortName = parentPort?.name;

	const portsToRemove = service.inputPorts
		.filter((ip) => ip.location.startsWith('!local'))
		.map((ip) => {
			return {
				filename: ip.file,
				portType: 'inputPort',
				range: findRange(ip, 'port')
			};
		});

	if (parentPort && parentPort.location.startsWith('!local')) {
		portsToRemove.push({
			filename: parentPort.file,
			portType: 'outputPort',
			range: findRange(parentPort, 'port')
		});
		if (parent.outputPorts)
			parent.outputPorts = parent.outputPorts.filter((t) => t.name !== parentPortName);
	}

	if (service.inputPorts)
		service.inputPorts = service.inputPorts.filter((ip) => !ip.location.startsWith('!local'));

	service.parentPort = undefined;

	if (otherInstances.length > 0) {
		otherInstances.forEach((oi) => {
			if (oi.parent.file !== parent.file || oi.parent.name !== parent.name) return;
			if (oi.parent.outputPorts)
				oi.parent.outputPorts = oi.parent.outputPorts.filter((t) => t.name !== parentPortName);
			if (oi.parent.embeddings)
				oi.parent.embeddings = oi.parent.embeddings.filter(
					(t) => t.file !== service.file && t.name !== service.name
				);
			if (oi.inputPorts)
				oi.inputPorts = oi.inputPorts.filter((t) => !t.location.startsWith('!local'));
			oi.parent = undefined;
			oi.parentPort = undefined;
		});
	}

	if (parent.embeddings) parent.embeddings = parent.embeddings.filter((t) => t.id !== service.id);

	if (vscode) {
		if (portsToRemove.length > 0)
			vscode.postMessage({ command: 'removePorts', detail: { ports: portsToRemove } });
		if (parent)
			vscode.postMessage({
				command: 'removeEmbed',
				save: true,
				detail: {
					filename: parent.file,
					range: findRange(parent, `embed_${service.name}`)
				}
			});
	}
};

const getParentPortName = (inSvc: Service, outSvc: Service): string | undefined => {
	if (!outSvc.outputPorts || !inSvc.inputPorts) return undefined;
	let res: string | undefined = undefined;
	outSvc.outputPorts.forEach((op) => {
		if (res) return;
		inSvc.inputPorts.forEach((ip) => {
			if (ip.location === op.location) {
				res = op.name;
				return;
			}
		});
	});
	return res;
};
