import { services } from '../data/data';
import { gridOptions, setGridWall } from '../grid/grid';

export const serviceShapeOptions = {
	width: gridOptions.gridSize * 6,
	height: gridOptions.gridSize * 10
};

export const getServiceFromID = (id: number) => {
	return services.find((t) => t.id === id);
};

export const drawService = (svc: Service) => {
	const lineLen = serviceShapeOptions.width;
	const lineLenY = serviceShapeOptions.height;

	svc.center = [svc.x + lineLen / 2, svc.y + lineLenY / 2];

	let drawPath = `M${svc.x} ${svc.y} `;
	drawPath += `L${svc.x - lineLen / 2} ${svc.y + lineLenY / 2} `;
	drawPath += `L${svc.x} ${svc.y + lineLenY} `;
	drawPath += `L${svc.x + lineLen} ${svc.y + lineLenY} `;
	drawPath += `L${svc.x + lineLen + lineLen / 2} ${svc.y + lineLenY / 2} `;
	drawPath += `L${svc.x + lineLen} ${svc.y} Z`;

	setGridWall(svc.x, svc.y);
	setGridWall(svc.x, svc.y + lineLenY);
	setGridWall(svc.x + lineLen, svc.y + lineLenY);
	setGridWall(svc.x + lineLen + lineLen / 2, svc.y + lineLenY / 2);
	setGridWall(svc.x + lineLen, svc.y);

	return drawPath;
};
