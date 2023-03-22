import { services } from './data';

/**
 * Gets the network ID of the network clicked on by the mouse.
 * @param e MouseEvent.
 * @returns number corresponding to the network ID or undefined if no network found.
 */
export const getClickedNetworkGroupId = (e: MouseEvent): number | undefined => {
	const allNetworkNodes = document.querySelectorAll('svg > g > g');
	for (let i = 0; i < allNetworkNodes.length; i++)
		if (mouseIntersectWithRect(e, allNetworkNodes.item(i).getBoundingClientRect()))
			return +allNetworkNodes.item(i).id.replace('network', '');
	return undefined;
};

/**
 * @param svc Service to add to network
 * @param networkId network ID to add the service to.
 * @returns true if success, else false
 */
export const addServiceToNetwork = (svc: Service, networkId: number): boolean => {
	const svcNetworkId = getServiceNetworkId(svc);
	if (!services[networkId]) services.push([]);
	if (networkId === svcNetworkId && !svc.parent) return false;
	services[networkId].push(svc);
	removeFromNetwork(svc, svcNetworkId);
	return true;
};

/**
 * @param svc Service to find the network id of.
 * @returns network ID of the service's network
 */
export const getServiceNetworkId = (svc: Service): number => {
	let parent = svc.parent ?? svc;
	while (parent.parent) parent = parent.parent;
	return services.findIndex((t) => t.find((s) => s.id === parent.id));
};

/**
 * @param networkId Network ID
 * @returns number of services in the network.
 */
export const getNumberOfServicesInNetwork = (networkId: number): number => {
	return services[networkId].length;
};

/**
 * @returns Number of networks.
 */
export const getNumberOfNetworks = (): number => {
	return services.length;
};

/**
 * @param svc Service to remove from the network.
 * @param networkId Network ID of the network to remove the service from.
 */
export const removeFromNetwork = (svc: Service, networkId: number): void => {
	if (svc.parent || !services[networkId]) return;
	services[networkId] = services[networkId].filter((t) => t.id !== svc.id);
	if (services[networkId].length === 0) services.splice(networkId, 1);
};

/**
 * @param svc Service to find the root service of.
 * @returns Root service of the input service.
 */
const getRoot = (svc: Service): Service => {
	const tmp = svc.parent;
	if (tmp) return getRoot(tmp);
	return svc;
};

/**
 * Checks if the mouse intersects with a rect element.
 * @param e MouseEvent
 * @param rect Rect
 * @returns true if mouse intersects
 */
const mouseIntersectWithRect = (e: MouseEvent, rect: DOMRect): boolean => {
	const x = e.pageX;
	const y = e.pageY;
	return rect.x <= x && rect.y <= y && rect.width + rect.x >= x && rect.height + rect.y >= y;
};
