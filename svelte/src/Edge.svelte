<script lang="ts">
	import type { ElkExtendedEdge } from 'elkjs/lib/elk-api';
	import { afterUpdate } from 'svelte';
	import { drawEdge } from './lib/draw';

	export let edge: ElkExtendedEdge;
	export let white: boolean;

	afterUpdate(() => drawEdge(edge));
</script>

<path id={edge.id} class={white ? 'stroke-white' : 'stroke-black'} />

<style>
	path {
		stroke-width: 0.5;
		fill: none;
	}
</style>
