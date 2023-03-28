import { writable } from 'svelte/store';
import { preprocess } from './preprocess';
import { isDockerService } from './service';
import { error, removeError } from './error';

export const vscode = acquireVsCodeApi();
export const loading = writable(false);

/**
 * Skeleton JSON data
 */
let json: Data = JSON.parse(
	`{"name": " ", "interfaces":[], "types":[], "services":[[{"id":0, "name":" "}]]}`
);

let processedData: Data = preprocess(json);

export let services = processedData.services;
export let interfaces = processedData.interfaces;
export let types = processedData.types;
export let name = processedData.name;

/**
 * Parses, checks for parsing errors and preprocesses the data JSON data.
 * @param data JSON string of the data to be parsed.
 * @returns void
 */
export const setDataString = (data: string): void => {
	const err = checkForError(data);
	if (err) {
		resetData();
		error.set(JSON.parse(data));
		return;
	}
	removeError();
	json = JSON.parse(data);
	processedData = preprocess(json);
	services = processedData.services;
	interfaces = processedData.interfaces;
	types = processedData.types;
	name = processedData.name;
};

/**
 * Sends a message to vscode with the visualize json string.
 * @returns void
 */
export const sendVisData = async (): Promise<void> => {
	if (!vscode) return;
	vscode.postMessage({
		command: 'set.data',
		detail: JSON.stringify(generateVisFile())
	});
};

/**
 * Generates the content of the visualization JSON using the top-level services.
 * @returns VisFile content
 */
const generateVisFile = (): VisFile => {
	const content: TLD[][] = [];
	services.forEach((serviceList) => {
		const tldList: TLD[] = [];
		serviceList.forEach((svc) => {
			if (isDockerService(svc)) {
				const tld: TLD = {
					name: svc.name,
					image: svc.image,
					ports: makeDockerPorts(svc.ports),
					instances: getNumberOfDockerInstances(svc, serviceList)
				};
				if (svc.container) tld.container = svc.container;
				if (svc.env) tld.env = svc.env;
				if (svc.volumes && svc.volumes.length > 0) tld.volumes = svc.volumes;
				if (!tldIncludesDocker(tldList, tld)) tldList.push(tld);
				return;
			}
			const tld: TLD = {
				file: svc.file,
				target: svc.name,
				instances: getNumberOfInstances(svc, serviceList),
				image: svc.image,
				args: svc.args
			};
			if (svc.container) tld.container = svc.container;
			if (svc.params) tld.params = svc.params;
			else if (svc.paramFile) tld.params = svc.paramFile;
			if (svc.env) tld.env = svc.env;
			if (svc.ports) tld.ports = makeDockerPorts(svc.ports);
			if (svc.volumes && svc.volumes.length > 0) tld.volumes = svc.volumes;
			if (!tldIncludes(tldList, tld)) tldList.push(tld);
		});
		content.push(tldList.sort((a, b) => (a.file > b.file ? 1 : a.file < b.file ? -1 : 0)));
	});
	return {
		content
	};
};

/**
 * Resets the data to skeleton
 */
const resetData = (): void => {
	const pd: Data = preprocess(json);
	services = pd.services;
	interfaces = pd.interfaces;
	types = pd.types;
	name = pd.name;
};

/**
 * Checks if the JSON parsed string contains an error field.
 * @param json JSON string from the Java tool.
 * @returns true if parsing error.
 */
const checkForError = (json: string): boolean => {
	const j = JSON.parse(json);
	return j.error;
};

/**
 * Converts docker ports into strings for the visualize JSON file contents.
 * @param ports List of docker ports
 * @returns List of strings
 */
const makeDockerPorts = (ports: DockerPort[]): string[] => {
	return ports.map((t) => `${t.eport}:${t.iport}`);
};

/**
 * Checks if top level deployment list already has a docker top level deployment.
 * @param tldList all top-level deployments
 * @param tld top-level deployment
 * @returns true if the list contains the docker deloyment
 */
const tldIncludesDocker = (tldList: TLD[], tld: TLD): boolean => {
	return tldList.find((t) => t.image === tld.image) !== undefined;
};

/**
 * Checks if list of top level deployments already contains the input tld.
 * @param tldList list of top level deployments
 * @param tld top level deployment
 * @returns true if list contains the tld
 */
const tldIncludes = (tldList: TLD[], tld: TLD): boolean => {
	return (
		tldList.find(
			(t) => t.file === tld.file && t.target === tld.target && t.instances === tld.instances
		) !== undefined
	);
};

/**
 * Finds the number of instances of a service in a list of services (network)
 * @param svc service
 * @param svcList list of services
 * @returns number of instances of the service
 */
const getNumberOfInstances = (svc: Service, svcList: Service[]): number => {
	let res = 0;
	svcList.forEach((os) => {
		if (os.file === svc.file && os.name === svc.name) res += 1;
	});
	return res;
};

/**
 * Finds the number of instances of a docker service in a list of services (network)
 * @param svc docker service
 * @param svcList list of services
 * @returns number of instances of the docker service
 */
const getNumberOfDockerInstances = (svc: Service, svcList: Service[]): number => {
	let res = 0;
	svcList.forEach((os) => {
		if (os.image === svc.image && os.name === svc.name) res += 1;
	});
	return res;
};
