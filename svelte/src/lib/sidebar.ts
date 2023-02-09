import { writable } from 'svelte/store';

export const primitives = ['int', 'void', 'string', 'double', 'bool', 'long', 'raw'];

//TODO all open operations in one place

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

	//TODO refactor
	equals(other: SidebarElement): boolean {
		if (this.hist_type != other.hist_type) return false;
		if (
			this.port?.name != other.port?.name ||
			this.name != other.name ||
			this.portType != other.portType
		)
			return false;
		if (this.interf?.name != other.interf?.name) return false;
		if (this.type?.name != other.type?.name) return false;
		if (this.service?.name != other.service?.name) return false;
		return true;
	}
}

const noSidebar = new SidebarElement(-1, '');
export const current_sidebar_element = writable(noSidebar);

export const openSidebar = (elem: SidebarElement, prev?: SidebarElement): void => {
	if (prev && prev.hist_type >= 0) {
		if (sidebarHistory.length > 15) sidebarHistory.splice(0, 1);
		if (!prev || !prev.equals(elem)) sidebarHistory.push(prev);
	}
	current_sidebar_element.set(elem);
};

export const backSidebar = (): void => {
	if (sidebarHistory.length === 0) {
		clearSidebar();
		return;
	}
	openSidebar(sidebarHistory.pop());
};

export const clearSidebar = (): void => {
	current_sidebar_element.set(noSidebar);
	clearSidebarHistory();
};

export const isSidebarHistoryEmpty = (): boolean => {
	return sidebarHistory.length === 0;
};

const sidebarHistory: SidebarElement[] = [];

const clearSidebarHistory = (): void => {
	while (sidebarHistory.length > 0) sidebarHistory.pop();
};
