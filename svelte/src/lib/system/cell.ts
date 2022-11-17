import { services } from '../data/data';
import { getGridCoord, gridOptions } from '../grid/grid';
import { aStarSearch, makeCoordArray } from '../grid/pathFinding';
import { getServiceFromID } from './service';

export const renderCell = (node: pgNode) => {
	const internalServices: Service[] = [];
	node.nodes.forEach((n) => {
		if (n.type === 'service') internalServices.push(getServiceFromID(n.id, services));
	});
	const dims = getCellDimension(internalServices);
	return node.type == 'network' ? drawNetworkCell(dims) : drawServiceCell(dims);
};

export const createPathBetweenServices = (services: Service[]) => {
	const res: { input: Service; ip: Port; op: Port; output: Service; path: number[][] }[] = [];
	services.forEach((svc) => {
		if (svc.outputPorts.length == 0) return;
		svc.outputPorts?.forEach((op) => {
			if (op.location === 'local' || op.location === 'none') return;
			services.forEach((svc2) => {
				if (svc2.inputPorts?.length == 0 || svc2.id === svc.id) return;
				svc2.inputPorts?.forEach((ip) => {
					if (ip.location !== op.location || ip.location === 'local' || ip.location === 'none')
						return;
					const path = aStarSearch(svc.center, svc2.center);
					const coordArray = makeCoordArray(path);
					if (coordArray.length === 0) return;
					res.push({
						input: svc2,
						ip,
						output: svc,
						op,
						path: coordArray
					});
				});
			});
		});
	});
	return res;
};

export const findIntersection = (path: number[][], svc: Service, svc2: Service) => {};

const drawServiceCell = (dims: { x: number; y: number; w: number; h: number }) => {
	const padding = gridOptions.cellPadding * gridOptions.gridSize;
	const x = dims.x - padding;
	const w = (dims.w + padding) / 2;
	const y = dims.y - padding * 2;
	const h = dims.h + padding * 2;
	return `M${x - padding} ${y + h / 2} L${x + padding} ${y + h} L${x + w / 2 + w} ${y + h} L${
		x + w * 2
	} ${y + h / 2} L${x + w / 2 + w} ${y} L${x + padding} ${y} Z`;
};

const drawNetworkCell = (dims: { x: number; y: number; w: number; h: number }) => {
	const padding = gridOptions.cellPadding * gridOptions.gridSize;
	const x = dims.x - padding;
	const y = dims.y - padding;
	const w = dims.w + padding;
	const h = dims.h + padding;
	return `M${x + 2} ${y + 2} L${x + 2} ${h - 1} L${w - 1} ${h - 1} L${w - 1} ${y + 2} Z`;
};

const getCellDimension = (services: Service[]) => {
	let rectX = Number.POSITIVE_INFINITY;
	let rectY = Number.POSITIVE_INFINITY;
	let rectW = Number.NEGATIVE_INFINITY;
	let rectH = Number.NEGATIVE_INFINITY;
	services.forEach((svc) => {
		if (svc.x < rectX) rectX = svc.x;
		if (svc.y < rectY) rectY = svc.y;
		const height = svc.height + svc.y;
		if (height > rectH) rectH = height;
		const width = svc.width * 2 + svc.x;
		if (width > rectW) rectW = width;
	});
	return {
		x: rectX,
		y: rectY,
		w: rectW,
		h: rectH
	};
};
