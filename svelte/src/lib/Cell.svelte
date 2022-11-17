<script lang="ts">
	import { onMount } from 'svelte';
	import { blank_object } from 'svelte/internal';
	import { gridOptions } from './grid/grid';
	import { drawPath, findPathServiceShapeIntersection } from './grid/pathFinding';
	import ServiceNode from './Service.svelte';
	import { createPathBetweenServices, renderCell } from './system/cell';

	export let root: pgNode;
	export let services: Service[];

	const d = renderCell(root);

	onMount(() => {
		const paths = createPathBetweenServices(services);
		paths.forEach((path) => {
			const points = findPathServiceShapeIntersection(path.path, path.input, path.output);
			drawPath(path.path, 1, 0, 'black', false, false, true);
			const offs = gridOptions.servicePadding * gridOptions.gridSize;
			path.op.x = points[0][0] - path.output.x + offs;
			path.op.y = points[0][1] - path.output.y + offs;
			path.ip.x = points[1][0] - path.input.x + offs;
			path.ip.y = points[1][1] - path.input.y + offs;
		});
	});
</script>

{#if root.nodes.length > 1}
	<svg class="w-1 h-1 overflow-visible">
		{#if root.type === 'network'}
			<path {d} fill="none" stroke="black" stroke-width="1px" stroke-dasharray="4" />
		{:else}
			<path {d} stroke-width="2px" class="servicecell" />
		{/if}
	</svg>
{/if}

{#each root.nodes as node}
	{#if node.type === 'service'}
		<ServiceNode {node} service={services.find((t) => t.id === node.id)} />
	{/if}
{/each}

<style>
	svg .servicecell {
		stroke: orange;
		fill: rgba(255, 202, 103, 0.441);
	}
</style>
