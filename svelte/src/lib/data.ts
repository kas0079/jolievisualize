import { writable } from 'svelte/store';
import { preprocess } from './preprocess';
import { isDockerService } from './service';

export const vscode = acquireVsCodeApi();

export const loading = writable(false);

let json: Data = JSON.parse(
	`{"name": " ", "interfaces":[], "types":[], "services":[[{"id":0, "name":" "}]]}`
);

let processedData: Data = preprocess(json);

export let services = processedData.services;
export let interfaces = processedData.interfaces;
export let types = processedData.types;
export let name = processedData.name;

export const setDataString = (data: string) => {
	json = JSON.parse(data);
	processedData = preprocess(json);
	services = processedData.services;
	interfaces = processedData.interfaces;
	types = processedData.types;
	name = processedData.name;
};

export const resetData = () => {
	let pd: Data = preprocess(json);
	services = pd.services;
	interfaces = pd.interfaces;
	types = pd.types;
	name = pd.name;
};

export const sendVisData = async () => {
	if (!vscode) return;
	vscode.postMessage({
		command: 'set.data',
		detail: JSON.stringify(generateVisFile())
	});
};

export const generateVisFile = (): VisFile => {
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
			if (svc.params) tld.params = svc.params;
			else if (svc.paramFile) tld.params = svc.paramFile;
			if (svc.env) tld.env = svc.env;
			if (svc.volumes && svc.volumes.length > 0) tld.volumes = svc.volumes;
			if (!tldIncludes(tldList, tld)) tldList.push(tld);
		});
		content.push(tldList.sort((a, b) => (a.file > b.file ? 1 : a.file < b.file ? -1 : 0)));
	});
	return {
		content
	};
};

const makeDockerPorts = (ports: DockerPort[]): string[] => {
	return ports.map((t) => `${t.eport}:${t.iport}`);
};

const tldIncludesDocker = (tldList: TLD[], tld: TLD): boolean => {
	return tldList.find((t) => t.image === tld.image) !== undefined;
};

const tldIncludes = (tldList: TLD[], tld: TLD): boolean => {
	return (
		tldList.find(
			(t) => t.file === tld.file && t.target === tld.target && t.instances === tld.instances
		) !== undefined
	);
};

const getNumberOfInstances = (svc: Service, svcList: Service[]) => {
	let res = 0;
	svcList.forEach((os) => {
		if (os.file === svc.file && os.name === svc.name) res += 1;
	});
	return res;
};

const getNumberOfDockerInstances = (svc: Service, svcList: Service[]) => {
	let res = 0;
	svcList.forEach((os) => {
		if (os.image === svc.image && os.name === svc.name) res += 1;
	});
	return res;
};
