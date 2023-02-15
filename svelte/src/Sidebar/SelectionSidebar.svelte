<script lang="ts">
	import { createAggregator } from '../lib/patterns/aggregator';

	export let serviceList: Service[];
</script>

<h1 class="text-center text-4xl mt-1 mb-4">Selection</h1>

<button class="fill-slate-900" on:click={() => createAggregator(serviceList)}>Add Aggregator</button
>

{#if serviceList && serviceList.length > 0}
	<h4 class="text-2xl mb-2">Services:</h4>
	<ul class="mb-4 list-disc mx-6">
		{#each serviceList as svc}
			<li class="text-xl my-2">
				{svc.id}: {svc.name}
			</li>
		{/each}
	</ul>
{/if}
