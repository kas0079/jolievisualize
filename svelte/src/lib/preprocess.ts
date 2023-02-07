let p_services: Service[][];
let p_interfaces: Interface[];
let p_types: Type[];

export const preprocess = (json: Data): Data => {
	p_services = json.services;
	p_interfaces = json.interfaces;
	p_types = json.types;

	p_services.forEach((serviceList) => {
		serviceList.forEach((service) => {
			if (service.embeddings) {
				connectEmbeds(service);
				connectEmbedOutputPorts(service);
			}
			if (service.outputPorts) {
				connectRedirectResources(service.outputPorts);
				joinOutputPortArrows(service);
			}
		});
	});

	return {
		name: json.name ?? undefined,
		services: p_services,
		interfaces: p_interfaces,
		types: p_types
	};
};

const joinOutputPortArrows = (service: Service): void => {
	const list: Port[] = [];
	service.outputPorts?.forEach((p) => {
		const otherPorts = service.outputPorts?.filter(
			(p2) => p.name !== p2.name && p.location === p2.location
		);
		if (!otherPorts || otherPorts?.length === 0) return;
		otherPorts.forEach((op) => list.push(op));
	});
	list.splice(0, 1);
	if (list.length == 0) return;
};

const connectRedirectResources = (outputPorts: Port[]): void => {
	if (outputPorts.find((p) => p.location.includes('/!/')) === undefined) return;

	outputPorts.forEach((p) => {
		if (!p.location.includes('/!/')) return;
		const url = p.location.split('/!/');
		p.location = url[0];
		p.resource = url[1];
	});
};

const connectEmbedOutputPorts = (service: Service): void => {
	let newListOfOPs: Port[] = service.outputPorts;
	let embeds: Port[] = [];
	service.embeddings?.forEach((embed) => {
		newListOfOPs = newListOfOPs.filter((t) => t.name !== embed.name);
		const corrOutputPort = service.outputPorts?.find((t) => embed.name === t.name);
		if (corrOutputPort === undefined) return;
		embeds.push(corrOutputPort);
	});
	service.outputPorts = embeds.concat(newListOfOPs);
};

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

		corrOutputPort.location = `!local_${embed.name}${embed.id}`;
		corrInputPort.location = `!local_${embed.name}${embed.id}`;
	});
};

const sharesInterface = (p1: Port, p2: Port): boolean => {
	if (p1.interfaces === undefined && p2.interfaces === undefined) return true;
	const listP1 = p1.interfaces.flatMap((t) => t.name);
	const listP2 = p2.interfaces.flatMap((t) => t.name);
	for (let i = 0; i < listP1.length; i++)
		for (let j = 0; j < listP2.length; j++) if (listP1[i] === listP2[j]) return true;
	return false;
};
