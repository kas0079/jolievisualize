<script lang="ts">
	import { services } from './lib/data/data';
	import Cell from './lib/Cell.svelte';
	import { gridOptions, initGrid } from './lib/grid/grid';
	import { pgRoot } from './lib/store';
	import { getServiceFromID, setServicePosition, sizeServices } from './lib/system/service';

	const gs = gridOptions.gridSize;
	const visibleServices: Service[] = [];
	const update = (pgroot: pgNode) => {
		if (pgroot.nodes.length > 1) {
			pgroot.nodes.forEach((node) => {
				if (node.type !== 'service') return;
				visibleServices.push(getServiceFromID(node.id, services));
			});
		}
		sizeServices(visibleServices);
		setServicePosition(visibleServices, pgroot);
		initGrid();
	};
	$: update($pgRoot);
</script>

<main class="w-full h-screen bg-white" style="background-size: {gs}px {gs}px;">
	{#if $pgRoot.nodes.length > 1}
		<Cell root={$pgRoot} services={visibleServices} />
	{/if}
</main>

<style>
	main {
		background-size: gs + 'px' gs + 'px';
		background-image: linear-gradient(to right, #bbb 1px, transparent 1px),
			linear-gradient(to bottom, #bbb 1px, transparent 1px);
	}
</style>
