<script lang="ts">
	import type { ElkNode } from 'elkjs/lib/elk-api';
	import { onMount } from 'svelte';

	let zoom: any;
	let globalGroup: any;
	let svg: any;

	onMount(() => {
		const networkScale = 5;
		zoom = d3.zoom().on('zoom', (e: any) => {
			globalGroup = d3.select('svg g').attr('transform', e.transform);
		});
		svg = d3.select('svg');
		svg.call(zoom);
		svg.call(zoom.scaleBy, networkScale);
	});

	export const zoomInto = (event: CustomEvent, graph: ElkNode) => {
		// TODO zoom into services
	};
</script>
