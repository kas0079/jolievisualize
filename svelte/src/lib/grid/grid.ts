export const gridOptions = {
	gridSize: 14,
	gridWidth: 0,
	gridHeight: 0,
	minGridSize: 6,
	maxGridSize: 18,
	gridOffsetX: 5,
	gridOffsetY: 5,
	leftMargin: 5,
	topMargin: 5,
	leftOffset: 0,
	topOffset: 0,
	servicePadding: 2,
	cellPadding: 5
};

export class Point {
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.parent = null;
	}
	x: number;
	y: number;
	parent: Point | null;
	f = 0;
	g = 0;
	h = 0;
	closed = false;
	visited = false;
	isWall = false;
	cost = 0;
}

export let grid: { [key: string]: Point };

export const initGrid = () => {
	grid = {};
	for (
		let x: number = -(gridOptions.gridOffsetX * gridOptions.gridSize);
		x <= gridOptions.gridWidth + gridOptions.gridSize * gridOptions.gridOffsetX;
		x += gridOptions.gridSize
	)
		for (
			let y: number = -(gridOptions.gridOffsetY * gridOptions.gridSize);
			y <= gridOptions.gridHeight + gridOptions.gridSize * gridOptions.gridOffsetY;
			y += gridOptions.gridSize
		)
			grid[`${[x, y]}`] = new Point(x, y);
};

export const setGridSize = (width: number, height: number) => {
	const w = width + (gridOptions.leftMargin / 4) * gridOptions.gridSize;
	const h = height + (gridOptions.topMargin / 4) * gridOptions.gridSize;
	gridOptions.gridWidth = w;
	gridOptions.gridHeight = h;
};

export const getGridCoord = (x: number, y: number): Point => {
	return grid[`${[x, y]}`];
};

export const setGridWall = (x: number, y: number, bool = true) => {
	grid[`${[x, y]}`].isWall = bool;
};

export const getGridBox = (services: Service[]) => {
	let w: number = Number.NEGATIVE_INFINITY;
	let h: number = Number.NEGATIVE_INFINITY;
	services.forEach((svc) => {
		const height = svc.height;
		w = svc.x + gridOptions.gridSize * 18 > w ? svc.x + gridOptions.gridSize * 18 : w;
		h = svc.y + height > h ? svc.y + height : h;
	});
	return { w, h };
};
