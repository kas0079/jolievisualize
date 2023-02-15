import type { ElkNode } from 'elkjs/lib/elk-api';
import { interfaces, services, vscode } from './data';
import { addServiceToNetwork } from './network';
import { PopUp, current_popup } from './popup';
import { getServicePatternType } from './patterns';
import { portSize } from './graph';

export const updateRanges = (data: Data): void => {
	const allSvc = getAllServices(services);
	const newSvcs = data.services.flatMap((t) => t.flatMap((s) => getRecursiveEmbedding(s)));
	newSvcs.forEach((newSvc) => {
		const s = allSvc.filter((t) => t.name === newSvc.name && t.file === newSvc.file);
		if (!s || !newSvc.ranges) return;
		s.forEach((ss) => {
			ss.ranges = deepCopyRanges(newSvc.ranges);
			updatePortRanges(ss, newSvc);
		});
	});
};

export const getAllServices = (services: Service[][]): Service[] => {
	return services.flatMap((t) => t.flatMap((s) => getRecursiveEmbedding(s)));
};

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
	const popUp = new PopUp(
		` Create new local ports for ${service.name} and ${parent.name} `,
		['input port name', 'output port name', 'protocol', 'interfaces'],
		(vals) => {
			if (vals.filter((t) => t.val === '').length > 0) return false;

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
					const svc = deepCopyService(service);
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
	current_popup.set(popUp);
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

export const getServiceFromCoords = (e: MouseEvent, services: Service[][]): Service | undefined => {
	const elemBelow = getElementBelowGhost(e)[0];
	if (elemBelow.tagName === 'text')
		return getServiceFromPolygon(
			elemBelow.parentElement.getElementsByTagName('polygon').item(0),
			services
		);
	return elemBelow.tagName === 'polygon' ? getServiceFromPolygon(elemBelow, services) : undefined;
};

export const getHoveredPolygon = (e: MouseEvent): Element | undefined => {
	const elemBelow = getElementBelowGhost(e)[0];
	if (elemBelow.tagName === 'text')
		return elemBelow.parentElement.getElementsByTagName('polygon').item(0);
	return elemBelow.tagName === 'polygon' ? elemBelow : undefined;
};

export const isAncestor = (child: Service, anc: Service): boolean => {
	if (!child.parent) return false;
	let parent = child.parent;
	while (parent.parent) {
		if (parent.id === anc.id) return true;
		parent = parent.parent;
	}
	return parent.id === anc.id;
};

export const findRange = (obj: Service | Port, name: string): SimpleRange => {
	if (!vscode || !obj.ranges) return { start: { line: 0, char: 0 }, end: { line: 0, char: 0 } };
	const res = obj.ranges.find((t) => t.name === name);
	if (!res || !res.range) return { start: { line: 0, char: 0 }, end: { line: 0, char: 0 } };
	return res.range;
};

export const transposeRange = (
	range: SimpleRange,
	startLine: number,
	startChar: number,
	endLine: number,
	endChar: number
): SimpleRange => {
	return {
		start: { line: range.start.line + startLine, char: range.start.char + startChar },
		end: { line: range.end.line + endLine, char: range.end.char + endChar }
	};
};

export const drawService = (serviceNode: ElkNode, expanded: boolean) => {
	serviceNode.x = serviceNode.x ?? 0;
	serviceNode.y = serviceNode.y ?? 0;
	serviceNode.width = serviceNode.width ?? 0;
	serviceNode.height = serviceNode.height ?? 0;

	const w = serviceNode.width / 2;
	const h = serviceNode.height;
	const sideOffset = Math.min(w / 4, portSize - 1);

	d3.select(`#${serviceNode.id}`).attr(
		'transform',
		`translate(${serviceNode.x}, ${serviceNode.y})`
	);
	d3.select(`#${serviceNode.id} > polygon`)
		.attr(
			'points',
			`${-sideOffset},${h / 2} ${0},${h} ${w * 2},${h} ${w * 2 + sideOffset},${h / 2} ${
				w * 2
			},${0} ${0},${0}`
		)
		.on('mouseover', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.8');
		})
		.on('mouseleave', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.4');
		});

	d3.select(`#${serviceNode.id} > text`)
		.attr('x', w)
		.attr('text-anchor', 'middle')
		.attr('y', expanded ? 5 : h / 2 + 1)
		.style('font', '4px sans-serif')
		.on('mouseover', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.8');
		})
		.on('mouseleave', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.4');
		});
};

export const renderGhostNodeOnDrag = (
	serviceNode: ElkNode,
	e: MouseEvent,
	startX: number,
	startY: number
): void => {
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

export const isDockerService = (service: Service): boolean => {
	return service.image && service.ports && !service.file;
};

const deepCopyService = (service: Service): Service => {
	return {
		id: getNextId(getAllServices(services)),
		execution: service.execution,
		file: service.file,
		name: service.name,
		ranges: deepCopyRanges(service.ranges),
		paramFile: service.paramFile,
		parent: service.parent,
		parentPort: service.parentPort,
		embeddings: service.embeddings ? service.embeddings.map((t) => deepCopyService(t)) : [],
		inputPorts: service.inputPorts ? service.inputPorts.map((t) => deepCopyPort(t)) : [],
		outputPorts: service.outputPorts ? service.outputPorts.map((t) => deepCopyPort(t)) : [],
		image: service.image,
		ports: service.ports
	};
};

const deepCopyPort = (port: Port): Port => {
	return {
		file: port.file,
		interfaces: port.interfaces.map((t) => t),
		location: port.location,
		name: port.name,
		annotation: port.annotation,
		protocol: port.protocol,
		ranges: deepCopyRanges(port.ranges)
		// more stuff
	};
};

const getNextId = (services: Service[]): number => {
	return services.flatMap((t) => t.id).sort((a, b) => b - a)[0] + 1;
};

const getElementBelowGhost = (e: MouseEvent): Element[] => {
	if (document.querySelector('#tmp'))
		document.querySelector('#tmp').setAttribute('style', 'display: none;');
	const elemBelow = document.elementsFromPoint(e.clientX, e.clientY);
	if (document.querySelector('#tmp')) document.querySelector('#tmp').removeAttribute('style');

	return elemBelow;
};

const getServiceFromPolygon = (elem: Element, services: Service[][]): Service => {
	return getAllServices(services).find(
		(t) => t.name + t.id === elem.parentElement.getAttribute('id')
	);
};

const updatePortRanges = (oldSvc: Service, newService: Service): void => {
	oldSvc.inputPorts?.forEach((ip) => {
		newService.inputPorts?.forEach((newIp) => {
			if (ip.name !== newIp.name || !newIp.ranges) return;
			ip.ranges = deepCopyRanges(newIp.ranges);
		});
	});
	oldSvc.outputPorts?.forEach((ip) => {
		newService.outputPorts?.forEach((newOp) => {
			if (ip.name !== newOp.name || !newOp.ranges) return;
			ip.ranges = deepCopyRanges(newOp.ranges);
		});
	});
};

const deepCopyRanges = (newSvc: CodeRange[]): CodeRange[] => {
	const res: CodeRange[] = [];
	newSvc?.forEach((r) => {
		res.push({
			name: r.name,
			range: {
				start: { line: r.range.start.line, char: r.range.start.char },
				end: { line: r.range.end.line, char: r.range.end.char }
			}
		});
	});
	return res;
};

const getRecursiveEmbedding = (service: Service, result: Service[] = []): Service[] => {
	result.push(service);
	if (service.embeddings)
		service.embeddings.forEach((embed) => {
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
