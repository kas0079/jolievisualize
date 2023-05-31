import { interfaces, loading, overwriteVisFile, services, vscode } from '../data';
import { addServiceToNetwork, removeFromNetwork } from '../network';
import { openPopup } from '../popup';
import { deepCopyServiceNewId, findRange, getAllServices } from '../service';

/**
 * Embeds a service inside another service. Also removing the service from its previous network.
 * If no non-local ports exists between the two services, open a popup to create new ports.
 * all information is sent to vscode on "confirm"
 * @param service Service to embed
 * @param parent new parent service of the embed
 * @param netwrkId networkID of the embed before embedding
 */
export const embed = async (service: Service, parent: Service, netwrkId: number): Promise<void> => {
	const parentPort = getParentPortName(service, parent);
	const oldParent = service.parent;
	removeFromNetwork(service, netwrkId);
	if (!parent.embeddings) parent.embeddings = [];
	if (!service.inputPorts) service.inputPorts = [];
	if (!parent.outputPorts) parent.outputPorts = [];
	const otherInstances = getAllServices(services).filter(
		(t) => t.name === service.name && t.file === service.file && t.id !== service.id
	);
	if (otherInstances.find((t) => t.parent && t.parent.id === parent.id)) return;
	//if a non-local port already exists between the two services
	if (parentPort) {
		await disembed(service, true);
		service.parentPort = parentPort;
		service.parent = parent;
		parent.embeddings.push(service);
		const pport = parent.outputPorts.find((t) => t.name === parentPort);
		if (!vscode) return;
		await overwriteVisFile();
		vscode.postMessage({
			command: 'create.embed',
			save: true,
			detail: {
				filename: parent.file,
				embedName: service.name,
				embedFile: service.file,
				embedPort: service.parentPort,
				embedAs: false,
				isFirst: false,
				range: findRange(pport, 'port')
			}
		});
		return;
	}
	const localPort = service.inputPorts.find((t) => t.location === 'local');
	if (localPort) {
		await disembed(service, true);
		service.parentPort = service.name;
		service.parent = parent;
		parent.embeddings.push(service);
		localPort.location = `!local_${service.id}${service.name}`;
		parent.outputPorts.push({
			name: service.name,
			file: parent.name,
			location: `!local_${service.id}${service.name}`,
			protocol: 'sodep'
		});
		const isParentFirst = parent.outputPorts.length === 0;
		const parentRange = isParentFirst
			? findRange(parent, 'svc_name')
			: findRange(parent.outputPorts[0], 'port');
		if (!vscode) return;
		await overwriteVisFile();
		vscode.postMessage({
			command: 'create.embed',
			save: true,
			detail: {
				filename: parent.file,
				embedName: service.name,
				embedFile: service.file,
				embedPort: service.parentPort,
				embedAs: true,
				isFirst: isParentFirst,
				range: parentRange
			}
		});
		return;
	}
	openPopup(
		` Create new local ports for ${service.name} and ${parent.name} `,
		[
			{ field: 'input port name' },
			{ field: 'output port name' },
			{ field: 'protocol' },
			{ field: 'interfaces' }
		],
		async (vals: { field: string; val: string }[]) => {
			if (vals.filter((t) => t.val === '' && t.field !== '' && t.field !== 'interfaces').length > 0)
				return false;
			const tmp_interfaces: { name: string }[] = [];
			if (vals.find((t) => t.field === 'interfaces').val.trim() !== '')
				vals
					.find((t) => t.field === 'interfaces')
					?.val.split(',')
					.forEach((str) => tmp_interfaces.push({ name: str.trim() }));

			const newIP: Port = {
				file: service.file,
				location: `!local_${service.id}${service.name}`,
				protocol: vals.find((t) => t.field === 'protocol').val.trim(),
				name: vals.find((t) => t.field === 'input port name').val.trim(),
				interfaces: tmp_interfaces.length === 0 ? undefined : tmp_interfaces
			};

			const newOP: Port = {
				file: service.file,
				location: `!local_${service.id}${service.name}`,
				protocol: vals.find((t) => t.field === 'protocol').val.trim(),
				name: vals.find((t) => t.field === 'output port name').val.trim(),
				interfaces: tmp_interfaces.length === 0 ? undefined : tmp_interfaces
			};

			await disembed(service, true);
			service.parentPort = parentPort;
			service.parent = parent;
			parent.embeddings.push(service);

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

			otherInstances.forEach((oi) => {
				if (!oi.inputPorts) oi.inputPorts = [];
				oi.inputPorts.push({
					file: newIP.file,
					location: `local`,
					protocol: newIP.protocol,
					name: newIP.name,
					interfaces: newIP.interfaces
				});
			});

			if (vscode && parent) {
				await overwriteVisFile();
				const parentRange = isParentFirst
					? findRange(parent, 'svc_name')
					: findRange(parent.outputPorts[0], 'port');

				const svcRange = isSvcFirst
					? findRange(service, 'svc_name')
					: findRange(service.inputPorts[0], 'port');

				vscode.postMessage({
					command: 'create.embed',
					detail: {
						filename: parent.file,
						embedName: service.name,
						embedFile: service.file,
						embedPort: service.parentPort,
						isFirst: isParentFirst,
						range: parentRange
					}
				});

				vscode.postMessage({
					command: 'create.port',
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
							interfaces: tmp_interfaces.map((t) => {
								return { file: interfaces.find((i) => i.name === t.name)?.file, name: t.name };
							})
						}
					}
				});
			}
			return true;
		},
		async () => {
			if (!oldParent) addServiceToNetwork(service, netwrkId);
			loading.set(false);
		}
	);
};

/**
 * Disembeds a service from its current embedding.
 * Removes the local ports and sends the corresponding information to vscode.
 * @param service Service to disembed
 * @param embed_subroutine if this function is called by 'embed' set to true
 */
export const disembed = async (service: Service, embed_subroutine = false): Promise<void> => {
	if (!service.parent) return;

	const parent = service.parent;
	const otherInstances = getAllServices(services).filter(
		(t) =>
			t.name === service.name &&
			t.file === service.file &&
			t.id !== service.id &&
			t.parentPort == service.parentPort
	);
	service.parent = undefined;

	const parentPort = parent.outputPorts.find((t) => t.name === service.parentPort);
	const parentPortName = parentPort?.name;

	const portsToRemove =
		service.inputPorts && parentPort
			? service.inputPorts
					.filter(
						(ip) =>
							ip.location === parentPort.location &&
							(ip.location === 'local' || ip.location.startsWith('!local'))
					)
					.map((ip) => {
						return {
							portName: ip.name,
							filename: ip.file,
							portType: 'inputPort',
							range: findRange(ip, 'port')
						};
					})
			: [];

	if (parentPort && parentPort.location.startsWith('!local')) {
		portsToRemove.push({
			filename: parentPort.file,
			portType: 'outputPort',
			range: findRange(parentPort, 'port'),
			portName: ''
		});
		if (parent.outputPorts)
			parent.outputPorts = parent.outputPorts.filter((t) => t.name !== parentPortName);
	}

	if (service.inputPorts)
		service.inputPorts = service.inputPorts.filter(
			(ip) => !containsPortToRemove(ip, portsToRemove)
		);

	service.parentPort = undefined;

	if (otherInstances.length > 0) {
		otherInstances.forEach((oi) => {
			if (oi.inputPorts)
				oi.inputPorts = oi.inputPorts.filter((t) => !containsPortToRemove(t, portsToRemove));
			if (oi.parent && oi.parent.name === parent.name && oi.parent.file === parent.file) {
				if (parent.file !== oi.parent.file || oi.parent.name !== parent.name) return;
				if (oi.parent.outputPorts)
					oi.parent.outputPorts = oi.parent.outputPorts.filter((t) => t.name !== parentPortName);
				if (oi.parent.embeddings)
					oi.parent.embeddings = oi.parent.embeddings.filter(
						(t) => t.file !== service.file && t.name !== service.name
					);
				oi.parent = undefined;
				oi.parentPort = undefined;
			}
		});
	}

	if (parent.embeddings) parent.embeddings = parent.embeddings.filter((t) => t.id !== service.id);

	if (vscode) {
		if (!embed_subroutine) await overwriteVisFile();
		if (portsToRemove.length > 0)
			vscode.postMessage({ command: 'remove.ports', detail: { ports: portsToRemove } });
		vscode.postMessage({
			command: 'remove.embed',
			save: !embed_subroutine,
			detail: {
				filename: parent.file,
				range: findRange(parent, `embed_${service.name}`)
			}
		});
	}
};

/**
 * Checks if a port is already in a list of ports to remove.
 * @param port Port to check.
 * @param portsToRemove list of ports to remove.
 * @returns true if port is included in the list of ports to remove.
 */
const containsPortToRemove = (
	port: Port,
	portsToRemove: { portName: string; range: TextRange; portType: string; filename: string }[]
): boolean => {
	let res = false;
	portsToRemove.forEach((ptr) => {
		if (res === true) return;
		res = ptr.filename === port.file && ptr.portType === 'inputPort' && ptr.portName === port.name;
	});
	return res;
};

/**
 * Finds the parent port name of two services who is connected via a port.
 * @param inSvc Service with inputPort
 * @param outSvc Service with outputPort
 * @returns parent port name of the outputport or undefined if not found.
 */
const getParentPortName = (inSvc: Service, outSvc: Service): string | undefined => {
	if (!outSvc.outputPorts || !inSvc.inputPorts) return undefined;
	let res: string | undefined = undefined;
	outSvc.outputPorts.forEach((op) => {
		if (res) return;
		inSvc.inputPorts.forEach((ip) => {
			if (ip.location === op.location && ip.protocol === op.protocol) {
				res = op.name;
				return;
			}
		});
	});
	return res;
};
