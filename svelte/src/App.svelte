<script lang="ts">
	import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled';
	import Edge from './Edge.svelte';
	import { services } from './lib/data';
	import { handleExpandServiceEvent, handleShrinkServiceEvent } from './lib/eventHandlers';
	import { createSystemGraph } from './lib/graph';
	import { SidebarElement } from './Sidebar/sidebar';
	import Network from './Network.svelte';
	import Sidebar from './Sidebar/Sidebar.svelte';
	import ZoomComp from './ZoomComp.svelte';

	const elk = new ELK();

	let currentGraph: ElkNode | undefined;
	let zoomComp: ZoomComp;

	let current_sidebar_element: SidebarElement = new SidebarElement(-1, '');
	let sidebarOpen = false;

	const layoutGraph = async () => {
		currentGraph = await elk.layout(createSystemGraph(services));
	};

	const updateGraph = async (event: CustomEvent) => {
		if (currentGraph === undefined) return;
		if (event.detail.action === 'expandService') handleExpandServiceEvent(event, currentGraph);
		if (event.detail.action === 'shrinkService') handleShrinkServiceEvent(event, currentGraph);
		currentGraph = await elk.layout(currentGraph);
	};

	const openSidebar = async (event: CustomEvent) => {
		current_sidebar_element = event.detail.elem;
		sidebarOpen = true;
	};

	const closeSidebar = (event: any) => {
		if (event.keyCode === 27 && sidebarOpen) {
			sidebarOpen = false;
			current_sidebar_element = new SidebarElement(-1, '');
		}
	};
</script>

<svelte:window on:keydown={closeSidebar} />
{#await layoutGraph()}
	<main><p>...loading</p></main>
{:then _}
	<main>
		<svg class="w-screen h-screen">
			<g>
				<ZoomComp bind:this={zoomComp} />
				{#each currentGraph.children as child}
					<Network network={child} on:message={updateGraph} on:opensidebar={openSidebar} />
				{/each}
				{#each currentGraph.edges as edge}
					<Edge {edge} />
				{/each}
			</g>
		</svg>
		{#if sidebarOpen}
			<Sidebar current={current_sidebar_element} />
		{/if}
	</main>
{/await}
