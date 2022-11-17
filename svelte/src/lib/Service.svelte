<script lang="ts">
	import Port from './Port.svelte';
	import { gridOptions } from './grid/grid';
	import { drawService } from './system/service';

	export let node: pgNode;
	export let service: Service;

	const drawString = drawService(service);
	const padding = gridOptions.servicePadding * gridOptions.gridSize;
</script>

<svg
	id="{node.name}{node.id}"
	class="absolute z-10"
	style="height: {service.height + padding * 2}px; top: {service.y -
		padding}px; width: {service.width * 2 + padding * 2}px; left: {service.x - padding}px;"
>
	<path d={drawString} class="hover:cursor-pointer fill-service" />
	<text
		text-anchor="middle"
		stroke="#000"
		class="absolute hover:cursor-pointer select-none font-light"
		style="font-size: 1.4rem;"
		x={service.width + padding}
		y={service.height / 2 + padding + 6}>{service.name}</text
	>
	{#if service.outputPorts}
		{#each service.outputPorts as op}
			<Port port={op} isOutputPort={true} />
		{/each}
	{/if}
	{#if service.inputPorts}
		{#each service.inputPorts as ip}
			<Port port={ip} isOutputPort={false} />
		{/each}
	{/if}
</svg>

<style>
</style>
