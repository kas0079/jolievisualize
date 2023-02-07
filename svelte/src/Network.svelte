<script lang="ts">
	import type { ElkNode } from 'elkjs/lib/elk.bundled';
	import { afterUpdate } from 'svelte';
	import Edge from './Edge.svelte';
	import { vscode } from './lib/data';
	import Port from './Port.svelte';
	import Service from './Service.svelte';

	export let network: ElkNode;

	const drawNetwork = () => {
		d3.select(`#${network.id}`).attr('transform', `translate(${network.x}, ${network.y})`);
		d3.select(`#${network.id} > rect`)
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', network.width)
			.attr('height', network.height);
	};

	afterUpdate(() => {
		drawNetwork();
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
