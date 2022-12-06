import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk-api';
import { services } from './data';
import { getAllElkNodes, getElkPorts } from './graph';
import { getAllServices } from './service';

export const handleExpandServiceEvent = (event: CustomEvent, graph: ElkNode) => {
	// TODO zoom to bounding box https://observablehq.com/@d3/zoom-to-bounding-box
	// const service = services.flat().find((t) => t.id === event.detail.payload.serviceID);
	const service = getAllServices(services).find((t) => t.id === event.detail.serviceID);
	const serviceNode = getAllElkNodes(graph).find(
		(t) => t.id === event.detail.serviceName + event.detail.serviceID
	);
	// const serviceNode = graph.children
	// 	.find((t) => t.id === event.detail.networkID)
	// 	.children.find(
	// 		(t) => t.id === event.detail.payload.serviceName + event.detail.payload.serviceID
	// 	);

	serviceNode.children = [];
	serviceNode.ports = getElkPorts(service, false);
	serviceNode.edges = getInternalEdges(service);

	service.embeddings.forEach((embed) => {
		serviceNode.children.push({
			id: `${embed.name}${embed.id}`,
			labels: [{ text: 'service' }],
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
