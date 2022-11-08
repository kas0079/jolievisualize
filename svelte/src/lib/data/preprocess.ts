import { gridOptions, initGrid, setGridSize } from '../grid/grid';
import { serviceShapeOptions } from '../system/service';

let p_services: Service[];
let p_interfaces: Interface[];
let p_types: Type[];

let prevGS = 0;

export const preprocess = (json: Data): Data => {
	p_services = json.services;
	p_interfaces = json.interfaces;
	p_types = json.types;

	p_services.forEach((service) => {
		if (service.embeddings) {
			connectEmbeds(service);
			connectEmbedOutputPorts(service);
		}
		if (service.outputPorts) {
			connectRedirectResources(service.outputPorts);
			joinOutputPortArrows(service);
		}
	});

	return {
		name: json.name ?? undefined,
		placegraph: json.placegraph,
		services: p_services,
		interfaces: p_interfaces,
		types: p_types
	};
};

export const setServicePosition = (
	services: Service[],
	categories: { svc: Service; category: number }[]
) => {
	const startArray = countEntries(categories.flatMap((t) => t.category));
	const countArray = countEntries(categories.flatMap((t) => t.category));
	categories.forEach((cat) => {
		if (cat.svc.x === undefined)
			cat.svc.x =
				gridOptions.leftOffset * gridOptions.gridSize +
				cat.category * (gridOptions.leftMargin * gridOptions.gridSize);
		else if (prevGS > 0) cat.svc.x = (cat.svc.x / prevGS) * gridOptions.gridSize;

		if (cat.svc.y === undefined)
			cat.svc.y =
				gridOptions.topOffset * gridOptions.gridSize +
				gridOptions.topMargin *
					gridOptions.gridSize *
					(startArray[cat.category] - countArray[cat.category]);
		else if (prevGS > 0) cat.svc.y = (cat.svc.y / prevGS) * gridOptions.gridSize;
		countArray[cat.category]--;
	});
	const dim = getGridBox(services);
	setGridSize(dim.w, dim.h);
	prevGS = 0;
	initGrid();
};

const getGridBox = (services: Service[]) => {
	let w: number = Number.NEGATIVE_INFINITY;
	let h: number = Number.NEGATIVE_INFINITY;
	services.forEach((svc) => {
		const height = serviceShapeOptions.height;
		w = svc.x + gridOptions.gridSize * 18 > w ? svc.x + gridOptions.gridSize * 18 : w;
		h = svc.y + height > h ? svc.y + height : h;
	});
	return { w, h };
};

const countEntries = (list: number[]) => {
	const result: number[] = [];
	list.forEach((i) => {
		if (isNaN(result[i])) result[i] = -1;
		result[i]++;
	});
	return result;
};

export const categorize = (services: Service[]) => {
	const categoryList: { svc: Service; category: number }[] = [];
	const totalLength = services.length * 2;
	let tmp_list = services;
	let count = 1;
	while (tmp_list.length > 0) {
		tmp_list = categorizeServices(tmp_list, categoryList, count);
		count += totalLength;
	}
	return normalizeRange(categoryList.sort((a, b) => a.category - b.category));
};

const normalizeRange = (list: { svc: Service; category: number }[]) => {
	let count = -1;
	let last = Number.NEGATIVE_INFINITY;
	list.forEach((i) => {
		if (i.category !== last) count++;
		last = i.category;
		i.category = count;
	});
	return list;
};

const categorizeServices = (
	services: Service[],
	categoryList: { svc: Service; category: number }[],
	count: number
) => {
	const max_column_size = 4;
	const pivot = getPivotElement(services);
	categoryList.push({ svc: pivot, category: count });
	let svcs = services.filter((t) => t.name !== pivot.name);
	getIncomingServices(pivot, svcs).forEach((inc) => {
		categoryList.push({ svc: inc, category: count + 1 });
		svcs = svcs.filter((t) => t.name !== inc.name);
	});
	getOutgoingServices(pivot, svcs).forEach((out) => {
		if (
			categoryList.flatMap((t) => t.category).filter((t) => t == count - 1).length < max_column_size
		)
			categoryList.push({ svc: out, category: count - 1 });
		else categoryList.push({ svc: out, category: count - services.length });
		svcs = svcs.filter((t) => t.name !== out.name);
	});
	return svcs;
};

const getOutgoingServices = (svc: Service, svcList: Service[]) => {
	const list: Service[] = [];
	svc.outputPorts?.forEach((op) => {
		svcList.forEach((s) => {
			s.inputPorts?.forEach((ip) => {
				if (ip.location === op.location)
					if (!list.flatMap((t) => t.name).includes(s.name)) list.push(s);
			});
		});
	});
	return list;
};

const getIncomingServices = (svc: Service, svcList: Service[]): Service[] => {
	const list: Service[] = [];
	svc.inputPorts?.forEach((ip) => {
		svcList.forEach((s) => {
			s.outputPorts?.forEach((op) => {
				if (ip.location === op.location)
					if (!list.flatMap((t) => t.name).includes(s.name)) list.push(s);
			});
		});
	});
	return list;
};

const getPivotElement = (svcs: Service[]): Service => {
	let pivot = svcs[0];
	svcs.forEach((svc) => {
		const cmp =
			(pivot.inputPorts === undefined ? -10 : pivot.inputPorts.length) +
			(pivot.outputPorts === undefined ? -10 : pivot.outputPorts.length);
		if (
			cmp <
			(svc.inputPorts === undefined ? -10 : svc.inputPorts.length) +
				(svc.outputPorts === undefined ? -10 : svc.outputPorts.length)
		) {
			pivot = svc;
		}
	});
	return pivot;
};

const joinOutputPortArrows = (service: Service) => {
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
	list.forEach((p) => {
		p.cost = false;
	});
};

const connectRedirectResources = (outputPorts: Port[]) => {
	if (outputPorts.find((p) => p.location.includes('/!/')) === undefined) return;

	outputPorts.forEach((p) => {
		if (!p.location.includes('/!/')) return;
		const url = p.location.split('/!/');
		p.location = url[0];
		p.resource = url[1];
	});
};

const connectEmbedOutputPorts = (service: Service) => {
	let newListOfOPs: Port[] = service.outputPorts;
	let embeds: Port[] = [];
	service.embeddings?.forEach((embed) => {
		newListOfOPs = newListOfOPs.filter((t) => t.name !== embed.port);
		const corrOutputPort = service.outputPorts?.find((t) => embed.port === t.name);
		if (corrOutputPort === undefined) return;
		embeds.push(corrOutputPort);
	});
	service.outputPorts = embeds.concat(newListOfOPs);
};

const connectEmbeds = (service: Service) => {
	if (service.embeddings === undefined) return;
	service.embeddings.forEach((embed) => {
		const corrOutputPort = service.outputPorts?.find((t) => embed.port === t.name);
		if (corrOutputPort === undefined) return;

		const embeddedService = p_services.find((s) => s.name === embed.name);
		if (embeddedService === undefined) return;

		const corrInputPort = embeddedService.inputPorts?.find(
			(t) =>
				t.location === 'local' ||
				(t.location == corrOutputPort.location && sharesInterface(t, corrOutputPort))
		);
		if (corrInputPort === undefined) return;

		corrOutputPort.location = `!local_${embed.name}`;
		corrInputPort.location = `!local_${embed.name}`;

		embeddedService.embeddingType = embed.type;
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
