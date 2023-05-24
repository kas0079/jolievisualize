import type { ElkExtendedEdge, ElkNode, ElkPort } from 'elkjs/lib/elk-api';
import { getAllServices, isDockerService } from './service';
import { services } from './data';

/**
 * Settings for ELK
 */
const systemElkLayoutOptions = {
	'elk.algorithm': 'layered',
	interactiveLayout: 'true',
	'elk.direction': 'RIGHT',
	'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
};

const networkElkLayoutOptions = {
	portConstraints: 'FIXED_SIDE',
	'elk.layered.mergeEdge': 'true',
	'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
};

export const PORT_SIZE = 5;

/**
 * Rerenders by rebuilding the graph using the global list of services.
 * @param graph Root ElkNode
 * @returns ElkNode root of the rerendered graph.
 */
export const rerenderGraph = (graph: ElkNode): ElkNode => {
	const allSvcs = getAllServices(services);

	graph.children.forEach((network) => {
		network.children.forEach((serviceNode) => {
			rerenderService(serviceNode, allSvcs);
		});
		network.edges = getTopLevelEdges(
			allSvcs.filter((svc) =>
				network.children.flatMap((t) => t.labels[1].text)?.includes(`${svc.id}`)
			)
		);
	});
	graph.edges = getTopLevelEdges(services.flat());
	return graph;
};

/**
 * Takes a list of networks and creates the ELK graph.
 * @param services 2D List of services.
 * @returns root of the elk graph
 */
export const createSystemGraph = (services: Service[][]): ElkNode => {
	const children = getNetworkNodes(services);
	const edges = getTopLevelEdges(services.flat());
	return {
		id: 'system',
		layoutOptions: systemElkLayoutOptions,
		children,
		edges
	};
};

/**
 * Gets all ElkNodes recursively.
 * @param root Root of the ELK graph.
 * @returns List of all ElkNodes.
 */
export const getAllElkNodes = (root: ElkNode): ElkNode[] => {
	return root.children.flatMap((t) => getChildNodesRecursive(t));
};

/**
 * Makes the Elk ports based on input and output ports of a service.
 * @param service Service object to get the ports from
 * @param omitLocals true if ports with local location should be omitted.
 * @returns List of ElkPorts of the given service.
 */
export const getElkPorts = (service: Service, omitLocals = true): ElkPort[] => {
	const ports: ElkPort[] = [];
	service.inputPorts?.forEach((ip) => {
		if ((ip.location.startsWith('!local') || ip.location === 'local') && !service.parent) return;
		ports.push({
			id: `p${service.id}${service.name}-${ip.name}`,
			labels: [{ text: 'ip' }, { text: ip.name }],
			width: PORT_SIZE,
			height: PORT_SIZE
		});
	});
	service.outputPorts?.forEach((op) => {
		if ((op.location.startsWith('!local') || op.location === 'local') && omitLocals) return;
		ports.push({
			id: `p${service.id}${service.name}-${op.name}`,
			labels: [{ text: 'op' }, { text: op.name }],
			width: PORT_SIZE,
			height: PORT_SIZE
		});
	});
	return ports;
};

/**
 * Gets edges between a list of services.
 * @param services List of services
 * @returns List of edges between the list of services.
 */
export const getTopLevelEdges = (services: Service[]): ElkExtendedEdge[] => {
	const tle: ElkExtendedEdge[] = [];
	services.forEach((outputSvc) => {
		if (outputSvc.outputPorts === undefined || outputSvc.outputPorts.length === 0) return;
		services.forEach((inputSvc) => {
			if (
				inputSvc.id === outputSvc.id ||
				inputSvc.inputPorts === undefined ||
				inputSvc.inputPorts.length === 0 ||
				isDockerService(inputSvc)
			)
				return;

			outputSvc.outputPorts.forEach((op) => {
				inputSvc.inputPorts.forEach((ip) => {
					if (
						op.location === ip.location &&
						op.protocol === ip.protocol &&
						!(op.location.startsWith('local') && ip.location.startsWith('local'))
					) {
						tle.push({
							id: `e${outputSvc.id}${outputSvc.name}${op.name}-${inputSvc.id}${inputSvc.name}${ip.name}`,
							sources: [`p${outputSvc.id}${outputSvc.name}-${op.name}`],
							targets: [`p${inputSvc.id}${inputSvc.name}-${ip.name}`]
						});
					}
				});
			});
		});
	});

	return tle.concat(connectDockerPorts(services));
};

/**
 * Gets internal edges of a service. This can be edges to embedded service ports.
 * @param service Service object
 * @returns List of Elk edges
 */
export const getInternalEdges = (service: Service): ElkExtendedEdge[] => {
	const res: ElkExtendedEdge[] = [];
	service.outputPorts?.forEach((op) => {
		service.embeddings?.forEach((embed) => {
			embed.inputPorts?.forEach((ip) => {
				if (ip.location === op.location)
					res.push({
						id: `e${service.id}${service.name}${op.name}-${embed.id}${embed.name}${ip.name}`,
						sources: [`p${service.id}${service.name}-${op.name}`],
						targets: [`p${embed.id}${embed.name}-${ip.name}`]
					});
			});
		});
	});
	return res;
};

/**
 * Rerenders by rebuilding a service ElkNode by first finding the corresponding service object.
 * This function should be used with the exported rerender function.
 * @param serviceNode ElkNode of the service to be rerendered.
 * @param allSvcs List of all services
 */
const rerenderService = (serviceNode: ElkNode, allSvcs: Service[]): void => {
	const svc = allSvcs.find((t) => `${t.id}` === serviceNode.labels[1].text);
	if (!serviceNode.children[0].id.startsWith('!leaf')) {
		serviceNode.children.forEach((child) => {
			rerenderService(child, allSvcs);
		});
		_rerender(serviceNode, svc, false);
	} else {
		_rerender(serviceNode, svc, true);
	}
};

/**
 * Helper function for 'rerenderService'.
 * @param serviceNode Elk Node of the service.
 * @param service service object corresponding to the elk node
 * @param omitLocals true if embedded services should be omitted
 */
const _rerender = (serviceNode: ElkNode, service: Service, omitLocals: boolean): void => {
	serviceNode.id = `s${service.id}${service.name}`;
	serviceNode.ports = getElkPorts(service, omitLocals);
	serviceNode.edges = [];
	if (!omitLocals) {
		if (service.embeddings) serviceNode.edges.push(...getTopLevelEdges(service.embeddings));
		serviceNode.edges.push(...getInternalEdges(service));
	}
};

/**
 * Creates Elk Edges between ports from docker services and jolie services.
 * @param services List of services.
 * @returns List of Elk Edges between the services.
 */
const connectDockerPorts = (services: Service[]): ElkExtendedEdge[] => {
	const tle: ElkExtendedEdge[] = [];
	services.forEach((svc) => {
		if (!isDockerService(svc)) return;
		services.forEach((other) => {
			if (isDockerService(other) || svc.id === other.id) return;
			svc.inputPorts?.forEach((p) => {
				other.outputPorts?.forEach((op) => {
					if (op.location === p.location) {
						tle.push({
							id: `e${svc.id}${other.name}${op.name}-${svc.id}${svc.name}${p.name}`,
							sources: [`p${other.id}${other.name}-${op.name}`],
							targets: [`p${svc.id}${svc.name}-${p.name}`]
						});
					}
				});
				other.inputPorts?.forEach((op) => {
					if (op.location === p.location) {
						tle.push({
							id: `e${svc.id}${other.name}${op.name}-${svc.id}${svc.name}${p.name}`,
							sources: [`p${other.id}${other.name}-${op.name}`],
							targets: [`p${svc.id}${svc.name}-${p.name}`]
						});
					}
				});
			});
		});
	});
	return tle;
};

/**
 * Creates the Elk Nodes for top level services.
 * @param services List of top level services.
 * @returns List of Elk Nodes.
 */
const getTopLevelServices = (services: Service[]): ElkNode[] => {
	const tls: ElkNode[] = [];
	services.forEach((svc) => {
		tls.push({
			id: `s${svc.id}${svc.name}`,
			labels: [{ text: 'service' }, { text: `${svc.id}` }],
			ports: getElkPorts(svc),
			children: [{ id: '!leaf' }],
			layoutOptions: {
				'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
				portConstraints: 'UNDEFINED'
			}
		});
	});
	return tls;
};

/**
 * Recursively gets an ElkNode's children nodes which are services.
 * @param node ElkNode to get children of.
 * @param result List of previous recursive step results
 * @returns List of children ElkNodes
 */
const getChildNodesRecursive = (node: ElkNode, result: ElkNode[] = []): ElkNode[] => {
	result.push(node);
	node.children?.forEach((c) => {
		if (c.id === '!leaf') return;
		result.push(...getChildNodesRecursive(c));
	});
	return result;
};

/**
 * Creates network llk nodes.
 * @param services List of networks.
 * @returns List of elk nodes.
 */
const getNetworkNodes = (services: Service[][]): ElkNode[] => {
	const children: ElkNode[] = [];
	let count = 0;
	services.forEach((serviceList) => {
		children.push({
			id: `network${count}`,
			labels: [{ text: 'network' }],
			layoutOptions: networkElkLayoutOptions,
			children: getTopLevelServices(serviceList),
			edges: getTopLevelEdges(serviceList)
		});
		count++;
	});
	return children;
};
