import type { ElkNode } from 'elkjs/lib/elk-api';
import { tick } from 'svelte';
import { services, vscode } from './data';

export const getAllServices = (services: Service[][]) => {
	return services.flatMap((t) => t.flatMap((s) => getRecursiveEmbedding(s)));
};

export const disembed = async (service: Service) => {
	if (!service.parent) return;
	const parent = service.parent;
	service.parent = undefined;

	if (vscode) {
		if (getNumberOfTotalInstances(service) === 1) {
			const portsToRemove = service.inputPorts
				.filter((ip) => ip.location.startsWith('!local'))
				.map((ip) => {
					return {
						filename: ip.file,
						portName: ip.name,
						portType: 'inputPort',
						serviceName: service.name
					};
				});

			if (portsToRemove.length > 0)
				vscode.postMessage({ command: 'removePorts', ports: portsToRemove });
		}
	}
	service.inputPorts = service.inputPorts.filter((ip) => !ip.location.startsWith('!local'));
	await tick();
	parent.embeddings = parent.embeddings.filter((t) => t.id !== service.id);
};

export const getServiceFromCoords = (e: MouseEvent, services: Service[][]) => {
	const elemBelow = getElementBelowGhost(e)[0];
	return elemBelow.tagName === 'polygon' ? getServiceFromPolygon(elemBelow, services) : undefined;
};

export const getHoveredPolygon = (e: MouseEvent) => {
	const elemBelow = getElementBelowGhost(e)[0];
	return elemBelow.tagName === 'polygon' ? elemBelow : undefined;
};

export const renderGhostNodeOnDrag = (
	serviceNode: ElkNode,
	e: MouseEvent,
	startX: number,
	startY: number
) => {
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

const getElementBelowGhost = (e: MouseEvent) => {
	if (document.querySelector('#tmp'))
		document.querySelector('#tmp').setAttribute('style', 'display: none;');
	const elemBelow = document.elementsFromPoint(e.clientX, e.clientY);
	if (document.querySelector('#tmp')) document.querySelector('#tmp').removeAttribute('style');

	return elemBelow;
};

const getServiceFromPolygon = (elem: Element, services: Service[][]) => {
	return getAllServices(services).find(
		(t) => t.name + t.id === elem.parentElement.getAttribute('id')
	);
};

const getRecursiveEmbedding = (service: Service, result: Service[] = []) => {
	result.push(service);
	service.embeddings?.forEach((embed) => {
		result = result.concat(getRecursiveEmbedding(embed));
	});
	return result;
};

const getNumberOfTotalInstances = (service: Service) => {
	const allServices = getAllServices(services);
	return allServices.filter((t) => t.name === service.name && t.file === service.file).length - 1;
};
