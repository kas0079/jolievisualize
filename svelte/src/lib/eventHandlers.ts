import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk-api';
import { services } from './data';
import { getAllElkNodes, getElkPorts, getTopLevelEdges } from './graph';
import { getAllServices } from './service';

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
	if (!omitLocals) serviceNode.edges = getInternalEdges(service);
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

const getInternalEdges = (service: Service): ElkExtendedEdge[] => {
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
