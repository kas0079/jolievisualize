import { generateVisFile, services } from './data';

export const getClickedNetworkGroupId = (e: MouseEvent): number | undefined => {
	const allNetworkNodes = document.querySelectorAll('svg > g > g');
	for (let i = 0; i < allNetworkNodes.length; i++)
		if (mouseIntersectWithRect(e, allNetworkNodes.item(i).getBoundingClientRect()))
			return +allNetworkNodes.item(i).id.replace('network', '');
	return undefined;
};

export const addServiceToNetwork = (svc: Service, networkId: number) => {
	const svcNetworkId = getServiceNetworkId(svc);
	if (!services[networkId]) services.push([]);
	if (networkId === svcNetworkId && !svc.parent) return false;
	services[networkId].push(svc);
	removeFromNetwork(svc, svcNetworkId);
	return true;
};

export const getServiceNetworkId = (svc: Service) => {
	const group = document.querySelector(`g#${svc.name}${svc.id}`);
	let parent = group.parentElement;
	while (parent.id.startsWith('!network')) parent = parent.parentElement;
	return +parent.id.replace('network', '');
};

export const getNumberOfServicesInNetwork = (networkId: number) => {
	return services[networkId].length;
};

export const getNumberOfNetworks = () => {
	return services.length;
};

export const getRoot = (svc: Service): Service => {
	const tmp = svc.parent;
	if (tmp) return getRoot(tmp);
	return svc;
};

const removeFromNetwork = (svc: Service, networkId: number) => {
	if (svc.parent || !services[networkId]) return;
	services[networkId] = services[networkId].filter((t) => t.id !== svc.id);
	if (services[networkId].length === 0) services.splice(networkId, 1);
};

const mouseIntersectWithRect = (e: MouseEvent, rect: DOMRect) => {
	const x = e.pageX;
	const y = e.pageY;
	return rect.x <= x && rect.y <= y && rect.width + rect.x >= x && rect.height + rect.y >= y;
};
