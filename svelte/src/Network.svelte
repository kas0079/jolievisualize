<script lang="ts">
	import type { ElkNode } from 'elkjs/lib/elk.bundled';
	import { afterUpdate } from 'svelte';
	import Edge from './Edge.svelte';
	import { vscode } from './lib/data';
	import { drawNetwork } from './lib/draw';
	import Port from './Port.svelte';
	import Service from './Service.svelte';

	export let network: ElkNode;

	afterUpdate(() => {
		drawNetwork(network);
	});
</script>

{#if network.children && network.children.length > 0}
	<g id={network.id}>
		<rect class="outline-dashed fill-none outline-1" />
		{#each network.children as child}
			{#if child.id !== '!leaf'}
				<Service serviceNode={child} on:message parent={undefined} />
			{/if}
		{/each}
		{#if network.edges && network.edges.length > 0}
			{#each network.edges as edge}
				<Edge {edge} white={vscode !== undefined} />
			{/each}
		{/if}
		{#if network.ports && network.ports.length > 0}
			{#each network.ports as port}
				<Port portNode={port} parentService={undefined} />
			{/each}
		{/if}
	</g>
{/if}
