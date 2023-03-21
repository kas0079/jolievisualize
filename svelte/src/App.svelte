<script lang="ts">
	import Error from './Error.svelte';
	import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled';
	import Edge from './Edge.svelte';
	import { loading, sendVisData, services, setDataString, vscode } from './lib/data';
	import { error } from './lib/error';
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

			const res = await $current_popup.confirm($current_popup.values);
			if (!res) await $current_popup.cancel();
			closePopup();
			if (!res) await resetGraph();
			await rerender();
		}
	};
</script>

<svelte:window on:keydown={handleKeyboard} on:message|stopPropagation={vsCodeMessage} />
{#await layoutGraph()}
	<main><p>Loading...</p></main>
{:then _}
	{#if $error.error === true}
		<Error />
	{:else}
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
				<Popup on:cancel={resetGraph} on:rerender={rerender} />
			{/if}
		</main>
	{/if}
{/await}
