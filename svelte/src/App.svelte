<script lang="ts">
	import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled';
	import Edge from './Edge.svelte';
	import { services } from './lib/data';
	import { handleExpandServiceEvent, handleShrinkServiceEvent } from './lib/eventHandlers';
	import { createSystemGraph } from './lib/graph';
	import Network from './Network.svelte';
	import ZoomComp from './ZoomComp.svelte';

	const elk = new ELK();

	let currentGraph: ElkNode | undefined;
	let zoomComp: ZoomComp;

	const layoutGraph = async () => {
		currentGraph = await elk.layout(createSystemGraph(services));
	};

	const updateGraph = async (event: CustomEvent) => {
		if (currentGraph === undefined) return;
		if (event.detail.action === 'expandService') handleExpandServiceEvent(event, currentGraph);
		if (event.detail.action === 'shrinkService') handleShrinkServiceEvent(event, currentGraph);
		currentGraph = await elk.layout(currentGraph);
		if (event.detail.action === 'expandService') zoomComp.zoomInto(event, currentGraph);
	};
</script>

{#await layoutGraph()}
	<main><p>...loading</p></main>
{:then _}
	<main>
		<svg class="w-screen h-screen">
			<g>
				<ZoomComp bind:this={zoomComp} />
				{#each currentGraph.children as child}
					<Network network={child} on:message={updateGraph} />
				{/each}
				{#each currentGraph.edges as edge}
					<Edge {edge} />
				{/each}
			</g>
		</svg>
		<!-- TODO add sidebar here -->
	</main>
{/await}
