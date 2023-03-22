<script lang="ts">
	import { onMount } from 'svelte';

	let zoom: any;
	let svg: any;

	/**
	 * On initialize create zoom functionality
	 */
	onMount(() => {
		const networkScale = 5;
		zoom = d3
			.zoom()
			.scaleExtent([1, 1000])
			.on('zoom', (e: any) => {
				d3.select('svg g').attr('transform', e.transform);
			});
		svg = d3.select('svg');
		svg.call(zoom);
		svg.call(zoom.scaleBy, networkScale);
	});
</script>
