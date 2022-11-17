/// <reference types="svelte"/>

declare const d3: any;
declare const data: any;

type Data = {
	services: Service[];
	interfaces: Interface[];
	types: Type[];
	placegraph: pgNode[];
	name: string;
};

type Service = {
	x: number;
	y: number;
	center: Point;
	width: number;
	height: number;
	id: number;
	embeddings: Embed[];
	embeddingType: string;
	name: string;
	execution: string;
	inputPorts: Port[];
	outputPorts: Port[];
};

type Interface = {
	name: string;
	reqres: { name: string; req: string; res: string }[];
	oneway: { name: string; req: string }[];
	types: Type[];
};

type Type = {
	name: string;
	type: string;
	subTypes: Type[];
};

type Port = {
	x: number;
	y: number;
	name: string;
	location: string;
	protocol: string;
	aggregates: Aggregate[];
	couriers: Courier[];
	redirects: Redirect[];
	resource: string;
	cost: boolean;
	interfaces: { name: string }[];
};

type Aggregate = {
	name: string;
	collection: { name: string }[];
	extender: Interface;
};

type Embed = {
	port: string;
	name: string;
	type: string;
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

type pgNode = {
	id: number;
	nodes: pgNode[];
	type: string;
	name?: string;
};
