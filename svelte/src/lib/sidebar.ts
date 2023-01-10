import { writable } from 'svelte/store';

export const primitives = ['int', 'void', 'string', 'double', 'bool', 'long', 'raw'];

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

export const noSidebar = new SidebarElement(-1, '');
export let current_sidebar_element = writable(noSidebar);
