import { writable } from 'svelte/store';
import { interfaces, services, types } from './data';
import { getAllServices } from './service';
import type { ElkNode } from 'elkjs/lib/elk-api';

/**
 * Primitive Jolie types
 */
export const primitives = ['int', 'void', 'string', 'double', 'bool', 'long', 'raw'];

/**
 * Opens a type in the sidebar given a name of the type
 * @param typename Name of type
 */
export const openTypeSidebar = (typename: string): void => {
	if (primitives.includes(typename.toLowerCase())) return;
	const type = types.find((t) => t.name === typename);

	if (type === undefined) return;

	const sbElemt = new SidebarElement(3, typename);
	sbElemt.type = type;
	openSidebar(sbElemt);
};

/**
 * Opens a type in the sidebar given the type objecs.
 * @param type type to open in sidebar.
 */
export const openTypeObjectInSidebar = (type: Type): void => {
	if (type === undefined) return;
	const sbElemt = new SidebarElement(3, type.name);
	sbElemt.type = type;
	openSidebar(sbElemt);
};

/**
 * Displays interface information in the sidebar given the name of the interface
 * @param interfName Name of interface
 */
export const openInterfaceSidebar = (interfName: string): void => {
	openSpecificInterfaceSidebar(interfaces.find((t) => t.name === interfName));
};

/**
 * Displays interface information in the sidebar given the interface object
 * @param interf Interface object
 */
export const openSpecificInterfaceSidebar = (interf: Interface): void => {
	if (!interf) return;
	const sbElem = new SidebarElement(2, interf.name);
	sbElem.interf = interf;
	openSidebar(sbElem);
};

/**
 * Opens aggregate information in the sidebar given the name of the aggregate port
 * @param aggrName Name of the aggregate port
 * @param parentID ID of the parent service.
 */
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

/**
 * Opens redirect information in the sidebar given the name of the redirect port
 * @param redirPortName Name of the redirect port
 * @param parentID ID of the parent service.
 */
export const openRedirectPortSidebar = (redirPortName: string, parentID: number): void => {
	const parent = getAllServices(services).find((t) => t.id === parentID);
	const port = parent.outputPorts.find((t) => t.name === redirPortName);
	const sbPort = new SidebarElement(1, port.name);
	sbPort.port = port;
	sbPort.port_parentID = parentID;
	sbPort.portType = 'op';
	openSidebar(sbPort);
};

/**
 * Displays service information in the sidebar given the service ID
 * @param id ID of the service
 */
export const openServiceIdSidebar = (id: number): void => {
	const svc = getAllServices(services).find((t) => t.id === id);
	if (svc === undefined) return;
	const sbElem = new SidebarElement(0, svc.name);
	sbElem.service = svc;
	openSidebar(sbElem);
};

/**
 * Displays service information in the sidebar given the service object.
 * If the service is being dragged, don't open the sidebar.
 * @param service ID of the service
 * @param dragged If the service is being dragged > 1, else 0
 */
export const openServiceInSidebar = (service: Service, dragged: number): void => {
	if (dragged > 1) {
		dragged = 0;
		return;
	}
	const sbElem = new SidebarElement(0, service.name);
	sbElem.service = service;
	openSidebar(sbElem);
};

/**
 * Displays port information in the sidebar by clicking on a port in the sidebar
 * @param event Click Event
 * @param service service which owns the port.
 * @param portType type of port (input or output)
 */
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

/**
 * Displays port information in the sidebar using the port object
 * @param port Port object
 * @param portNode ElkPort to get the port type from
 * @param parentID Service ID of the parent of the port.
 */
export const openPortSidebar = (port: Port, portNode: ElkNode, parentID: number): void => {
	const sbPort = new SidebarElement(1, port.name);
	sbPort.port = port;
	sbPort.port_parentID = parentID;
	sbPort.portType = portNode.labels[0].text;
	openSidebar(sbPort);
};

/**
 * Class representing a sidebar element:
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

	/**
	 * compares equality of this and other sidebar element
	 * @param other Other element
	 * @returns
	 */
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

	/**
	 * @returns file URI of the object opened in the sidebar or undefined if no file attribute.
	 */
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

/**
 * Svelte Store to keep global state of the current sidebar
 */
export const current_sidebar_element = writable(noSidebar);

/**
 * @param elem Sidebar Element to open
 * @param addToHistory true if the current element should be kept in the history.
 */
export const openSidebar = (elem: SidebarElement, addToHistory = true): void => {
	current_sidebar_element.update((current) => {
		if (current && current.hist_type >= 0) {
			if (sidebarHistory.length > 15) sidebarHistory.splice(0, 1);
			if ((!current || !current.equals(elem)) && addToHistory) sidebarHistory.push(current);
		}
		return elem;
	});
};

/**
 * Goes back to the previous opened sidebar element
 */
export const backSidebar = (): void => {
	if (sidebarHistory.length === 0) {
		clearSidebar();
		return;
	}
	openSidebar(sidebarHistory.pop(), false);
};

/**
 * Closes the sidebar
 */
export const clearSidebar = (): void => {
	current_sidebar_element.set(noSidebar);
	clearSidebarHistory();
};

/**
 * Clears history of previous opened sidebar elements.
 */
const clearSidebarHistory = (): void => {
	while (sidebarHistory.length > 0) sidebarHistory.pop();
};
