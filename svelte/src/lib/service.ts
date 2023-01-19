import type { ElkNode } from 'elkjs/lib/elk-api';
import { tick } from 'svelte';
import { services, vscode } from './data';
import { PopUp, current_popup } from './popup';
import { addServiceToNetwork } from './network';

export const getAllServices = (services: Service[][]) => {
	return services.flatMap((t) => t.flatMap((s) => getRecursiveEmbedding(s)));
};

export const embed = async (service: Service, parent: Service, netwrkId: number) => {
	await disembed(service, true);

	service.parent = parent;
	if (!parent.embeddings) parent.embeddings = [];
	if (!service.inputPorts) service.inputPorts = [];
	if (!parent.outputPorts) parent.outputPorts = [];
	parent.embeddings.push(service);

	if (isConnected(service, parent)) return;
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
			},
			async () => {
				//TODO disembed
				addServiceToNetwork(service, netwrkId);
				await disembed(service, true);
			}
		)
	);
};

export const disembed = async (service: Service, isEmbedSubroutine = false) => {
	if (!service.parent) return false;
	const parent = service.parent;
	service.parent = undefined;
	const parentPort = parent.outputPorts.find((t) => t.name === service.parentPort);

	// if (parent.outputPorts && parentPort.location.startsWith('!local'))
	// parent.outputPorts = parent.outputPorts.filter((t) => t.name !== parentPort.name);

	if (!isEmbedSubroutine) {
		if (getNumberOfTotalInstances(service) === 1) {
			const portsToRemove = service.inputPorts
				.filter((ip) => ip.location.startsWith('!local'))
				.map((ip) => {
					return {
						filename: ip.file,
						portName: ip.name,
						portType: 'inputPort',
						serviceName: service.name
					};
				});
			if (portsToRemove.length > 0 && vscode)
				vscode.postMessage({ command: 'removePorts', detail: { ports: portsToRemove } });
		} else {
			current_popup.set(
				new PopUp(
					`Create new port`,
					['name', 'protocol', 'location'],
					300,
					(vals) => {
						const oldPort: Port = {
							name: parentPort.name,
							location: parentPort.location,
							protocol: parentPort.protocol,
							file: parentPort.file,
							interfaces: parentPort.interfaces
						};
						parentPort.location = vals.find((t) => t.field === 'location').val;
						if (vscode)
							vscode.postMessage({
								command: 'renamePort',
								detail: {
									editType: 'location',
									oldPort,
									newPort: parentPort
								}
							});
						// TODO add aggregator
					},
					() => {
						//TODO embed service
					}
				)
			);
		}
		if (vscode)
			vscode.postMessage({
				command: 'removeEmbed',
				detail: {
					filename: parent.file,
					serviceName: parent.name,
					embedName: service.name,
					embedPort: service.parentPort
				}
			});
	}
	service.parentPort = undefined;
	if (service.inputPorts)
		service.inputPorts = service.inputPorts.filter((ip) => !ip.location.startsWith('!local'));
	await tick();
	if (parent.embeddings) parent.embeddings = parent.embeddings.filter((t) => t.id !== service.id);
	return true;
};

export const getServiceFromCoords = (e: MouseEvent, services: Service[][]) => {
	const elemBelow = getElementBelowGhost(e)[0];
	return elemBelow.tagName === 'polygon' ? getServiceFromPolygon(elemBelow, services) : undefined;
};

export const getHoveredPolygon = (e: MouseEvent) => {
	const elemBelow = getElementBelowGhost(e)[0];
	return elemBelow.tagName === 'polygon' ? elemBelow : undefined;
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

const isConnected = (inSvc: Service, outSvc: Service) => {
	if (!outSvc.outputPorts || !inSvc.inputPorts) return false;
	let res = false;
	outSvc.outputPorts.forEach((op) => {
		if (res) return;
		inSvc.inputPorts.forEach((ip) => {
			if (ip.location === op.location) {
				res = true;
				return;
			}
		});
	});
	return res;
};
