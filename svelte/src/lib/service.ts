import type { ElkNode } from 'elkjs/lib/elk-api';
import { services, vscode } from './data';
import { getAllElkNodes, getElkPorts, getInternalEdges, getTopLevelEdges } from './graph';

/**
 * Given JSON data object goes through all services and updates their 'ranges' attribute
 * @param data JSON data
 */
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

/**
 * Given a list of networks, recursevely get all services as well as all embeddings.
 * @param services List of networks.
 * @returns List of services.
 */
export const getAllServices = (services: Service[][]): Service[] => {
	return services.flatMap((t) => t.flatMap((s) => getRecursiveEmbedding(s)));
};

/**
 * "Expands" a service by adding its embeddings as ElkNodes to the service's ElkNode.
 * @param event Svelte Event containing the info about the service
 * @param graph ElkNode of the service to add the embeddings to
 */
export const handleExpandServiceEvent = (event: CustomEvent, graph: ElkNode): void => {
	// todo: zoom to bounding box https://observablehq.com/@d3/zoom-to-bounding-box
	const service = getAllServices(services).find((t) => t.id === event.detail.serviceID);
	const serviceNode = getAllElkNodes(graph).find(
		(t) => t.id === 's' + event.detail.serviceID + event.detail.serviceName
	);
	serviceNode.children = [];
	serviceNode.ports = getElkPorts(service, false);
	serviceNode.edges = getInternalEdges(service);
	if (service.embeddings) serviceNode.edges.push(...getTopLevelEdges(service.embeddings));

	service.embeddings.forEach((embed) => {
		serviceNode.children.push({
			id: `s${embed.name}${embed.id}`,
			labels: [{ text: 'service' }, { text: `${embed.id}` }],
			ports: getElkPorts(embed),
			children: [{ id: '!leaf' }]
		});
	});
};

/**
 * "Shrinks" a service by removing it's children in the service's ElkNode.
 * @param event Svelte Event containing the info about the service
 * @param graph ElkNode of the service to remove the embeddings from
 */
export const handleShrinkServiceEvent = (event: CustomEvent, graph: ElkNode): void => {
	const service = getAllServices(services).find((t) => t.id === event.detail.serviceID);
	const serviceNode = getAllElkNodes(graph).find(
		(t) => t.id === 's' + event.detail.serviceID + event.detail.serviceName
	);

	serviceNode.ports = getElkPorts(service);
	serviceNode.edges = [];
	serviceNode.children = [{ id: '!leaf' }];
};

/**
 * From mouse event get the service object which the mouse clicked on.
 * @param e MouseEvent
 * @param services List of all services
 * @returns service which the mouse clicked on or undefined if the mouse didn't click on a service
 */
export const getServiceFromCoords = (e: MouseEvent, services: Service[][]): Service | undefined => {
	const elemBelow = getElementBelowGhost(e)[0];
	if (elemBelow.tagName === 'text')
		return getServiceFromPolygon(
			elemBelow.parentElement.getElementsByTagName('polygon').item(0),
			services
		);
	return elemBelow.tagName === 'polygon' ? getServiceFromPolygon(elemBelow, services) : undefined;
};

/**
 * From mouse event get the polygon Element of another service when mouse is hovering over.
 * @param e MouseEvent
 * @returns polygon element of the service which is hovered over or undefined if no polygon is hovered over.
 */
export const getHoveredPolygon = (e: MouseEvent): Element | undefined => {
	const elemBelow = getElementBelowGhost(e)[0];
	if (elemBelow.tagName === 'text')
		return elemBelow.parentElement.getElementsByTagName('polygon').item(0);
	return elemBelow.tagName === 'polygon' ? elemBelow : undefined;
};

/**
 * Chechs if a service is a (grand)child of another service.
 * @param child Service to check
 * @param anc Possible ancestor
 * @returns True if anc is an ancestor to child
 */
export const isAncestor = (child: Service, anc: Service): boolean => {
	if (!child.parent) return false;
	let parent = child.parent;
	while (parent.parent) {
		if (parent.id === anc.id) return true;
		parent = parent.parent;
	}
	return parent.id === anc.id;
};

/**
 * Given either a Port or Service object, finds a range with a given name.
 * @param obj Port or Service
 * @param name range name to look for.
 * @returns TextRange or a 'zero range' if no range was found.
 */
export const findRange = (obj: Service | Port, name: string): TextRange => {
	if (!vscode || !obj.ranges) return { start: { line: 0, char: 0 }, end: { line: 0, char: 0 } };
	const res = obj.ranges.find((t) => t.name === name);
	if (!res || !res.range) return { start: { line: 0, char: 0 }, end: { line: 0, char: 0 } };
	return res.range;
};

/**
 * @param service Service to check.
 * @returns true if the input service is a docker service.
 */
export const isDockerService = (service: Service): boolean => {
	return service.image && !service.file;
};

/**
 * Deep copies a service and gives it a new ID, effectively creating a new instance of a service.
 * @param service Service to copy
 * @returns A new service instance
 */
export const deepCopyServiceNewId = (service: Service): Service => {
	return {
		id: getNextId(getAllServices(services)),
		execution: service.execution,
		file: service.file,
		name: service.name,
		ranges: deepCopyRanges(service.ranges),
		paramFile: service.paramFile,
		parent: service.parent,
		parentPort: service.parentPort,
		embeddings: service.embeddings ? service.embeddings.map((t) => deepCopyServiceNewId(t)) : [],
		inputPorts: service.inputPorts ? service.inputPorts.map((t) => deepCopyPort(t)) : [],
		outputPorts: service.outputPorts ? service.outputPorts.map((t) => deepCopyPort(t)) : [],
		image: service.image,
		ports: service.ports
	};
};

/**
 * Gets the next service ID given a list of services
 * @param services List of services.
 * @returns next service ID
 */
export const getNextId = (services: Service[]): number => {
	return services.flatMap((t) => t.id).sort((a, b) => b - a)[0] + 1;
};

/**
 * Updates all embedded ports parent port attribute to the parent ports new name.
 * @param service Parent service
 * @param port Old parent port
 * @param newName new port name
 */
export const updateParentPortName = (service: Service, port: Port, newName: string): void => {
	if (service.embeddings && service.embeddings.length > 0)
		service.embeddings.forEach((emb) => {
			if (!emb.inputPorts || emb.inputPorts.length === 0 || !emb.parentPort) return;
			if (emb.parentPort === port.name) emb.parentPort = newName;
		});
};

/**
 * Deep copies a port
 * @param port Port
 * @returns New Port
 */
const deepCopyPort = (port: Port): Port => {
	return {
		file: port.file,
		interfaces: port.interfaces ? port.interfaces.map((t) => t) : [],
		location: port.location,
		name: port.name,
		annotation: port.annotation,
		protocol: port.protocol,
		ranges: deepCopyRanges(port.ranges)
		// todo more stuff
	};
};

/**
 * Gets the element below the ghost node. This is used to find which element the dragged element is dropped on.
 * @param e MouseEvent
 * @returns List of elements below the ghost node.
 */
const getElementBelowGhost = (e: MouseEvent): Element[] => {
	if (document.querySelector('#tmp'))
		document.querySelector('#tmp').setAttribute('style', 'display: none;');
	const elemBelow = document.elementsFromPoint(e.clientX, e.clientY);
	if (document.querySelector('#tmp')) document.querySelector('#tmp').removeAttribute('style');

	return elemBelow;
};

/**
 * Given a polygon, get the corresponding service object.
 * @param elem Polygon element.
 * @param services List of networks
 * @returns Service object.
 */
const getServiceFromPolygon = (elem: Element, services: Service[][]): Service => {
	return getAllServices(services).find(
		(t) => 's' + t.id + t.name === elem.parentElement.getAttribute('id')
	);
};

/**
 * Updates port ranges given new service data. This is a part of the updateRanges function.
 * @param oldSvc Old Service
 * @param newService New Service
 */
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

/**
 * Deep copies ranges.
 * @param newSvc List of ranges.
 * @returns List of new ranges.
 */
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

/**
 * Recursively gets all embeddings of a service.
 * @param service Service to get embeddings from.
 * @param result List of results from previous recursive steps.
 * @returns List of embebbed services.
 */
const getRecursiveEmbedding = (service: Service, result: Service[] = []): Service[] => {
	result.push(service);
	if (service.embeddings)
		service.embeddings.forEach((embed) => {
			result = result.concat(getRecursiveEmbedding(embed));
		});
	return result;
};
