import type { ElkNode } from 'elkjs/lib/elk-api';
import { services, vscode } from './data';
import { addServiceToNetwork } from './network';
import { PopUp, current_popup } from './popup';

export const getAllServices = (services: Service[][]) => {
	return services.flatMap((t) => t.flatMap((s) => getRecursiveEmbedding(s)));
};

export const embed = async (service: Service, parent: Service, netwrkId: number) => {
	const oldParent = service.parent;
	await disembed(service, true);
	service.parent = parent;
	if (!parent.embeddings) parent.embeddings = [];
	if (!service.inputPorts) service.inputPorts = [];
	if (!parent.outputPorts) parent.outputPorts = [];
	parent.embeddings.push(service);

	const parentPort = getParentPortName(service, parent);
	if (parentPort) {
		service.parentPort = parentPort;
		const pport = parent.outputPorts.find((t) => t.name === parentPort);
		if (!vscode) return;
		vscode.postMessage({
			command: 'addEmbed',
			detail: {
				filename: parent.file,
				embedName: service.name,
				embedPort: service.parentPort,
				range: findRange(pport, 'port')
			}
		});
		return;
	}
	current_popup.set(
		new PopUp(
			`Create new local ports for ${service.name} and ${parent.name}`,
			['input port name', 'output port name', 'protocol', 'interfaces'],
			300,
			(vals) => {
				const tmp_interfaces = [];
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

				service.inputPorts.push(newIP);
				parent.outputPorts.push(newOP);

				if (vscode && parent) {
					//TODO: make it ONE request
					vscode.postMessage({
						command: 'newPort',
						detail: {
							file: parent.file,
							serviceName: parent.name,
							portType: 'outputPort',
							port: {
								name: newOP.name,
								location: 'local',
								protocol: newOP.protocol,
								interface: vals.find((t) => t.field === 'interfaces')
							}
						}
					});
					vscode.postMessage({
						command: 'newPort',
						detail: {
							file: service.file,
							serviceName: service.name,
							portType: 'inputPort',
							port: {
								name: newIP.name,
								location: 'local',
								protocol: newIP.protocol,
								interface: vals.find((t) => t.field === 'interfaces')
							}
						}
					});
					vscode.postMessage({
						command: 'addEmbed',
						detail: {
							filename: parent.file,
							serviceName: parent.name,
							embedName: service.name,
							embedPort: service.parentPort
						}
					});
				}
			},
			async () => {
				if (oldParent) {
					service.parent = oldParent;
					parent.embeddings = parent.embeddings.filter((t) => t.id !== service.id);
					await embed(service, oldParent, netwrkId);
				} else {
					addServiceToNetwork(service, netwrkId);
					await disembed(service, true);
				}
			}
		)
	);
};

export const disembed = async (service: Service, isEmbedSubroutine = false) => {
	if (!service.parent) return false;
	const parent = service.parent;
	service.parent = undefined;

	const parentPort = parent.outputPorts.find((t) => t.name === service.parentPort);
	const parentPortName = parentPort?.name;
	if (getNumberOfTotalInstances(service) === 1 || isEmbedSubroutine) {
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
		if (parent.embeddings) parent.embeddings = parent.embeddings.filter((t) => t.id !== service.id);
		if (vscode) {
			if (portsToRemove.length > 0)
				vscode.postMessage({ command: 'removePorts', detail: { ports: portsToRemove } });
			if (parent)
				vscode.postMessage({
					command: 'removeEmbed',
					detail: {
						filename: parent.file,
						range: findRange(parent, `embed_${service.name}`)
					}
				});
		}
		return parent;
	}
	//! -------- This does not work
	// if (parent.outputPorts)
	// 	parent.outputPorts = parent.outputPorts.filter((t) => t.name !== parentPortName);
	// current_popup.set(
	// 	new PopUp(
	// 		`Create new port for aggregator`,
	// 		['name', 'protocol', 'location'],
	// 		300,
	// 		(vals) => {
	// 			const newLocation = vals.find((t) => t.field === 'location').val;
	// 			if (vscode)
	// 				vscode.postMessage({
	// 					command: 'renamePort',
	// 					detail: {
	// 						filename: parentPort.file,
	// 						serviceName: service.name,
	// 						oldLine: `ocation: "${parentPort.location}"`,
	// 						newLine: `ocation: "${newLocation}"`,
	// 						portName: parentPort.name,
	// 						portType: 'outputPort',
	// 						editType: 'location',
	// 						range: findRange(parentPort, 'location')
	// 					}
	// 				});
	// 			parentPort.location = newLocation;
	// 			parent.outputPorts.push(parentPort);
	// 			// TODO add aggregator
	// 			createAggregator([service]);
	// 		},
	// 		async () => {
	// 			const tmpSvcNetworkId = getServiceNetworkId(service);
	// 			removeFromNetwork(service, tmpSvcNetworkId);
	// 			service.parent = parent;
	// 			parent.outputPorts.push(parentPort);
	// 			parent.embeddings.push(service);
	// 			service.parentPort = getParentPortName(service, parent);
	// 		}
	// 	)
	// );
};

export const getServiceFromCoords = (e: MouseEvent, services: Service[][]) => {
	const elemBelow = getElementBelowGhost(e)[0];
	if (elemBelow.tagName === 'text')
		return getServiceFromPolygon(
			elemBelow.parentElement.getElementsByTagName('polygon').item(0),
			services
		);
	return elemBelow.tagName === 'polygon' ? getServiceFromPolygon(elemBelow, services) : undefined;
};

export const getHoveredPolygon = (e: MouseEvent) => {
	const elemBelow = getElementBelowGhost(e)[0];
	if (elemBelow.tagName === 'text')
		return elemBelow.parentElement.getElementsByTagName('polygon').item(0);
	return elemBelow.tagName === 'polygon' ? elemBelow : undefined;
};

export const isAncestor = (child: Service, anc: Service) => {
	if (!child.parent) return false;
	let parent = child.parent;
	while (parent.parent) {
		if (parent.id === anc.id) return true;
		parent = parent.parent;
	}
	return parent.id === anc.id;
};

export const findRange = (obj: Service | Port, name: string) => {
	return obj.ranges.find((t) => t.name === name).range;
};

export const renderGhostNodeOnDrag = (
	serviceNode: ElkNode,
	e: MouseEvent,
	startX: number,
	startY: number
) => {
	const polygon = document.querySelector('#' + serviceNode.id).children[0];
	const text = document.querySelector('#' + serviceNode.id + ' > text');
	const rect = polygon.getBoundingClientRect();

	const scaleFull = document.querySelector('svg > g').getAttribute('transform');
	const scale = +scaleFull.substring(scaleFull.indexOf('scale(') + 6, scaleFull.length - 1);

	const sx = (rect.left + e.pageX - startX) / scale;
	const sy = (rect.top + e.pageY - startY) / scale;

	const ghostPoly = document.querySelector('#tmp > polygon');
	ghostPoly.setAttribute('points', polygon.getAttribute('points'));
	ghostPoly.setAttribute('class', polygon.getAttribute('class'));
	ghostPoly.setAttribute('style', `stroke-width: 0.4; opacity: 0.6;`);

	const ghostText = document.querySelector('#tmp > text');
	ghostText.setAttribute('class', text.getAttribute('class'));
	ghostText.setAttribute('style', text.getAttribute('style'));
	ghostText.setAttribute('x', text.getAttribute('x'));
	ghostText.setAttribute('y', text.getAttribute('y'));
	ghostText.innerHTML = text.innerHTML;

	const tmp = document.querySelector('#tmp');
	tmp.setAttribute('transform', `scale(${scale}) translate(${sx},${sy})`);
	document.querySelector('main').appendChild(tmp);
};

const getElementBelowGhost = (e: MouseEvent) => {
	if (document.querySelector('#tmp'))
		document.querySelector('#tmp').setAttribute('style', 'display: none;');
	const elemBelow = document.elementsFromPoint(e.clientX, e.clientY);
	if (document.querySelector('#tmp')) document.querySelector('#tmp').removeAttribute('style');

	return elemBelow;
};

const getServiceFromPolygon = (elem: Element, services: Service[][]) => {
	return getAllServices(services).find(
		(t) => t.name + t.id === elem.parentElement.getAttribute('id')
	);
};

const getRecursiveEmbedding = (service: Service, result: Service[] = []) => {
	result.push(service);
	service.embeddings?.forEach((embed) => {
		result = result.concat(getRecursiveEmbedding(embed));
	});
	return result;
};

const getNumberOfTotalInstances = (service: Service) => {
	const allServices = getAllServices(services);
	return allServices.filter((t) => t.name === service.name && t.file === service.file).length - 1;
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
