<script lang="ts">
	import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled';
	import Edge from './Edge.svelte';
	import { loading, sendVisData, services, setDataString, vscode } from './lib/data';
	import { createSystemGraph, rerenderGraph } from './lib/graph';
	import { closePopup, current_popup } from './lib/popup';
	import { handleExpandServiceEvent, handleShrinkServiceEvent, updateRanges } from './lib/service';
	import { clearSidebar, current_sidebar_element } from './lib/sidebar';
	import Network from './Network.svelte';
	import Popup from './Popup.svelte';
	import Sidebar from './Sidebar/Sidebar.svelte';
	import Zoom from './Zoom.svelte';

	const elk = new ELK();

	let currentGraph: ElkNode | undefined;

	const getData = async () => {
		if (vscode)
			vscode.postMessage({
				command: 'get.data'
			});
		else {
			if (dataFromServer) {
				setDataString(dataFromServer);
				currentGraph = await elk.layout(createSystemGraph(services));
			}
			//mock
			// else
			// 	setDataString(
			// 		`{"name":"aggregation_and_embedding","interfaces":[{"name":"ConsoleIface","id":0,"reqres":[{"name":"print","res":"void","req":"undefined"},{"name":"println","res":"void","req":"undefined"},{"name":"registerForInput","res":"void","req":"RegisterForInputRequest"},{"name":"unsubscribeSessionListener","res":"void","req":"UnsubscribeSessionListener"},{"name":"subscribeSessionListener","res":"void","req":"SubscribeSessionListener"},{"name":"enableTimestamp","res":"void","req":"EnableTimestampRequest"},{"name":"readLine","res":"string","req":"ReadLineRequest"}]},{"name":"AggregatorInterface","file":"\/AggregatorInterface.ol","id":1,"reqres":[{"name":"faxAndPrint","res":"void","req":"FaxAndPrintRequest"}]},{"name":"PrinterInterface","file":"\/PrinterInterface.ol","id":2,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"FaxInterface","file":"\/FaxInterface.ol","id":3,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]}],"types":[{"name":"undefined","type":"any"},{"name":"RegisterForInputRequest","subTypes":[{"name":"enableSessionListener","type":"bool"}]},{"name":"UnsubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"SubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"EnableTimestampRequest","subTypes":[{"name":"format","type":"string"}],"type":"bool"},{"name":"ReadLineRequest","subTypes":[{"name":"secret","type":"bool"}]},{"name":"PrintRequest","subTypes":[{"name":"content","file":"\/PrinterInterface.ol","type":"string"}],"file":"\/PrinterInterface.ol"},{"name":"FaxRequest","subTypes":[{"name":"destination","file":"\/FaxInterface.ol","type":"string"},{"name":"content","file":"\/FaxInterface.ol","type":"string"}],"file":"\/FaxInterface.ol"},{"name":"FaxAndPrintRequest","subTypes":[{"name":"print","file":"\/PrinterInterface.ol","type":"PrintRequest"},{"name":"fax","file":"\/FaxInterface.ol","type":"FaxRequest"}],"file":"\/AggregatorInterface.ol"},{"name":"JobID","subTypes":[{"name":"jobId","file":"\/PrinterInterface.ol","type":"string"}],"file":"\/PrinterInterface.ol"},{"name":"PrintResponse","file":"\/PrinterInterface.ol","type":"JobID"}],"services":[[{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":1}],"execution":"single","file":"\/client.ol","ranges":[{"name":"svc_name","range":{"start":{"line":5,"char":8},"end":{"line":5,"char":14}}},{"name":"embed_Console","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}]},{"name":"Aggregator","protocol":"sodep","interfaces":[{"name":"AggregatorInterface","id":1},{"name":"PrinterInterface","id":2},{"name":"FaxInterface","id":3}],"location":"socket:\/\/localhost:9002","ranges":[{"name":"protocol","range":{"start":{"line":12,"char":-6},"end":{"line":12,"char":-1}}},{"name":"location","range":{"start":{"line":11,"char":-26},"end":{"line":11,"char":-1}}},{"name":"port","range":{"start":{"line":9,"char":15},"end":{"line":14,"char":-1}}}]}],"name":"Client","id":0}],[{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":3},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":5}],"execution":"concurrent","file":"\/fax.ol","parentPort":"Fax","ranges":[{"name":"svc_name","range":{"start":{"line":3,"char":8},"end":{"line":3,"char":11}}},{"name":"embed_Console","range":{"start":{"line":6,"char":10},"end":{"line":7,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":6,"char":10},"end":{"line":7,"char":-1}}}]}],"name":"Fax","inputPorts":[{"name":"FaxInput","protocol":"sodep","interfaces":[{"name":"FaxInterface","id":3}],"location":"socket:\/\/localhost:9001","ranges":[{"name":"protocol","range":{"start":{"line":11,"char":-6},"end":{"line":11,"char":-1}}},{"name":"location","range":{"start":{"line":10,"char":-26},"end":{"line":10,"char":-1}}},{"name":"port","range":{"start":{"line":8,"char":14},"end":{"line":13,"char":-1}}}]}],"id":4},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":7}],"execution":"concurrent","file":"\/printer.ol","parentPort":"printer","ranges":[{"name":"svc_name","range":{"start":{"line":3,"char":8},"end":{"line":3,"char":15}}},{"name":"embed_Console","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}]}],"name":"Printer","inputPorts":[{"name":"PrinterInput","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":2}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":12,"char":-6},"end":{"line":12,"char":-1}}},{"name":"location","range":{"start":{"line":11,"char":-26},"end":{"line":11,"char":-1}}},{"name":"port","range":{"start":{"line":9,"char":14},"end":{"line":14,"char":-1}}}]}],"id":6}],"execution":"concurrent","file":"\/aggregator.ol","ranges":[{"name":"svc_name","range":{"start":{"line":7,"char":8},"end":{"line":7,"char":18}}},{"name":"embed_Console","range":{"start":{"line":11,"char":10},"end":{"line":12,"char":-1}}},{"name":"embed_Fax","range":{"start":{"line":25,"char":10},"end":{"line":26,"char":-1}}},{"name":"embed_Printer","range":{"start":{"line":26,"char":10},"end":{"line":27,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":11,"char":10},"end":{"line":12,"char":-1}}}]},{"name":"printer","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":2}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":16,"char":-6},"end":{"line":16,"char":-1}}},{"name":"location","range":{"start":{"line":15,"char":-26},"end":{"line":15,"char":-1}}},{"name":"port","range":{"start":{"line":13,"char":15},"end":{"line":18,"char":-1}}}]},{"name":"Fax","protocol":"sodep","interfaces":[{"name":"FaxInterface","id":3}],"location":"socket:\/\/localhost:9001","ranges":[{"name":"protocol","range":{"start":{"line":22,"char":-6},"end":{"line":22,"char":-1}}},{"name":"location","range":{"start":{"line":21,"char":-26},"end":{"line":21,"char":-1}}},{"name":"port","range":{"start":{"line":19,"char":15},"end":{"line":24,"char":-1}}}]}],"name":"AggregatorWayTooLongNameTestWhatIsGoingOn","inputPorts":[{"annotation":"aggregator","protocol":"sodep","interfaces":[{"name":"AggregatorInterface","id":1}],"ranges":[{"name":"protocol","range":{"start":{"line":32,"char":-6},"end":{"line":32,"char":-1}}},{"name":"location","range":{"start":{"line":31,"char":-26},"end":{"line":31,"char":-1}}},{"name":"port","range":{"start":{"line":29,"char":14},"end":{"line":35,"char":-1}}}],"name":"Aggregator","location":"socket:\/\/localhost:9002","aggregates":[{"name":"printer"},{"name":"Fax"}]}],"id":2}]]}`
			// 		// `{"name":"withdocker","interfaces":[{"name":"fromDB","file":"\/stats.ol","id":0,"oneway":[{"name":"SaveStuff","req":"string"}]},{"name":"dummy","file":"\/intface.ol","id":1,"oneway":[{"name":"hi","req":"int"}]},{"name":"test","file":"\/intface.ol","id":2,"oneway":[{"name":"hi","req":"int"}]}],"types":[],"services":[[{"name":"db","image":"emovc18\/mysql","id":0,"ports":[{"eport":5432,"iport":5432},{"eport":3434,"iport":5678}]},{"execution":"single","file":"\/stats.ol","ranges":[{"name":"svc_name","range":{"start":{"line":5,"char":8},"end":{"line":5,"char":13}}}],"name":"Stats","inputPorts":[{"name":"PortName","protocol":"sodep","interfaces":[{"name":"fromDB","id":0}],"location":"socket:\/\/localhost:3434","ranges":[{"name":"protocol","range":{"start":{"line":9,"char":-6},"end":{"line":9,"char":-1}}},{"name":"location","range":{"start":{"line":8,"char":-26},"end":{"line":8,"char":-1}}},{"name":"port","range":{"start":{"line":6,"char":14},"end":{"line":11,"char":-1}}}]}],"id":1},{"execution":"concurrent","file":"\/server.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":14}}}],"outputPorts":[{"name":"ToDB","protocol":"sodep","location":"socket:\/\/localhost:5432","ranges":[{"name":"protocol","range":{"start":{"line":16,"char":-1},"end":{"line":16,"char":-1}}},{"name":"location","range":{"start":{"line":14,"char":-26},"end":{"line":14,"char":-1}}},{"name":"port","range":{"start":{"line":12,"char":15},"end":{"line":16,"char":-1}}}]}],"name":"Server","inputPorts":[{"name":"Input","protocol":"sodep","interfaces":[{"name":"dummy","id":1}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":9,"char":-6},"end":{"line":9,"char":-1}}},{"name":"location","range":{"start":{"line":8,"char":-26},"end":{"line":8,"char":-1}}},{"name":"port","range":{"start":{"line":6,"char":14},"end":{"line":11,"char":-1}}}]}],"id":2},{"execution":"single","file":"\/client.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":14}}}],"outputPorts":[{"name":"Server","protocol":"sodep","interfaces":[{"name":"test","id":2}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":7,"char":-6},"end":{"line":7,"char":-1}}},{"name":"location","range":{"start":{"line":6,"char":-26},"end":{"line":6,"char":-1}}},{"name":"port","range":{"start":{"line":4,"char":15},"end":{"line":9,"char":-1}}}]}],"name":"Client","id":3}]]}`
			// 		// `{"name":"withdocker","interfaces":[{"name":"test","file":"\/intface.ol","id":0,"oneway":[{"name":"hi","req":"int"}]},{"name":"fromDB","file":"\/stats.ol","id":1,"oneway":[{"name":"SaveStuff","req":"string"}]},{"name":"dummy","file":"\/intface.ol","id":2,"oneway":[{"name":"hi","req":"int"}]}],"types":[],"services":[[{"name":"db","image":"emovc18\/mysql","id":0,"ports":[{"eport":5432,"iport":5432},{"eport":3434,"iport":5678}]},{"name":"db","image":"emovc18\/mysql","id":1,"ports":[{"eport":5432,"iport":5432},{"eport":3434,"iport":5678}]},{"execution":"single","file":"\/client.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":14}}}],"outputPorts":[{"name":"Server","protocol":"sodep","interfaces":[{"name":"test","id":0}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":7,"char":-6},"end":{"line":7,"char":-1}}},{"name":"location","range":{"start":{"line":6,"char":-26},"end":{"line":6,"char":-1}}},{"name":"port","range":{"start":{"line":4,"char":15},"end":{"line":9,"char":-1}}}]}],"name":"Client","id":2},{"execution":"single","file":"\/stats.ol","ranges":[{"name":"svc_name","range":{"start":{"line":5,"char":8},"end":{"line":5,"char":13}}}],"name":"Stats","inputPorts":[{"name":"PortName","protocol":"sodep","interfaces":[{"name":"fromDB","id":1}],"location":"socket:\/\/localhost:3434","ranges":[{"name":"protocol","range":{"start":{"line":9,"char":-6},"end":{"line":9,"char":-1}}},{"name":"location","range":{"start":{"line":8,"char":-26},"end":{"line":8,"char":-1}}},{"name":"port","range":{"start":{"line":6,"char":14},"end":{"line":11,"char":-1}}}]}],"id":3},{"execution":"concurrent","file":"\/server.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":14}}}],"outputPorts":[{"name":"ToDB","protocol":"sodep","location":"socket:\/\/localhost:5432","ranges":[{"name":"protocol","range":{"start":{"line":16,"char":-1},"end":{"line":16,"char":-1}}},{"name":"location","range":{"start":{"line":14,"char":-26},"end":{"line":14,"char":-1}}},{"name":"port","range":{"start":{"line":12,"char":15},"end":{"line":16,"char":-1}}}]}],"name":"Server","inputPorts":[{"name":"Input","protocol":"sodep","interfaces":[{"name":"dummy","id":2}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":9,"char":-6},"end":{"line":9,"char":-1}}},{"name":"location","range":{"start":{"line":8,"char":-26},"end":{"line":8,"char":-1}}},{"name":"port","range":{"start":{"line":6,"char":14},"end":{"line":11,"char":-1}}}]}],"id":4}]]}`
			// 		// `{"name":"genAggr","interfaces":[],"types":[],"services":[[{"name":"S2","execution":"single","file":"\/svcs.ol","id":0,"ranges":[{"name":"svc_name","range":{"start":{"line":3,"char":8},"end":{"line":3,"char":10}}}]},{"name":"S4","execution":"single","file":"\/svcs.ol","id":1,"ranges":[{"name":"svc_name","range":{"start":{"line":9,"char":8},"end":{"line":9,"char":10}}}]},{"name":"S1","execution":"single","file":"\/svcs.ol","id":2,"ranges":[{"name":"svc_name","range":{"start":{"line":0,"char":8},"end":{"line":0,"char":10}}}]},{"name":"S3","execution":"single","file":"\/svcs.ol","id":3,"ranges":[{"name":"svc_name","range":{"start":{"line":6,"char":8},"end":{"line":6,"char":10}}}]}]]}`
			// 	);
		}
	};

	const vsCodeMessage = async (event: MessageEvent<any>) => {
		if (event.data.command === 'set.data') {
			setDataString(event.data.data);
			await rerender();
		} else if (event.data.command === 'init.data') {
			currentGraph = undefined;
			setDataString(event.data.data);
			currentGraph = await elk.layout(createSystemGraph(services));
		} else if (event.data.command === 'set.ranges') {
			updateRanges(JSON.parse(event.data.data));
			await rerender();
		}
		loading.set(false);
	};

	const resetGraph = async () => {
		currentGraph = undefined;
		currentGraph = await elk.layout(createSystemGraph(services));
		if (!vscode) return;
		await sendVisData();
	};

	const layoutGraph = async () => {
		currentGraph = await elk.layout(createSystemGraph(services));
		await getData();
	};

	const rerender = async () => {
		currentGraph = await elk.layout(rerenderGraph(currentGraph));
	};

	const updateGraph = async (event: CustomEvent) => {
		if (currentGraph === undefined) return;
		if (event.detail.action === 'expandService') handleExpandServiceEvent(event, currentGraph);
		else if (event.detail.action === 'shrinkService') handleShrinkServiceEvent(event, currentGraph);
		else if (event.detail.action === 'reset') {
			await resetGraph();
			return;
		}
		await rerender();
	};

	const handleKeyboard = async (event: KeyboardEvent) => {
		if (event.key === '.') {
			await resetGraph();
		}
		//close sidebar & popup
		if (event.key === 'Escape') {
			if ($current_sidebar_element.hist_type >= 0 && $current_popup.title === '') {
				clearSidebar();
				return;
			}
			if ($current_popup.title === '') return;
			await $current_popup.cancel();
			closePopup();
			await resetGraph();
		}
		if (event.key === 'Enter') {
			if ($current_sidebar_element.hist_type >= 0 && $current_popup.title === '') return;
			clearSidebar();
			if ($current_popup.title === '') return;

			const res = $current_popup.confirm($current_popup.values);
			if (!res) await $current_popup.cancel();
			closePopup();
			if (!res) await resetGraph();
		}
	};
</script>

<svelte:window on:keydown={handleKeyboard} on:message|stopPropagation={vsCodeMessage} />
{#await layoutGraph()}
	<main><p>...loading</p></main>
{:then _}
	<main>
		<svg class="w-screen h-screen">
			<g>
				<Zoom />
				{#if currentGraph}
					{#each currentGraph.children as child}
						<Network bind:network={child} on:message={updateGraph} />
					{/each}
					{#each currentGraph.edges as edge}
						<Edge {edge} white={vscode !== undefined} />
					{/each}
				{/if}
			</g>
		</svg>
		{#if $current_sidebar_element.hist_type >= 0}
			<Sidebar on:reloadgraph={rerender} />
		{/if}
		{#if $loading}
			<div class="absolute top-0 left-0 w-screen h-screen" />
		{/if}
		{#if $current_popup.values.length > 0}
			<Popup on:cancel={resetGraph} />
		{/if}
	</main>
{/await}
