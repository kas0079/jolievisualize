import { writable } from 'svelte/store';
import { preprocess } from './preprocess';

export const vscode = acquireVsCodeApi();

export const loading = writable(false);

let json: Data = JSON.parse(
	// `{"name":"aggregation_and_embedding","interfaces":[{"name":"ConsoleIface","id":0,"reqres":[{"name":"print","res":"void","req":"undefined"},{"name":"println","res":"void","req":"undefined"},{"name":"registerForInput","res":"void","req":"RegisterForInputRequest"},{"name":"unsubscribeSessionListener","res":"void","req":"UnsubscribeSessionListener"},{"name":"subscribeSessionListener","res":"void","req":"SubscribeSessionListener"},{"name":"enableTimestamp","res":"void","req":"EnableTimestampRequest"}]},{"name":"PrinterInterface","id":1,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"FaxInterface","id":2,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]},{"name":"AggregatorInterface","id":3,"reqres":[{"name":"faxAndPrint","res":"void","req":"FaxAndPrintRequest"}]}],"types":[{"name":"undefined","type":"any"},{"name":"RegisterForInputRequest","subTypes":[{"name":"enableSessionListener","type":"bool"}]},{"name":"UnsubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"SubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"EnableTimestampRequest","subTypes":[{"name":"format","type":"string"}],"type":"bool"},{"name":"PrintRequest","subTypes":[{"name":"content","type":"string"}]},{"name":"PrintResponse","type":"JobID"},{"name":"JobID","subTypes":[{"name":"jobId","type":"string"}]},{"name":"FaxRequest","subTypes":[{"name":"destination","type":"string"},{"name":"content","type":"string"}]},{"name":"FaxAndPrintRequest","subTypes":[{"name":"print","type":"PrintRequest"},{"name":"fax","type":"FaxRequest"}]}],"services":[[{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","protocol":"sodep"}],"id":1},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","protocol":"sodep"}],"id":3}],"execution":"concurrent","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"name":"Fax","inputPorts":[{"name":"FaxInput","interfaces":[{"name":"FaxInterface","id":2}],"location":"socket:\/\/localhost:9001","protocol":"sodep"}],"id":2},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","protocol":"sodep"}],"id":5}],"execution":"concurrent","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"name":"Printer","inputPorts":[{"name":"PrinterInput","interfaces":[{"name":"PrinterInterface","id":1}],"location":"socket:\/\/localhost:9000","protocol":"sodep"}],"id":4}],"execution":"concurrent","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"},{"name":"printer","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":1}],"location":"socket:\/\/localhost:9000"},{"name":"Fax","protocol":"sodep","interfaces":[{"name":"FaxInterface","id":2}],"location":"socket:\/\/localhost:9001"}],"name":"Aggregator","inputPorts":[{"name":"Aggregator","interfaces":[{"name":"AggregatorInterface","id":3}],"location":"socket:\/\/localhost:9002","aggregates":[{"name":"printer"},{"name":"Fax"}],"protocol":"sodep"}],"id":0},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","protocol":"sodep"}],"id":7}],"name":"Client","execution":"single","id":6,"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"},{"name":"Aggregator","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":1},{"name":"FaxInterface","id":2},{"name":"AggregatorInterface","id":3}],"location":"socket:\/\/localhost:9002"}]}]]}`
	// `{"name":"new","interfaces":[{"name":"embedInterface","id":0,"reqres":[{"name":"embedRR","res":"embedType","req":"string"}],"oneway":[{"name":"embedOW","req":"int"}]},{"name":"testInterface","id":1,"reqres":[{"name":"hello","res":"int","req":"testType"}]},{"name":"lol","id":2,"oneway":[{"name":"hello","req":"int"}]}],"types":[{"name":"embedType","subTypes":[{"name":"id","type":"int"}]},{"name":"testType","subTypes":[{"name":"the","type":"string"},{"name":"what","type":"int"}]}],"services":[[{"embeddings":[{"name":"test","execution":"single","id":1,"outputPorts":[{"name":"TestPort","protocol":"sodep","interfaces":[{"name":"embedInterface","id":0}],"location":"socket:\/\/localhost:9876"}]}],"execution":"concurrent","outputPorts":[{"name":"Test","protocol":"sodep","location":"local"},{"name":"MainTest","protocol":"sodep","interfaces":[{"name":"testInterface","id":1}],"location":"socket:\/\/localhost:5678"}],"name":"MainService","inputPorts":[{"name":"IP","interfaces":[{"name":"lol","id":2}],"location":"socket:\/\/localhost:3498","protocol":"sodep"}],"id":0}],[{"embeddings":[{"name":"test","execution":"single","id":3,"outputPorts":[{"name":"TestPort","protocol":"sodep","interfaces":[{"name":"embedInterface","id":0}],"location":"socket:\/\/localhost:9876"}]}],"execution":"concurrent","outputPorts":[{"name":"Test","protocol":"sodep","location":"local"},{"name":"MainTest","protocol":"sodep","interfaces":[{"name":"testInterface","id":1}],"location":"socket:\/\/localhost:5678"}],"name":"MainService","inputPorts":[{"name":"IP","interfaces":[{"name":"lol","id":2}],"location":"socket:\/\/localhost:3498","protocol":"sodep"}],"id":2}]]}`
	// `{"name":"internetwork","interfaces":[{"name":"service2Inter","id":0,"reqres":[{"name":"test","res":"int","req":"int"}]},{"name":"service1Inter","id":1,"reqres":[{"name":"test","res":"int","req":"int"}]}],"types":[],"services":[[{"name":"One","execution":"single","id":0,"outputPorts":[{"name":"Output","protocol":"sodep","interfaces":[{"name":"service2Inter","id":0}],"location":"socket:\/\/localhost:9000"}]}],[{"name":"Two","execution":"single","inputPorts":[{"name":"Input","protocol":"sodep","interfaces":[{"name":"service1Inter","id":1}],"location":"socket:\/\/localhost:9000"}],"id":1}]]}`
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

export const generateVisFile = (): VisFile => {
	const content: TLD[][] = [];
	services.forEach((serviceList) => {
		const tldList: TLD[] = [];
		serviceList.forEach((svc) => {
			const tld: TLD = {
				file: svc.file,
				target: svc.name,
				instances: getNumberOfInstances(svc, serviceList)
			};
			if (svc.paramFile) tld.paramFile = svc.paramFile;
			if (!tldIncludes(tldList, tld)) tldList.push(tld);
		});
		content.push(tldList.sort((a, b) => (a.file > b.file ? 1 : a.file < b.file ? -1 : 0)));
	});
	return {
		content
	};
};

const tldIncludes = (tldList: TLD[], tld: TLD) => {
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
