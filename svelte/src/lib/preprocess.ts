let p_services: Service[][];
let p_interfaces: Interface[];
let p_types: Type[];

/**
 * Preprocesses the input data. Embedded services will be correctly and uniquely connected to a parent local port
 * Redirections are also handled, as well as docker ports.
 * @param json input json data.
 * @returns processed json data object.
 */
export const preprocess = (json: Data): Data => {
	p_services = json.services;
	p_interfaces = json.interfaces;
	p_types = json.types;

	p_services.forEach((serviceList) => {
		serviceList.forEach((service) => {
			if (service.embeddings) {
				connectEmbeds(service);
			}
			if (service.outputPorts) {
				connectRedirectResources(service.outputPorts);
			}
			if (service.image && service.ports && !service.file) makeDockerPorts(service);
		});
	});

	return {
		name: json.name ?? undefined,
		services: p_services,
		interfaces: p_interfaces,
		types: p_types
	};
};

/**
 * Converts docker ports to the correct port object and pushes it to the service inputports.
 * @param service Docker Service
 */
const makeDockerPorts = (service: Service): void => {
	service.inputPorts = [];
	service.ports.forEach((dp) => {
		service.inputPorts.push({
			file: undefined,
			interfaces: [],
			location: `socket://localhost:${dp.eport}`,
			name: `${service.name}_${dp.eport}`,
			protocol: 'sodep'
		});
	});
};

/**
 * Handles redirect locations by setting the ports resource attribute and
 * setting the location correctly so the correct ports gets connected
 * @param outputPorts List of outputPorts
 */
const connectRedirectResources = (outputPorts: Port[]): void => {
	if (outputPorts.find((p) => p.location.includes('/!/')) === undefined) return;

	outputPorts.forEach((p) => {
		if (!p.location.includes('/!/')) return;
		const url = p.location.split('/!/');
		p.location = url[0];
		p.resource = url[1];
	});
};

/**
 * Connects embedding input ports with a corresponding parent local output port.
 * @param service Parent service
 */
const connectEmbeds = (service: Service): void => {
	if (service.embeddings === undefined) return;
	service.embeddings.forEach((embed) => {
		connectEmbeds(embed);

		const corrOutputPort = service.outputPorts?.find((t) => embed.parentPort === t.name);
		if (corrOutputPort === undefined) return;
		embed.parent = service;

		const corrInputPort = embed.inputPorts?.find(
			(t) => t.location === 'local' && sharesInterface(t, corrOutputPort)
		);
		if (corrInputPort === undefined) return;

		corrOutputPort.location = `!local_${embed.id}${embed.name}`;
		corrInputPort.location = `!local_${embed.id}${embed.name}`;
	});
};

/**
 * Checks if two ports shares the same interfaces.
 * @param p1 Port
 * @param p2 Port
 * @returns true if both ports shares the same interfaces.
 */
const sharesInterface = (p1: Port, p2: Port): boolean => {
	if (p1.interfaces === undefined && p2.interfaces === undefined) return true;
	const listP1 = p1.interfaces.flatMap((t) => t.name);
	const listP2 = p2.interfaces.flatMap((t) => t.name);
	for (let i = 0; i < listP1.length; i++)
		for (let j = 0; j < listP2.length; j++) if (listP1[i] === listP2[j]) return true;
	return false;
};
