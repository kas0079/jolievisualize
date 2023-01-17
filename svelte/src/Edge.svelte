<script lang="ts">
	import type { ElkExtendedEdge } from 'elkjs/lib/elk-api';
	import { afterUpdate } from 'svelte';

	export let edge: ElkExtendedEdge;
	export let white: boolean;

	const drawEdge = () => {
		let drawPath = `M${edge.sections[0].startPoint.x},${edge.sections[0].startPoint.y} `;
		edge.sections.forEach((s) => {
			if (s.bendPoints) s.bendPoints.forEach((bp) => (drawPath += `L${bp.x},${bp.y} `));
			drawPath += `L${s.endPoint.x},${s.endPoint.y} `;
		});

		d3.select(`#${edge.id}`).attr('d', drawPath);
	};
	afterUpdate(() => drawEdge());
</script>

<path id={edge.id} class={white ? 'stroke-white' : 'stroke-black'} />

<style>
	path {
		stroke-width: 0.5;
		fill: none;
	}
</style>
