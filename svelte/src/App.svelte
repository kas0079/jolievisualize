<script lang="ts">
	import { current_sidebar_element, noSidebar } from './lib/sidebar';
	import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled';
	import { services, setDataString, vscode } from './lib/data';
	import Edge from './Edge.svelte';
	import {
		handleExpandServiceEvent,
		handleShrinkServiceEvent,
		rerenderGraph
	} from './lib/eventHandlers';
	import { createSystemGraph } from './lib/graph';
	import { SidebarElement } from './lib/sidebar';
	import Network from './Network.svelte';
	import Sidebar from './Sidebar/Sidebar.svelte';
	import ZoomComp from './ZoomComp.svelte';
	import { current_popup, noPopup } from './lib/popup';
	import Popup from './Popup.svelte';

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
				`{"name":"aggregation_and_embedding","interfaces":[{"name":"ConsoleIface","id":0,"reqres":[{"name":"print","res":"void","req":"undefined"},{"name":"println","res":"void","req":"undefined"},{"name":"registerForInput","res":"void","req":"RegisterForInputRequest"},{"name":"unsubscribeSessionListener","res":"void","req":"UnsubscribeSessionListener"},{"name":"subscribeSessionListener","res":"void","req":"SubscribeSessionListener"},{"name":"enableTimestamp","res":"void","req":"EnableTimestampRequest"},{"name":"readLine","res":"string","req":"ReadLineRequest"}]},{"name":"PrinterInterface","file":"\/aggregator.ol","id":1,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"FaxInterface","file":"\/aggregator.ol","id":2,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]},{"name":"FaxInterface","file":"\/fax.ol","id":3,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]},{"name":"PrinterInterface","file":"\/printer.ol","id":4,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"AggregatorInterface","file":"\/aggregator.ol","id":5,"reqres":[{"name":"faxAndPrint","res":"void","req":"FaxAndPrintRequest"}]},{"name":"AggregatorInterface","file":"\/client.ol","id":6,"reqres":[{"name":"faxAndPrint","res":"void","req":"FaxAndPrintRequest"}]},{"name":"PrinterInterface","file":"\/client.ol","id":7,"reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"FaxInterface","file":"\/client.ol","id":8,"reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]}],"types":[{"name":"undefined","type":"any"},{"name":"RegisterForInputRequest","subTypes":[{"name":"enableSessionListener","type":"bool"}]},{"name":"UnsubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"SubscribeSessionListener","subTypes":[{"name":"token","type":"string"}]},{"name":"EnableTimestampRequest","subTypes":[{"name":"format","type":"string"}],"type":"bool"},{"name":"ReadLineRequest","subTypes":[{"name":"secret","type":"bool"}]},{"name":"PrintRequest","subTypes":[{"name":"content","file":"\/PrinterInterface.ol","type":"string"}],"file":"\/PrinterInterface.ol"},{"name":"PrintResponse","file":"\/PrinterInterface.ol","type":"JobID"},{"name":"JobID","subTypes":[{"name":"jobId","file":"\/PrinterInterface.ol","type":"string"}],"file":"\/PrinterInterface.ol"},{"name":"FaxRequest","subTypes":[{"name":"destination","file":"\/FaxInterface.ol","type":"string"},{"name":"content","file":"\/FaxInterface.ol","type":"string"}],"file":"\/FaxInterface.ol"},{"name":"FaxAndPrintRequest","subTypes":[{"name":"print","file":"\/AggregatorInterface.ol","type":"PrintRequest"},{"name":"fax","file":"\/AggregatorInterface.ol","type":"FaxRequest"}],"file":"\/AggregatorInterface.ol"}],"services":[[{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":1},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":3}],"execution":"concurrent","file":"\/fax.ol","parentPort":"Fax","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"name":"Fax","inputPorts":[{"name":"FaxInput","protocol":"sodep","interfaces":[{"name":"FaxInterface","id":3}],"location":"socket:\/\/localhost:9001"}],"id":2},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":5}],"execution":"concurrent","file":"\/printer.ol","parentPort":"printer","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"name":"Printer","inputPorts":[{"name":"PrinterInput","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":4}],"location":"socket:\/\/localhost:9000"}],"id":4}],"execution":"concurrent","file":"\/aggregator.ol","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"},{"name":"printer","protocol":"sodep","interfaces":[{"name":"PrinterInterface","id":1}],"location":"socket:\/\/localhost:9000"},{"name":"Fax","protocol":"sodep","interfaces":[{"name":"FaxInterface","id":2}],"location":"socket:\/\/localhost:9001"}],"name":"Aggregator","inputPorts":[{"name":"Aggregator","protocol":"sodep","interfaces":[{"name":"AggregatorInterface","id":5}],"location":"socket:\/\/localhost:9002","aggregates":[{"name":"printer"},{"name":"Fax"}]}],"id":0},{"embeddings":[{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"}],"parentPort":"Console","id":7}],"execution":"single","file":"\/client.ol","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface","id":0}],"location":"local"},{"name":"Aggregator","protocol":"sodep","interfaces":[{"name":"AggregatorInterface","id":6},{"name":"PrinterInterface","id":7},{"name":"FaxInterface","id":8}],"location":"socket:\/\/localhost:9002"}],"name":"Client","id":6}]]}`
			);
			currentGraph = await elk.layout(createSystemGraph(services));
		}
	};

	const setData = async (event: MessageEvent<any>) => {
		if (event.data.command === 'setdata') {
			setDataString(event.data.data);
			currentGraph = await elk.layout(createSystemGraph(services));
		}
	};

	const layoutGraph = async () => {
		currentGraph = await elk.layout(createSystemGraph(services));
		await getData();
	};

	const rerender = async () => {
		rerenderGraph(currentGraph);
		currentGraph = await elk.layout(currentGraph);
	};

	const updateGraph = async (event: CustomEvent) => {
		if (currentGraph === undefined) return;
		if (event.detail.action === 'expandService') handleExpandServiceEvent(event, currentGraph);
		if (event.detail.action === 'shrinkService') handleShrinkServiceEvent(event, currentGraph);
		currentGraph = await elk.layout(currentGraph);
	};

	const openSidebar = (event: CustomEvent) => {
		current_sidebar_element.set(event.detail.elem);
	};

	const handleKeyboard = async (event: KeyboardEvent) => {
		//close sidebar
		if (event.key === 'Escape') {
			current_sidebar_element.set(noSidebar);
			current_popup.set(noPopup);
		}
	};
</script>

<svelte:window on:keydown={handleKeyboard} on:message|stopPropagation={setData} />
{#await layoutGraph()}
	<main><p>...loading</p></main>
{:then _}
	<main>
		<svg class="w-screen h-screen">
			{#if currentGraph}
				<g>
					<ZoomComp />
					{#each currentGraph.children as child}
						<Network network={child} on:message={updateGraph} on:opensidebar={openSidebar} />
					{/each}
					{#each currentGraph.edges as edge}
						<Edge {edge} white={vscode !== undefined} />
					{/each}
				</g>
			{/if}
		</svg>
		{#if $current_sidebar_element.hist_type >= 0}
			<Sidebar on:reloadgraph={rerender} on:opensidebar={openSidebar} />
		{/if}
		{#if $current_popup.values.length > 0}
			<Popup />
		{/if}
	</main>
{/await}
