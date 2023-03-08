import type { ElkExtendedEdge, ElkNode, ElkPort } from 'elkjs/lib/elk-api';
import { getAllServices, isDockerService } from './service';
import { services } from './data';

export const portSize = 5;

export const rerenderGraph = (graph: ElkNode) => {
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

export const createSystemGraph = (services: Service[][]): ElkNode => {
	const children = getNetworkNodes(services);
	const edges = getTopLevelEdges(services.flat());
	return {
		id: 'system',
		layoutOptions: {
			'elk.algorithm': 'layered',
			interactiveLayout: 'true',
			'elk.direction': 'RIGHT',
			'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
		},
		children,
		edges
	};
};

export const getAllElkNodes = (root: ElkNode): ElkNode[] => {
	return root.children.flatMap((t) => getChildNodesRecursive(t));
};

export const getElkPorts = (service: Service, omitLocals = true): ElkPort[] => {
	const ports: ElkPort[] = [];
	service.inputPorts?.forEach((ip) => {
		ports.push({
			id: `${service.name}${service.id}-${ip.name}`,
			labels: [{ text: 'ip' }, { text: ip.name }],
			width: portSize,
			height: portSize
		});
	});
	service.outputPorts?.forEach((op) => {
		if ((op.location.startsWith('!local') || op.location.startsWith('local')) && omitLocals) return;
		ports.push({
			id: `${service.name}${service.id}-${op.name}`,
			labels: [{ text: 'op' }, { text: op.name }],
			width: portSize,
			height: portSize
		});
	});
	return ports;
};

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
					if (op.location === ip.location && op.protocol === ip.protocol) {
						tle.push({
							id: `${outputSvc.name}${outputSvc.id}${op.name}-${inputSvc.name}${inputSvc.id}${ip.name}`,
							sources: [`${outputSvc.name}${outputSvc.id}-${op.name}`],
							targets: [`${inputSvc.name}${inputSvc.id}-${ip.name}`]
						});
					}
				});
			});
		});
	});

	return tle.concat(connectDockerPorts(services));
};

export const getInternalEdges = (service: Service): ElkExtendedEdge[] => {
	const res: ElkExtendedEdge[] = [];
	service.outputPorts?.forEach((op) => {
		service.embeddings?.forEach((embed) => {
			embed.inputPorts?.forEach((ip) => {
				if (ip.location === op.location)
					res.push({
						id: `${service.name}${service.id}${op.name}-${embed.name}${embed.id}${ip.name}`,
						sources: [`${service.name}${service.id}-${op.name}`],
						targets: [`${embed.name}${embed.id}-${ip.name}`]
					});
			});
		});
	});
	return res;
};

const rerenderService = (serviceNode: ElkNode, allSvcs: Service[]) => {
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

const _rerender = (serviceNode: ElkNode, service: Service, omitLocals: boolean) => {
	serviceNode.id = `${service.name}${service.id}`;
	serviceNode.ports = getElkPorts(service, omitLocals);
	serviceNode.edges = [];
	if (!omitLocals) {
		if (service.embeddings) serviceNode.edges.push(...getTopLevelEdges(service.embeddings));
		serviceNode.edges.push(...getInternalEdges(service));
	}
};

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
							id: `${svc.name}${other.id}${op.name}-${svc.name}${svc.id}${p.name}`,
							sources: [`${other.name}${other.id}-${op.name}`],
							targets: [`${svc.name}${svc.id}-${p.name}`]
						});
					}
				});
				other.inputPorts?.forEach((op) => {
					if (op.location === p.location) {
						tle.push({
							id: `${svc.name}${other.id}${op.name}-${svc.name}${svc.id}${p.name}`,
							sources: [`${other.name}${other.id}-${op.name}`],
							targets: [`${svc.name}${svc.id}-${p.name}`]
						});
					}
				});
			});
		});
	});
	return tle;
};

const getTopLevelServices = (services: Service[]): ElkNode[] => {
	const tls: ElkNode[] = [];
	services.forEach((svc) => {
		tls.push({
			id: `${svc.name}${svc.id}`,
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

const getChildNodesRecursive = (node: ElkNode, result: ElkNode[] = []): ElkNode[] => {
	result.push(node);
	node.children?.forEach((c) => {
		if (c.id === '!leaf') return;
		result.push(...getChildNodesRecursive(c));
	});
	return result;
};

const getNetworkPorts = (serviceList: Service[], networkName: string): ElkPort[] => {
	const ports: ElkPort[] = [];
	serviceList.forEach((svc) => {
		svc.inputPorts?.forEach((ip) => {
			if (ip.location.startsWith('!local')) return;
			ports.push({
				id: `${networkName}${svc.id}-${ip.name}`,
				labels: [{ text: 'ip' }, { text: ip.name }, { text: ip.location }],
				layoutOptions: {
					'port.side': 'NORTH'
				},
				width: portSize - 1,
				height: portSize - 1
			});
		});

		svc.outputPorts?.forEach((op) => {
			if (op.location.startsWith('!local')) return;
			ports.push({
				id: `${networkName}${svc.id}-${op.name}`,
				labels: [{ text: 'op' }, { text: op.name }, { text: op.location }],
				layoutOptions: {
					'port.side': 'SOUTH'
				},
				width: portSize - 1,
				height: portSize - 1
			});
		});
	});
	return ports;
};

const getEdgesToNetworkPorts = (
	serviceList: Service[],
	networkName: string,
	ports: ElkPort[]
): ElkExtendedEdge[] => {
	const res: ElkExtendedEdge[] = [];
	serviceList.forEach((svc) => {
		svc.inputPorts?.forEach((ip) => {
			if (ip.location.startsWith('!local')) return;
			const portNode = ports.find(
				(t) => t.labels[2].text === ip.location && t.labels[0].text === 'ip'
			);
			if (portNode === undefined) return;
			res.push({
				id: `${networkName}${svc.id}-${ip.name}IP`,
				sources: [portNode.id],
				targets: [`${svc.name}${svc.id}-${ip.name}`]
			});
		});
		svc.outputPorts?.forEach((op) => {
			if (op.location.startsWith('!local')) return;
			const portNode = ports.find(
				(t) => t.labels[2].text === op.location && t.labels[0].text === 'op'
			);
			if (portNode === undefined) return;
			res.push({
				id: `${networkName}${svc.id}-${op.name}OP`,
				sources: [portNode.id],
				targets: [`${svc.name}${svc.id}-${op.name}`]
			});
		});
	});
	return res;
};

const getNetworkNodes = (services: Service[][]): ElkNode[] => {
	const children: ElkNode[] = [];
	let count = 0;
	services.forEach((serviceList) => {
		const ports = getNetworkPorts(serviceList, `network${count}`);
		const portEdges = getEdgesToNetworkPorts(serviceList, `network${count}`, ports);
		children.push({
			id: `network${count}`,
			labels: [{ text: 'network' }],
			layoutOptions: {
				portConstraints: 'FIXED_SIDE',
				'elk.layered.mergeEdge': 'true',
				'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
			},
			children: getTopLevelServices(serviceList),
			// ports,
			edges: getTopLevelEdges(serviceList)
		});
		count++;
	});
	return children;
};
