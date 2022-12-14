<script lang="ts">
	import { onMount } from 'svelte';

	let zoom: any;
	let svg: any;

	onMount(() => {
		const networkScale = 5;
		zoom = d3.zoom().on('zoom', (e: any) => {
			d3.select('svg g').attr('transform', e.transform);
		});
		svg = d3.select('svg');
		svg.call(zoom);
		svg.call(zoom.scaleBy, networkScale);
	});
</script>
