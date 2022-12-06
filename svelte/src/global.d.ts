/// <reference types="svelte"/>

declare const d3: D3;

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
	name: string;
	location: string;
	protocol: string;
	aggregates: Aggregate[];
	couriers: Courier[];
	redirects: Redirect[];
	resource: string;
	interfaces: { name: string }[];
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
