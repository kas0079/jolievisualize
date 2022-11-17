import { drawService } from '../system/service';
import { Point, gridOptions, getGridCoord, grid } from './grid';

class PQElement {
	constructor(element: Point, priority: number) {
		this.element = element;
		this.priority = priority;
	}
	element: Point;
	priority: number;
}

class PriorityQueue {
	constructor() {
		this.items = [];
	}
	items: PQElement[];

	enqueue(item: Point, priority: number): void {
		const qElement: PQElement = new PQElement(item, priority);
		let contain: boolean = false;

		for (let i: number = 0; i < this.items.length; i++) {
			if (this.items[i].priority > qElement.priority) {
				this.items.splice(i, 0, qElement);
				contain = true;
				break;
			}
		}
		if (!contain) this.items.push(qElement);
	}

	dequeue(): Point | undefined {
		if (this.isEmpty()) return undefined;
		const resE = this.items.shift();
		return resE?.element;
	}

	isEmpty(): boolean {
		return this.items.length == 0;
	}

	front(): PQElement | undefined {
		if (this.isEmpty()) return undefined;
		return this.items[0];
	}

	remove(item: Point): void {
		this.items = this.items.filter((i: PQElement) => i.element != item);
	}

	rescore(item: Point, priority: number) {
		this.remove(item);
		this.enqueue(item, priority);
	}
}

const manhattenHeuristic = (src: Point, dest: Point): number => {
	return Math.abs(src.x - dest.x) + Math.abs(src.y - dest.y);
};

const diagonalHeuristic = (src: Point, dest: Point): number => {
	//Octile distance:
	const D: number = 1;
	const D2: number = Math.sqrt(2);
	const dx: number = Math.abs(src.x - dest.x);
	const dy: number = Math.abs(src.y - dest.y);
	return D * Math.max(dx, dy) + (D2 - D) * Math.min(dx, dy);
};

const euclidianHeuristic = (src: Point, dest: Point): number => {
	return (
		Math.sqrt(Math.pow(src.x, 2) - Math.pow(dest.x, 2)) +
		Math.sqrt(Math.pow(src.y, 2) - Math.pow(dest.y, 2))
	);
};

export const makeCoordArray = (listOfPoints: Point[]): number[][] => {
	let res: number[][] = [];
	listOfPoints.forEach((p: Point) => {
		res.push([p.x, p.y]);
	});
	return res;
};

const getNeightbours = (node: Point): Point[] => {
	const neighbours: Point[] = [];
	const gridSize = gridOptions.gridSize;
	if (getGridCoord(node.x, node.y - gridSize) && !getGridCoord(node.x, node.y - gridSize).isWall)
		neighbours.push(getGridCoord(node.x, node.y - gridSize)); // N

	if (getGridCoord(node.x, node.y + gridSize) && !getGridCoord(node.x, node.y + gridSize).isWall)
		neighbours.push(getGridCoord(node.x, node.y + gridSize)); // S

	if (getGridCoord(node.x - gridSize, node.y) && !getGridCoord(node.x - gridSize, node.y).isWall)
		neighbours.push(getGridCoord(node.x - gridSize, node.y)); // W
	if (getGridCoord(node.x + gridSize, node.y) && !getGridCoord(node.x + gridSize, node.y).isWall)
		neighbours.push(getGridCoord(node.x + gridSize, node.y)); // E
	if (
		getGridCoord(node.x - gridSize, node.y - gridSize) &&
		!getGridCoord(node.x - gridSize, node.y - gridSize).isWall
	)
		neighbours.push(getGridCoord(node.x - gridSize, node.y - gridSize)); //NW
	if (
		getGridCoord(node.x - gridSize, node.y + gridSize) &&
		!getGridCoord(node.x - gridSize, node.y + gridSize).isWall
	)
		neighbours.push(getGridCoord(node.x - gridSize, node.y + gridSize)); //SW
	if (
		getGridCoord(node.x + gridSize, node.y + gridSize) &&
		!getGridCoord(node.x + gridSize, node.y + gridSize).isWall
	)
		neighbours.push(getGridCoord(node.x + gridSize, node.y + gridSize)); //SE
	if (
		getGridCoord(node.x + gridSize, node.y - gridSize) &&
		!getGridCoord(node.x + gridSize, node.y - gridSize).isWall
	)
		neighbours.push(getGridCoord(node.x + gridSize, node.y - gridSize)); //NE
	return neighbours;
};

export const aStarSearch = (src: Point, dest: Point, cost = true): Point[] => {
	let openList = new PriorityQueue();
	openList.enqueue(src, src.f);

	while (!openList.isEmpty()) {
		let currentNode = openList.dequeue();
		if (currentNode != undefined) {
			if (currentNode.x == dest.x && currentNode.y == dest.y) {
				let curr = currentNode;
				let ret: Point[] = [];
				while (curr.parent) {
					if (cost) curr.cost = 5;
					ret.push(curr);
					curr = curr.parent;
				}
				ret.push(src);
				resetAStarGrid();
				return ret.reverse();
			}

			currentNode.closed = true;
			let neighbours = getNeightbours(currentNode);

			neighbours.forEach((n) => {
				// if neighbour is closed or wall:
				if (n.closed || currentNode == undefined) return;

				let gScore = currentNode.g + n.cost;
				let beenVisited = n.visited;

				if (!beenVisited || gScore < n.g) {
					n.visited = true;
					n.parent = currentNode;
					n.h = diagonalHeuristic(n, dest);
					n.g = gScore;
					n.f = n.g + n.h;

					if (!beenVisited) {
						openList.enqueue(n, 0);
					} else {
						openList.rescore(n, n.f);
					}
				}
			});
		}
	}
	resetAStarGrid();
	return [];
};

export const resetAStarGrid = () => {
	for (let x = 0; x < gridOptions.gridWidth; x += gridOptions.gridSize) {
		for (let y = 0; y < gridOptions.gridHeight; y += gridOptions.gridSize) {
			grid[`${[x, y]}`].f = 0;
			grid[`${[x, y]}`].h = 0;
			grid[`${[x, y]}`].g = 0;
			grid[`${[x, y]}`].visited = false;
			grid[`${[x, y]}`].parent = null;
			grid[`${[x, y]}`].closed = false;
		}
	}
};

export const drawPath = (
	path: number[][],
	arrow_thickness: number,
	marker_size: number,
	colour: string,
	doubleArrow = false,
	dotted = false,
	curved = true
) => {
	const arrowPoints = [
		[0, 0],
		[0, marker_size],
		[marker_size, marker_size / 2]
	];
	const refX = marker_size;
	const refY = refX / 2;
	const svg = d3.select('main').append('svg');
	const curve = d3.line().curve(curved ? d3.curveBasis : d3.curveLinear);

	svg
		.attr('class', 'arrow_svg')
		.style('position', 'absolute')
		.style('overflow', 'visible')
		.style('width', 1)
		.style('height', 1)
		.style('top', 0)
		.style('left', 0);
	svg
		.append('defs')
		.append('marker')
		.attr('id', `arrow_${colour}`)
		.attr('viewBox', [0, 0, marker_size, marker_size])
		.attr('refX', refX)
		.attr('refY', refY)
		.attr('markerWidth', marker_size)
		.attr('markerHeight', marker_size)
		.attr('orient', 'auto-start-reverse')
		.attr('stroke', colour)
		.append('path')
		.attr('stroke-width', arrow_thickness)
		.attr('stroke', colour)
		.attr('fill', colour)
		.attr('d', d3.line()(arrowPoints) + ' Z');

	const arrow = svg
		.append('path')
		.attr('d', curve(path))
		.style('stroke-dasharray', dotted ? '3,3' : '')
		.attr('stroke', colour)
		.attr('marker-end', marker_size > 0 ? `url(#arrow_${colour})` : '')
		.attr('marker-start', doubleArrow ? `url(#arrow_${colour})` : '')
		.attr('fill', 'none');
	return arrow;
};

export const findFirstIntersectionBetweenPaths = (paths: Point[][]): Point | undefined => {
	const result = paths.reduce((a, b) => a.filter((c) => b.includes(c)));
	return result[0];
};

export const findPathServiceShapeIntersection = (
	path: number[][],
	input: Service,
	output: Service
) => {
	const serviceLines = [...getLinesFromServiceShape(output), ...getLinesFromServiceShape(input)];
	const pathLines = getLinesFromPath(path);
	const res: number[][] = [];
	for (let i = 0; i < pathLines.length; i++) {
		for (let j = 0; j < serviceLines.length; j++) {
			const int = lineLineIntersection(pathLines[i], serviceLines[j]);
			if (int !== false) {
				res.push([int.x, int.y]);
				break;
			}
		}
	}
	return res;
};

const lineLineIntersection = (
	line1: { x1: number; x2: number; y1: number; y2: number },
	line2: { x1: number; x2: number; y1: number; y2: number }
) => {
	const x1 = line1.x1,
		x2 = line1.x2,
		x3 = line2.x1,
		x4 = line2.x2;
	const y1 = line1.y1,
		y2 = line1.y2,
		y3 = line2.y1,
		y4 = line2.y2;
	const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	const x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
	const y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
	if (denom !== 0) {
		const point = new Point(x / denom, y / denom);
		if (
			between(point.x, x1, x2) &&
			between(point.y, y1, y2) &&
			between(point.x, x3, x4) &&
			between(point.y, y3, y4)
		) {
			return point;
		}
	}
	return false;
};

const between = (a: number, b1: number, b2: number) => {
	if (a >= b1 && a <= b2) {
		return true;
	}
	if (a >= b2 && a <= b1) {
		return true;
	}
	return false;
};

const getLinesFromPath = (path: number[][]) => {
	const res: { x1: number; x2: number; y1: number; y2: number }[] = [];
	for (let i = 0; i < path.length - 1; i++) {
		const p1 = path[i];
		const p2 = path[i + 1];
		res.push({ x1: p1[0], x2: p2[0], y1: p1[1], y2: p2[1] });
	}
	return res;
};

const getLinesFromServiceShape = (svc: Service) => {
	const res: { x1: number; x2: number; y1: number; y2: number }[] = [];
	const height = svc.height;
	const width = svc.width;
	const x = svc.x;
	const y = svc.y;

	res.push({ x1: x, x2: x + width / 2, y1: y + height / 2, y2: y + height });
	res.push({ x2: x + width / 2 + width, x1: x + width / 2, y2: y + height, y1: y + height });
	res.push({ x1: x + width / 2 + width, x2: x + width * 2, y1: y + height, y2: y + height / 2 });
	res.push({ x2: x + width / 2 + width, x1: x + width * 2, y2: y, y1: y + height / 2 });
	res.push({ x1: x + width / 2 + width, x2: x + width / 2, y1: y, y2: y });
	res.push({ x2: x, x1: x + width / 2, y2: y + height / 2, y1: y });
	return res;
};
