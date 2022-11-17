<script lang="ts">
	import { tick } from 'svelte';

	export let port: Port;
	export let isOutputPort: boolean; //0 = input, 1 = output

	const populatePortCoords = async () => {
		await tick();

		return port;
	};
</script>

{#await populatePortCoords() then p}
	{#if p.x}
		<circle
			cx={p.x}
			cy={p.y}
			r={10}
			class={'' + (isOutputPort ? 'fill-outputPort' : 'fill-inputPort')}
		/>
	{/if}
{/await}
