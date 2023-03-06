import { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk-api';
import { portSize } from './graph';
import { tick } from 'svelte';

export const drawNetwork = (network: ElkNode): void => {
	d3.select(`#${network.id}`).attr('transform', `translate(${network.x}, ${network.y})`);
	d3.select(`#${network.id} > rect`)
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', network.width)
		.attr('height', network.height);
};

export const drawEdge = (edge: ElkExtendedEdge): void => {
	let drawPath = `M${edge.sections[0].startPoint.x},${edge.sections[0].startPoint.y} `;
	edge.sections.forEach((s) => {
		if (s.bendPoints) s.bendPoints.forEach((bp) => (drawPath += `L${bp.x},${bp.y} `));
		drawPath += `L${s.endPoint.x},${s.endPoint.y} `;
	});

	d3.select(`#${edge.id}`).attr('d', drawPath);
};

export const drawService = (serviceNode: ElkNode, serviceName: string, expanded: boolean): void => {
	serviceNode.x = serviceNode.x ?? 0;
	serviceNode.y = serviceNode.y ?? 0;
	serviceNode.width = serviceNode.width ?? 0;
	serviceNode.height = serviceNode.height ?? 0;

	const w = serviceNode.width / 2;
	const h = serviceNode.height;
	const sideOffset = Math.min(w / 4, portSize - 1);

	d3.select(`#${serviceNode.id}`).attr(
		'transform',
		`translate(${serviceNode.x}, ${serviceNode.y})`
	);
	d3.select(`#${serviceNode.id} > polygon`)
		.attr(
			'points',
			`${-sideOffset},${h / 2} ${0},${h} ${w * 2},${h} ${w * 2 + sideOffset},${h / 2} ${
				w * 2
			},${0} ${0},${0}`
		)
		.on('mouseover', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.8');
		})
		.on('mouseleave', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.4');
		});

	d3.select(`#${serviceNode.id} > text`)
		.attr('y', expanded ? 5 : h / 2 + 1)
		.attr('text-anchor', 'middle')
		.attr('x', w)
		.text(serviceName)
		.style('font', '4px sans-serif')
		.on('mouseover', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.8');
		})
		.on('mouseleave', () => {
			d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.4');
		});

	let isNameTooLong = isTextTooLong(
		document.querySelector(`#${serviceNode.id} > text`),
		document.querySelector(`#${serviceNode.id} > polygon`),
		serviceName
	);
	while (isNameTooLong) {
		const txt = d3.select(`#${serviceNode.id} > text`).text() as string;
		d3.select(`#${serviceNode.id} > text`).text(txt.substring(0, txt.length - 4) + '...');
		isNameTooLong = isTextTooLong(
			document.querySelector(`#${serviceNode.id} > text`),
			document.querySelector(`#${serviceNode.id} > polygon`),
			serviceName
		);
	}
};

export const drawGhostNodeOnDrag = (
	serviceNode: ElkNode,
	e: MouseEvent,
	startX: number,
	startY: number
): void => {
	const polygon = document.querySelector('#' + serviceNode.id).children[0];
	const text = document.querySelector('#' + serviceNode.id + ' > text');
	const rect = polygon.getBoundingClientRect();

	const scaleFull = document.querySelector('svg > g').getAttribute('transform');
	const scale = +scaleFull.substring(scaleFull.indexOf('scale(') + 6, scaleFull.length - 1);

	const sx = (rect.left + e.pageX - startX) / scale;
	const sy = (rect.top + e.pageY - startY) / scale;

	const ghostPoly = document.querySelector('#tmp > polygon');
	ghostPoly.setAttribute('points', polygon.getAttribute('points'));
	ghostPoly.setAttribute('class', polygon.getAttribute('class'));
	ghostPoly.setAttribute('style', `stroke-width: 0.4; opacity: 0.6;`);

	const ghostText = document.querySelector('#tmp > text');
	ghostText.setAttribute('class', text.getAttribute('class'));
	ghostText.setAttribute('style', text.getAttribute('style'));
	ghostText.setAttribute('x', text.getAttribute('x'));
	ghostText.setAttribute('y', text.getAttribute('y'));
	ghostText.innerHTML = text.innerHTML;

	const tmp = document.querySelector('#tmp');
	tmp.setAttribute('transform', `scale(${scale}) translate(${sx},${sy})`);
	document.querySelector('main').appendChild(tmp);
};

export const drawPort = (portNode: ElkNode): void => {
	d3.select(`#${portNode.id}`).attr(
		'transform',
		`translate(${portNode.x ?? 0}, ${portNode.y ?? 0})`
	);
	d3.select(`#${portNode.id} > rect`)
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', portNode.width ?? 0)
		.attr('height', portNode.height ?? 0);
};

const isTextTooLong = (
	textElement: Element,
	serviceShape: Element,
	serviceName: string
): boolean => {
	const padding = portSize * 5;
	if (!textElement || !serviceShape) return false;
	const textRect = textElement.getBoundingClientRect();
	const svcRect = serviceShape.getBoundingClientRect();
	if (!textElement.getBoundingClientRect() || !serviceShape.getBoundingClientRect()) return false;
	return textRect.width >= svcRect.width - padding && serviceName.length > 4;
};
