<script lang="ts">
	import type { ElkExtendedEdge } from 'elkjs/lib/elk-api';
	import { afterUpdate } from 'svelte';
	import { drawEdge } from './lib/draw';

	export let edge: ElkExtendedEdge;
	export let white: boolean;

	/**
	 * After html page draw, draw edge svg
	 */
	afterUpdate(() => drawEdge(edge));
</script>

<path id={edge.id} class={`fill-none stroke-[0.5] ${white ? 'stroke-white' : 'stroke-black'}`} />
