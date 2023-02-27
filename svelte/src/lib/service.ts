import { ElkNode } from 'elkjs/lib/elk-api';
import { services, vscode } from './data';
import { getAllElkNodes, getElkPorts, getInternalEdges } from './graph';

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

export const handleExpandServiceEvent = (event: CustomEvent, graph: ElkNode) => {
	// !TODO zoom to bounding box https://observablehq.com/@d3/zoom-to-bounding-box
	const service = getAllServices(services).find((t) => t.id === event.detail.serviceID);
	const serviceNode = getAllElkNodes(graph).find(
		(t) => t.id === event.detail.serviceName + event.detail.serviceID
	);

	serviceNode.children = [];
	serviceNode.ports = getElkPorts(service, false);
	serviceNode.edges = getInternalEdges(service);

	service.embeddings.forEach((embed) => {
		serviceNode.children.push({
			id: `${embed.name}${embed.id}`,
			labels: [{ text: 'service' }, { text: `${embed.id}` }],
			ports: getElkPorts(embed),
			children: [{ id: '!leaf' }]
		});
	});
};

export const handleShrinkServiceEvent = (event: CustomEvent, graph: ElkNode) => {
	const service = getAllServices(services).find((t) => t.id === event.detail.serviceID);
	const serviceNode = getAllElkNodes(graph).find(
		(t) => t.id === event.detail.serviceName + event.detail.serviceID
	);

	serviceNode.ports = getElkPorts(service);
	serviceNode.children = [{ id: '!leaf' }];
	serviceNode.edges = [];
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

export const isDockerService = (service: Service): boolean => {
	return service.image && !service.file;
};

export const deepCopyService = (service: Service): Service => {
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

// const getNumberOfTotalInstances = (service: Service) => {
// 	const allServices = getAllServices(services);
// 	return allServices.filter((t) => t.name === service.name && t.file === service.file).length - 1;
// };
