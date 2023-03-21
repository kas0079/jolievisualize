import { writable } from 'svelte/store';
import { interfaces, services, types } from './data';
import { getAllServices } from './service';
import type { ElkNode } from 'elkjs/lib/elk-api';

export const primitives = ['int', 'void', 'string', 'double', 'bool', 'long', 'raw'];

export const openTypeSidebar = (typename: string): void => {
	if (primitives.includes(typename.toLowerCase())) return;
	const type = types.find((t) => t.name === typename);

	if (type === undefined) return;

	const sbElemt = new SidebarElement(3, typename);
	sbElemt.type = type;
	openSidebar(sbElemt);
};

export const openInterfaceSidebar = (interfName: string): void => {
	openSpecificInterfaceSidebar(interfaces.find((t) => t.name === interfName));
};

export const openSpecificInterfaceSidebar = (interf: Interface): void => {
	if (!interf) return;
	const sbElem = new SidebarElement(2, interf.name);
	sbElem.interf = interf;
	openSidebar(sbElem);
};

export const openAggregateSidebar = (aggrName: string, parentID: number): void => {
	const svc = getAllServices(services).find((t) => t.id === parentID);
	if (svc === undefined) return;

	const aggrPort = svc.outputPorts?.find((t) => t.name === aggrName);
	if (aggrName === undefined) return;
	const sbElem = new SidebarElement(1, aggrPort.name);
	sbElem.port = aggrPort;
	sbElem.portType = 'op';
	sbElem.port_parentID = parentID;
	openSidebar(sbElem);
};

export const openRedirectPortSidebar = (redirPortName: string, parentID: number): void => {
	const parent = getAllServices(services).find((t) => t.id === parentID);
	const port = parent.outputPorts.find((t) => t.name === redirPortName);
	const sbPort = new SidebarElement(1, port.name);
	sbPort.port = port;
	sbPort.port_parentID = parentID;
	sbPort.portType = 'op';
	openSidebar(sbPort);
};

export const openServiceIdSidebar = (id: number): void => {
	const svc = getAllServices(services).find((t) => t.id === id);
	if (svc === undefined) return;
	const sbElem = new SidebarElement(0, svc.name);
	sbElem.service = svc;
	openSidebar(sbElem);
};

export const openServiceInSidebar = (service: Service, dragged: number): void => {
	if (dragged > 1) {
		dragged = 0;
		return;
	}
	const sbElem = new SidebarElement(0, service.name);
	sbElem.service = service;
	openSidebar(sbElem);
};

export const openPortFromServiceSidebar = (
	event: Event,
	service: Service,
	portType: string
): void => {
	const elem = event.target as Element;
	const portName = elem.textContent.split(' - ')[0];
	let port: Port;
	if (portType === 'op') port = service.outputPorts.find((t) => t.name === portName);
	else port = service.inputPorts.find((t) => t.name === portName);
	if (port === undefined) return;
	const sbElem = new SidebarElement(1, portName);
	sbElem.port = port;
	sbElem.portType = portType;
	sbElem.port_parentID = service.id;
	openSidebar(sbElem);
};

export const openPortSidebar = (port: Port, portNode: ElkNode, parentID: number): void => {
	const sbPort = new SidebarElement(1, port.name);
	sbPort.port = port;
	sbPort.port_parentID = parentID;
	sbPort.portType = portNode.labels[0].text;
	openSidebar(sbPort);
};

/**
 * Sidebar element:
 */
export class SidebarElement {
	/**
	 * @param type -1: none, 0: service, 1: port, 2: interface, 3: type, 4: selection
	 */
	constructor(type: number, name: string) {
		this.hist_type = type;
		this.name = name;
	}

	hist_type: number;
	port: Port | undefined;
	port_parentID: number | undefined;
	name: string | undefined;
	portType: string | undefined;
	interf: Interface | undefined;
	type: Type | undefined;
	service: Service | undefined;
	serviceList: Service[];

	equals(other: SidebarElement): boolean {
		if (this.hist_type !== other.hist_type) return false;
		if (
			this.port?.name !== other.port?.name ||
			this.name !== other.name ||
			this.portType !== other.portType ||
			this.port_parentID !== this.port_parentID
		)
			return false;
		if (this.interf?.name !== other.interf?.name || this.interf?.file !== other.interf?.file)
			return false;
		if (this.type?.name !== other.type?.name || this.type?.file !== other.type?.file) return false;
		if (this.service?.id !== other.service?.id) return false;
		return true;
	}

	getFile(): string | undefined {
		return this.service
			? this.service.file
			: this.port
			? this.port.file
			: this.interf
			? this.interf.file
			: this.type
			? this.type.file
			: undefined;
	}
}

const noSidebar = new SidebarElement(-1, '');
const sidebarHistory: SidebarElement[] = [];

export const current_sidebar_element = writable(noSidebar);

export const openSidebar = (elem: SidebarElement, addToHistory = true): void => {
	current_sidebar_element.update((current) => {
		if (current && current.hist_type >= 0) {
			if (sidebarHistory.length > 15) sidebarHistory.splice(0, 1);
			if ((!current || !current.equals(elem)) && addToHistory) sidebarHistory.push(current);
		}
		return elem;
	});
};

export const backSidebar = (): void => {
	if (sidebarHistory.length === 0) {
		clearSidebar();
		return;
	}
	openSidebar(sidebarHistory.pop(), false);
};

export const clearSidebar = (): void => {
	current_sidebar_element.set(noSidebar);
	clearSidebarHistory();
};

const clearSidebarHistory = (): void => {
	while (sidebarHistory.length > 0) sidebarHistory.pop();
};
