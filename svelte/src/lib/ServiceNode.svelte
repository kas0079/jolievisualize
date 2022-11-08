<script lang="ts">
	import { placegraph } from './data/data';
	import { pgRoot } from './store';
	import { initGrid } from './grid/grid';
	import { drawService } from './system/service';

	export let node: pgNode;
	export let service: Service;

	const drawString = drawService(service);

	const setNewRoot = () => {
		if (node.nodes.length <= 1) return;
		const nextRoot = placegraph
			.flatMap((t) => t.nodes)
			.find((t) => t.id === service.id && t.type === 'service');
		pgRoot.set(nextRoot);
		initGrid();
	};
</script>

<div id="{node.name}{node.id}" class="absolute w-1 h-1">
	<svg class="overflow-visible w-1 h-1">
		<path
			d={drawString}
			class="hover:cursor-pointer"
			on:click|preventDefault|stopPropagation={setNewRoot}
			on:keydown={setNewRoot}
		/>
		<text
			text-anchor="middle"
			stroke="#000"
			class="absolute hover:cursor-pointer select-none font-light"
			style="font-size: 1.4rem"
			x={service.center[0]}
			y={service.center[1] + 4}
			on:click|preventDefault|stopPropagation={setNewRoot}
			on:keydown={setNewRoot}>{node.name}</text
		>
	</svg>
</div>

<style>
	div svg path {
		fill: orange;
	}
</style>
