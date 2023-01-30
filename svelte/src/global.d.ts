/// <reference types="svelte"/>

declare const d3: D3;
declare function acquireVsCodeApi();

type VisFile = {
	content: TLD[][];
};

type TLD = {
	file?: string;
	target?: string;
	instances?: number;
	paramFile?: string;
};

type Data = {
	services: Service[][];
	interfaces: Interface[];
	types: Type[];
	name: string;
};

type Service = {
	id: number;
	embeddings: Service[];
	name: string;
	execution: string;
	annotation?: string;
	ranges?: CodeRange[];
	inputPorts: Port[];
	outputPorts: Port[];
	file: string;
	paramFile?: string;
	parentPort: string | undefined;
	parent: Service | undefined;
};

type Interface = {
	name: string;
	reqres: { name: string; req: string; res: string }[];
	oneway: { name: string; req: string }[];
	types: Type[];
	file: string;
};

type Type = {
	name: string;
	type: string;
	subTypes: Type[];
	file: string;
};

type Port = {
	name: string;
	location: string;
	protocol: string;
	aggregates?: Aggregate[];
	couriers?: Courier[];
	ranges?: CodeRange[];
	redirects?: Redirect[];
	resource?: string;
	interfaces: { name: string }[];
	file: string;
};

type Aggregate = {
	name: string;
	collection: { name: string }[];
	extender: Interface;
};

type Redirect = {
	name: string;
	port: string;
};

type Courier = {
	name: string;
	interfaceReqRes: { name: string }[];
	interfaceOneWay: { name: string }[];
	operationReqRes: { name: string }[];
	operationOneWay: { name: string }[];
};

type CodeRange = {
	name: string;
	range: SimpleRange;
};

type SimpleRange = {
	start: { line: number; char: number };
	end: { line: number; char: number };
};
