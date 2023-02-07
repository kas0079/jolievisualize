<script lang="ts">
	import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled';
	import Edge from './Edge.svelte';
	import { generateVisFile, loading, services, setDataString, vscode } from './lib/data';
	import {
		handleExpandServiceEvent,
		handleShrinkServiceEvent,
		rerenderGraph
	} from './lib/eventHandlers';
	import { createSystemGraph } from './lib/graph';
	import { current_popup, noPopup } from './lib/popup';
	import { updateRanges } from './lib/service';
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
				command: 'getData'
			});
		else {
			// Mock
			setDataString(
				// `{"name":"disembed","interfaces":[{"name":"dummy","file":"\/s2.ol","id":0,"reqres":[{"name":"hello","res":"int","req":"int"}]}],"types":[],"services":[[{"embeddings":[{"execution":"single","file":"\/s2.ol","parentPort":"STwo","ranges":[{"name":"svc_name","range":{"start":{"line":6,"char":8},"end":{"line":6,"char":18}}}],"name":"ServiceTwo","inputPorts":[{"name":"Internal","protocol":"sodep","interfaces":[{"name":"dummy","id":0}],"location":"local","ranges":[{"name":"protocol","range":{"start":{"line":10,"char":8},"end":{"line":10,"char":18}}},{"name":"location","range":{"start":{"line":9,"char":-6},"end":{"line":9,"char":-1}}},{"name":"port","range":{"start":{"line":7,"char":14},"end":{"line":12,"char":-1}}}]}],"id":1}],"execution":"single","file":"\/s1.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":18}}},{"name":"embed_ServiceTwo","range":{"start":{"line":3,"char":10},"end":{"line":4,"char":-1}}}],"outputPorts":[{"name":"STwo","protocol":"sodep","interfaces":[{"name":"dummy","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":3,"char":10},"end":{"line":4,"char":-1}}}]}],"name":"ServiceOne","id":0},{"embeddings":[{"execution":"single","file":"\/s2.ol","parentPort":"STwo","ranges":[{"name":"svc_name","range":{"start":{"line":6,"char":8},"end":{"line":6,"char":18}}}],"name":"ServiceTwo","inputPorts":[{"name":"Internal","protocol":"sodep","interfaces":[{"name":"dummy","id":0}],"location":"local","ranges":[{"name":"protocol","range":{"start":{"line":10,"char":8},"end":{"line":10,"char":18}}},{"name":"location","range":{"start":{"line":9,"char":-6},"end":{"line":9,"char":-1}}},{"name":"port","range":{"start":{"line":7,"char":14},"end":{"line":12,"char":-1}}}]}],"id":3}],"execution":"single","file":"\/s1.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":18}}},{"name":"embed_ServiceTwo","range":{"start":{"line":3,"char":10},"end":{"line":4,"char":-1}}}],"outputPorts":[{"name":"STwo","protocol":"sodep","interfaces":[{"name":"dummy","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":3,"char":10},"end":{"line":4,"char":-1}}}]}],"name":"ServiceOne","id":2}]]}`
				// `{"name":"embed","interfaces":[],"types":[],"services":[[{"name":"S1","execution":"single","file":"\/s1.ol","id":0,"ranges":[{"name":"svc_name","range":{"start":{"line":4,"char":8},"end":{"line":4,"char":10}}}]},{"name":"S1","execution":"single","file":"\/s1.ol","id":1,"ranges":[{"name":"svc_name","range":{"start":{"line":4,"char":8},"end":{"line":4,"char":10}}}]},{"name":"S2","execution":"single","file":"\/s1.ol","id":2,"ranges":[{"name":"svc_name","range":{"start":{"line":8,"char":8},"end":{"line":8,"char":10}}}]}]]}`
				// `{"name":"embed","interfaces":[{"name":"dummy","file":"\/s1.ol","id":0,"oneway":[{"name":"hi","req":"int"}]}],"types":[],"services":[[{"embeddings":[{"execution":"single","file":"\/s1.ol","parentPort":"S2","ranges":[{"name":"svc_name","range":{"start":{"line":8,"char":8},"end":{"line":8,"char":10}}}],"name":"S2","inputPorts":[{"name":"Test","protocol":"sodep","interfaces":[{"name":"dummy","id":0}],"location":"local","ranges":[{"name":"protocol","range":{"start":{"line":12,"char":8},"end":{"line":12,"char":18}}},{"name":"location","range":{"start":{"line":11,"char":-6},"end":{"line":11,"char":-1}}},{"name":"port","range":{"start":{"line":9,"char":14},"end":{"line":14,"char":-1}}}]}],"id":1}],"execution":"single","file":"\/s1.ol","ranges":[{"name":"svc_name","range":{"start":{"line":4,"char":8},"end":{"line":4,"char":10}}},{"name":"embed_S2","range":{"start":{"line":5,"char":10},"end":{"line":6,"char":-1}}}],"outputPorts":[{"name":"S2","protocol":"sodep","interfaces":[{"name":"dummy","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":5,"char":10},"end":{"line":6,"char":-1}}}]}],"name":"S1","id":0}]]}`
				// `{"name":"aggregation_and_embedding","interfaces":[{"name":"ConsoleIface","id":0,"reqres":[{"name":"print","res":"void","req":"undefined"},{"name":"println","res":"void","req":"undefined"},{"name":"registerForInput","res":"void","req":"RegisterForInputRequest"},{"name":"unsubscribeSessionListener","res":"void","req":"UnsubscribeSessionListener"},{"name":"subscribeSessionListener","res":"void","req":"SubscribeSessionListener"},{"name":"enableTimestamp","res":"void","req":"EnableTimestampRequest"},{"name":"readLine","res":"string","req":"ReadLineRequest"}]},{"name":"AggregatorInterface","file":"\/client.ol","id":1,"reqres":[{"name":"faxAndPrint","res":"void","req":"FaxAndPrintRequest"}]},{"name":"PrinterInterface","file":"\/client.ol","id":2,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"FaxInterface","file":"\/client.ol","id":3,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]},{"name":"PrinterInterface","file":"\/aggregator.ol","id":4,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"FaxInterface","file":"\/aggregator.ol","id":5,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]},{"name":"FaxInterface","file":"\/fax.ol","id":6,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]},{"name":"PrinterInterface","file":"\/printer.ol","id":7,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"AggregatorInterface","file":"\/aggregator.ol","id":8,"reqres":[{"name":"faxAndPrint","res":"void","req":"FaxAndPrintRequest"}]}],"types":[{"name":"undefined","type":"any"},{"name":"RegisterForInputRequest","subTypes":[{"name":"enableSessionListener","type":"bool"}]},{"name":"UnsubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"SubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"EnableTimestampRequest","subTypes":[{"name":"format","type":"string"}],"type":"bool"},{"name":"ReadLineRequest","subTypes":[{"name":"secret","type":"bool"}]},{"name":"FaxAndPrintRequest","subTypes":[{"name":"print","file":"\/AggregatorInterface.ol","type":"PrintRequest"},{"name":"fax","file":"\/AggregatorInterface.ol","type":"FaxRequest"}],"file":"\/AggregatorInterface.ol"},{"name":"PrintRequest","subTypes":[{"name":"content","file":"\/PrinterInterface.ol","type":"string"}],"file":"\/PrinterInterface.ol"},{"name":"PrintResponse","file":"\/PrinterInterface.ol","type":"JobID"},{"name":"JobID","subTypes":[{"name":"jobId","file":"\/PrinterInterface.ol","type":"string"}],"file":"\/PrinterInterface.ol"},{"name":"FaxRequest","subTypes":[{"name":"destination","file":"\/FaxInterface.ol","type":"string"},{"name":"content","file":"\/FaxInterface.ol","type":"string"}],"file":"\/FaxInterface.ol"}],"services":[[{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":1}],"execution":"single","file":"\/client.ol","ranges":[{"name":"svc_name","range":{"start":{"line":5,"char":8},"end":{"line":5,"char":14}}},{"name":"embed_Console","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}]},{"name":"Aggregator","protocol":"sodep","interfaces":[{"name":"AggregatorInterface","id":1},{"name":"PrinterInterface","id":2},{"name":"FaxInterface","id":3}],"location":"socket:\/\/localhost:9002","ranges":[{"name":"protocol","range":{"start":{"line":12,"char":8},"end":{"line":12,"char":18}}},{"name":"location","range":{"start":{"line":11,"char":-24},"end":{"line":11,"char":-1}}},{"name":"port","range":{"start":{"line":9,"char":15},"end":{"line":14,"char":-1}}}]}],"name":"Client","id":0},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":3},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":5}],"execution":"concurrent","file":"\/fax.ol","parentPort":"Fax","ranges":[{"name":"svc_name","range":{"start":{"line":3,"char":8},"end":{"line":3,"char":11}}},{"name":"embed_Console","range":{"start":{"line":6,"char":10},"end":{"line":7,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":6,"char":10},"end":{"line":7,"char":-1}}}]}],"name":"Fax","inputPorts":[{"name":"FaxInput","protocol":"sodep","interfaces":[{"name":"FaxInterface","id":6}],"location":"socket:\/\/localhost:9001","ranges":[{"name":"protocol","range":{"start":{"line":11,"char":8},"end":{"line":11,"char":18}}},{"name":"location","range":{"start":{"line":10,"char":-24},"end":{"line":10,"char":-1}}},{"name":"port","range":{"start":{"line":8,"char":14},"end":{"line":13,"char":-1}}}]}],"id":4},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":7}],"execution":"concurrent","file":"\/printer.ol","parentPort":"printer","ranges":[{"name":"svc_name","range":{"start":{"line":3,"char":8},"end":{"line":3,"char":15}}},{"name":"embed_Console","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":7,"char":10},"end":{"line":8,"char":-1}}}]}],"name":"Printer","inputPorts":[{"name":"PrinterInput","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":7}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":12,"char":8},"end":{"line":12,"char":18}}},{"name":"location","range":{"start":{"line":11,"char":-24},"end":{"line":11,"char":-1}}},{"name":"port","range":{"start":{"line":9,"char":14},"end":{"line":14,"char":-1}}}]}],"id":6}],"execution":"concurrent","file":"\/aggregator.ol","ranges":[{"name":"svc_name","range":{"start":{"line":7,"char":8},"end":{"line":7,"char":18}}},{"name":"embed_Console","range":{"start":{"line":11,"char":10},"end":{"line":12,"char":-1}}},{"name":"embed_Fax","range":{"start":{"line":25,"char":10},"end":{"line":26,"char":-1}}},{"name":"embed_Printer","range":{"start":{"line":26,"char":10},"end":{"line":27,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":11,"char":10},"end":{"line":12,"char":-1}}}]},{"name":"printer","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":4}],"location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":16,"char":8},"end":{"line":16,"char":18}}},{"name":"location","range":{"start":{"line":15,"char":-24},"end":{"line":15,"char":-1}}},{"name":"port","range":{"start":{"line":13,"char":15},"end":{"line":18,"char":-1}}}]},{"name":"Fax","protocol":"sodep","interfaces":[{"name":"FaxInterface","id":5}],"location":"socket:\/\/localhost:9001","ranges":[{"name":"protocol","range":{"start":{"line":22,"char":8},"end":{"line":22,"char":18}}},{"name":"location","range":{"start":{"line":21,"char":-24},"end":{"line":21,"char":-1}}},{"name":"port","range":{"start":{"line":19,"char":15},"end":{"line":24,"char":-1}}}]}],"name":"Aggregator","inputPorts":[{"protocol":"sodep","interfaces":[{"name":"AggregatorInterface","id":8}],"ranges":[{"name":"protocol","range":{"start":{"line":31,"char":8},"end":{"line":31,"char":18}}},{"name":"location","range":{"start":{"line":30,"char":-24},"end":{"line":30,"char":-1}}},{"name":"port","range":{"start":{"line":28,"char":14},"end":{"line":34,"char":-1}}}],"name":"Aggregator","location":"socket:\/\/localhost:9002","aggregates":[{"name":"printer"},{"name":"Fax"}]}],"id":2}]]}`
				`{"name":"redirect","interfaces":[{"name":"SubInterface","file":"\/sub.ol","id":0,"reqres":[{"name":"sub","res":"double","req":"SubRequest"}]},{"name":"SumInterface","file":"\/sum.ol","id":1,"reqres":[{"name":"sum","res":"double","req":"SumRequest"}]},{"name":"ConsoleIface","id":2,"reqres":[{"name":"print","res":"void","req":"undefined"},{"name":"println","res":"void","req":"undefined"},{"name":"registerForInput","res":"void","req":"RegisterForInputRequest"},{"name":"unsubscribeSessionListener","res":"void","req":"UnsubscribeSessionListener"},{"name":"subscribeSessionListener","res":"void","req":"SubscribeSessionListener"},{"name":"enableTimestamp","res":"void","req":"EnableTimestampRequest"},{"name":"readLine","res":"string","req":"ReadLineRequest"}]},{"name":"SubInterface","file":"\/redirector.ol","id":3,"reqres":[{"name":"sub","res":"double","req":"SubRequest"}]},{"name":"SumInterface","file":"\/redirector.ol","id":4,"reqres":[{"name":"sum","res":"double","req":"SumRequest"}]},{"name":"SubInterface","file":"\/client.ol","id":5,"reqres":[{"name":"sub","res":"double","req":"SubRequest"}]},{"name":"SumInterface","file":"\/client.ol","id":6,"reqres":[{"name":"sum","res":"double","req":"SumRequest"}]}],"types":[{"name":"SubRequest","subTypes":[{"name":"x","file":"\/SubInterface.ol","type":"double"},{"name":"y","file":"\/SubInterface.ol","type":"double"}],"file":"\/SubInterface.ol"},{"name":"SumRequest","subTypes":[{"name":"x","file":"\/SumInterface.ol","type":"double"},{"name":"y","file":"\/SumInterface.ol","type":"double"}],"file":"\/SumInterface.ol"},{"name":"undefined","type":"any"},{"name":"RegisterForInputRequest","subTypes":[{"name":"enableSessionListener","type":"bool"}]},{"name":"UnsubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"SubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"EnableTimestampRequest","subTypes":[{"name":"format","type":"string"}],"type":"bool"},{"name":"ReadLineRequest","subTypes":[{"name":"secret","type":"bool"}]}],"services":[[{"execution":"concurrent","file":"\/sub.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":11}}}],"name":"Sub","inputPorts":[{"name":"Sub","protocol":"sodep","interfaces":[{"name":"SubInterface","id":0}],"location":"socket:\/\/localhost:9001","ranges":[{"name":"protocol","range":{"start":{"line":9,"char":8},"end":{"line":9,"char":18}}},{"name":"location","range":{"start":{"line":8,"char":-24},"end":{"line":8,"char":-1}}},{"name":"port","range":{"start":{"line":6,"char":14},"end":{"line":11,"char":-1}}}]}],"id":0},{"execution":"concurrent","file":"\/sum.ol","ranges":[{"name":"svc_name","range":{"start":{"line":2,"char":8},"end":{"line":2,"char":11}}}],"name":"Sum","inputPorts":[{"name":"Sum","protocol":"sodep","interfaces":[{"name":"SumInterface","id":1}],"location":"socket:\/\/localhost:9002","ranges":[{"name":"protocol","range":{"start":{"line":9,"char":8},"end":{"line":9,"char":18}}},{"name":"location","range":{"start":{"line":8,"char":-24},"end":{"line":8,"char":-1}}},{"name":"port","range":{"start":{"line":6,"char":14},"end":{"line":11,"char":-1}}}]}],"id":1},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":2}],"location":"local"}],"parentPort":"Console","id":3}],"execution":"single","file":"\/redirector.ol","ranges":[{"name":"svc_name","range":{"start":{"line":4,"char":8},"end":{"line":4,"char":18}}},{"name":"embed_Console","range":{"start":{"line":8,"char":10},"end":{"line":9,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":2}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":8,"char":10},"end":{"line":9,"char":-1}}}]},{"name":"SubService","protocol":"sodep","interfaces":[{"name":"SubInterface","id":3}],"location":"socket:\/\/localhost:9001","ranges":[{"name":"protocol","range":{"start":{"line":13,"char":8},"end":{"line":13,"char":18}}},{"name":"location","range":{"start":{"line":12,"char":-24},"end":{"line":12,"char":-1}}},{"name":"port","range":{"start":{"line":10,"char":15},"end":{"line":15,"char":-1}}}]},{"name":"SumService","protocol":"sodep","interfaces":[{"name":"SumInterface","id":4}],"location":"socket:\/\/localhost:9002","ranges":[{"name":"protocol","range":{"start":{"line":19,"char":8},"end":{"line":19,"char":18}}},{"name":"location","range":{"start":{"line":18,"char":-24},"end":{"line":18,"char":-1}}},{"name":"port","range":{"start":{"line":16,"char":15},"end":{"line":21,"char":-1}}}]}],"name":"Redirector","inputPorts":[{"name":"Redirector","protocol":"sodep","location":"socket:\/\/localhost:9000","ranges":[{"name":"protocol","range":{"start":{"line":25,"char":8},"end":{"line":25,"char":17}}},{"name":"location","range":{"start":{"line":24,"char":-24},"end":{"line":24,"char":-1}}},{"name":"port","range":{"start":{"line":22,"char":14},"end":{"line":27,"char":-1}}}],"redirects":[{"name":"Sub","port":"SubService"},{"name":"Sum","port":"SumService"}]}],"id":2},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":2}],"location":"local"}],"parentPort":"Console","id":5}],"execution":"single","file":"\/client.ol","ranges":[{"name":"svc_name","range":{"start":{"line":4,"char":8},"end":{"line":4,"char":14}}},{"name":"embed_Console","range":{"start":{"line":6,"char":10},"end":{"line":7,"char":-1}}}],"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":2}],"location":"local","ranges":[{"name":"port","range":{"start":{"line":6,"char":10},"end":{"line":7,"char":-1}}}]},{"name":"Sub","protocol":"sodep","interfaces":[{"name":"SubInterface","id":5}],"location":"socket:\/\/localhost:9000\/!\/Sub","ranges":[{"name":"protocol","range":{"start":{"line":11,"char":8},"end":{"line":11,"char":18}}},{"name":"location","range":{"start":{"line":10,"char":-30},"end":{"line":10,"char":-1}}},{"name":"port","range":{"start":{"line":8,"char":15},"end":{"line":13,"char":-1}}}]},{"name":"Sum","protocol":"sodep","interfaces":[{"name":"SumInterface","id":6}],"location":"socket:\/\/localhost:9000\/!\/Sum","ranges":[{"name":"protocol","range":{"start":{"line":17,"char":8},"end":{"line":17,"char":18}}},{"name":"location","range":{"start":{"line":16,"char":-30},"end":{"line":16,"char":-1}}},{"name":"port","range":{"start":{"line":14,"char":15},"end":{"line":19,"char":-1}}}]}],"name":"Client","id":4}]]}`
			);
			currentGraph = await elk.layout(createSystemGraph(services));
		}
	};

	const sendVisData = async () => {
		if (!vscode) return;
		vscode.postMessage({
			command: 'visData',
			detail: JSON.stringify(generateVisFile())
		});
	};

	const vsCodeMessage = async (event: MessageEvent<any>) => {
		if (event.data.command === 'setData') {
			setDataString(event.data.data);
			await rerender();
		} else if (event.data.command === 'initData') {
			currentGraph = undefined;
			setDataString(event.data.data);
			currentGraph = await elk.layout(createSystemGraph(services));
		} else if (event.data.command === 'setRanges') {
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
			resetGraph();
			return;
		}
		await rerender();
	};

	const handleKeyboard = async (event: KeyboardEvent) => {
		if (event.key === '.') {
			console.log(services);
		}
		//close sidebar & popup
		if (event.key === 'Escape') {
			if ($current_sidebar_element.hist_type >= 0 && $current_popup.title === '') {
				clearSidebar();
				return;
			}
			if ($current_popup.title === '') return;
			await $current_popup.cancel();
			current_popup.set(noPopup);
			await resetGraph();
		}
		if (event.key === 'Enter') {
			if ($current_sidebar_element.hist_type >= 0 && $current_popup.title === '') return;
			clearSidebar();
			if ($current_popup.title === '') return;

			const res = $current_popup.confirm($current_popup.values);
			if (!res) await $current_popup.cancel();
			current_popup.set(noPopup);
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
