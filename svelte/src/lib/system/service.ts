import { getGridBox, gridOptions, Point, setGridSize, setGridWall } from '../grid/grid';
import { countEntries } from '../utils/utils';

export const getServiceFromID = (id: number, services: Service[]) => {
	return services.find((t) => t.id === id);
};

export const sizeServices = (svcs: Service[]) => {
	svcs.forEach((svc) => {
		svc.height = gridOptions.gridSize * 10;
		svc.width = gridOptions.gridSize * 6;
	});
};

export const setServicePosition = (services: Service[], node: pgNode, overwrite = false) => {
	const categories = categorize(services);
	setOffsets(node);
	const startArray = countEntries(categories.flatMap((t) => t.category));
	const countArray = countEntries(categories.flatMap((t) => t.category));
	categories.forEach((cat) => {
		if (cat.svc.x === undefined || overwrite)
			cat.svc.x =
				gridOptions.leftOffset * gridOptions.gridSize +
				cat.category * (cat.svc.width * 2 + gridOptions.leftMargin * gridOptions.gridSize);

		if (cat.svc.y === undefined || overwrite)
			cat.svc.y =
				gridOptions.topOffset * gridOptions.gridSize +
				(cat.svc.height + gridOptions.topMargin * gridOptions.gridSize) *
					(startArray[cat.category] - countArray[cat.category]);

		cat.svc.center = new Point(cat.svc.x + (cat.svc.width * 2) / 2, cat.svc.y + cat.svc.height / 2);
		countArray[cat.category]--;
	});
	const dim = getGridBox(services);
	setGridSize(dim.w, dim.h);
};

export const drawService = (svc: Service) => {
	const width = svc.width;
	const height = svc.height;
	const x = gridOptions.servicePadding * gridOptions.gridSize;
	const y = gridOptions.servicePadding * gridOptions.gridSize;

	let drawPath = `M${x} ${y + height / 2} L${x + width / 2} ${y + height} L${
		x + width / 2 + width
	} ${y + height} L${x + width * 2} ${y + height / 2} L${x + width / 2 + width} ${y} L${
		x + width / 2
	} ${y} Z`;

	const gs = gridOptions.gridSize;
	setGridWall(svc.x, svc.y + height / 2);
	setGridWall(svc.x + gs, svc.y + height / 2);
	setGridWall(svc.x + width / 2, svc.y + height);
	setGridWall(svc.x + width / 2, svc.y);
	setGridWall(svc.x + width / 2 + width, svc.y + height);
	setGridWall(svc.x + width / 2 + width, svc.y);
	setGridWall(svc.x + width * 2, svc.y + height / 2);
	setGridWall(svc.x + width * 2 - gs, svc.y + height / 2);

	return drawPath;
};

const setOffsets = (node: pgNode) => {
	if (node.type !== 'service') {
		gridOptions.leftOffset += gridOptions.cellPadding + 1;
		gridOptions.topOffset += gridOptions.cellPadding + 1;
	} else {
		gridOptions.topOffset = gridOptions.cellPadding * 2 + 1;
		gridOptions.leftOffset = gridOptions.cellPadding * 2 + 1;
	}
	// const numberOfCategories = new Set(categories.flatMap((t) => t.category)).size;
	// const servicesWidths = categories.flatMap(
	// 	(t) => t.svc.width * 2 + gridOptions.servicePadding * 2
	// );
	// const serviceHeights = categories.flatMap((t) => t.svc.height + gridOptions.servicePadding * 2);
	// gridOptions.leftOffset =
	// 	(numberOfCategories * (servicesWidths.reduce((t) => t) + gridOptions.leftMargin)) /
	// 	gridOptions.gridSize;
	// gridOptions.topOffset =
	// 	(numberOfCategories * (serviceHeights.reduce((t) => t) + gridOptions.topMargin)) /
	// 	gridOptions.gridSize;
};

const categorize = (services: Service[]) => {
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
				if (ip.location === op.location && !op.location.startsWith('!local'))
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
				if (ip.location === op.location && !ip.location.startsWith('!local'))
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
