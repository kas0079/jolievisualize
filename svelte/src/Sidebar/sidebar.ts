export const primitives = ['int', 'void', 'string', 'double', 'bool', 'long', 'raw'];

/**
 * Sidebar history:
 */
export class SidebarElement {
	/**
	 * @param type -1: none, 0: service, 1: port, 2: interface, 3: type
	 */
	constructor(type: number, name: string) {
		this.hist_type = type;
		this.name = name;
	}

	hist_type: number;
	port: Port | undefined;
	name: string | undefined;
	portType: string | undefined;
	interf: Interface | undefined;
	type: Type | undefined;
	service: Service | undefined;

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
