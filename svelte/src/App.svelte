<script lang="ts">
	import { services } from './lib/data/data';
	import { categorize, setServicePosition } from './lib/data/preprocess';
	import { gridOptions } from './lib/grid/grid';
	import ServiceNode from './lib/ServiceNode.svelte';
	import { getServiceFromID } from './lib/system/service';
	import { pgRoot } from './stores/placegraphRoot';
	const gs = gridOptions.gridSize;

	const positionServices = (root: pgNode) => {
		const services_tmp: Service[] = [];
		root.nodes.forEach((node) => {
			if (node.type === 'service') services_tmp.push(getServiceFromID(node.id));
		});

		const categories = categorize(services_tmp);
		setServicePosition(services_tmp, categories);
		categories
			.flatMap((t) => t.svc)
			.forEach((svc) => {
				let serv = getServiceFromID(svc.id);
				serv.x = svc.x;
				serv.y = svc.y;
			});
	};

	$: positionServices($pgRoot);
</script>

<main class="w-full h-screen" style="background-size: {gs}px {gs}px;">
	<div>
		{#each $pgRoot.nodes as node}
			{#if node.type === 'service'}
				<ServiceNode {node} service={getServiceFromID(node.id)} />
			{/if}
		{/each}
	</div>
</main>

<style>
	main {
		background-color: white;
		background-size: gs + 'px' gs + 'px';
		background-image: linear-gradient(to right, #bbb 1px, transparent 1px),
			linear-gradient(to bottom, #bbb 1px, transparent 1px);
	}
</style>
