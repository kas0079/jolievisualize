<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { createAggregator, isAggregateable } from '../lib/patterns/aggregator';
	export let serviceList: Service[];

	let aggregateable = false;
	let aggregateableReason = '';
	let circuitbreakable = false;
	let redirectable = false;

	beforeUpdate(() => {
		aggregateable = isAggregateable(serviceList).aggregateable;
		aggregateableReason = isAggregateable(serviceList).reason;
	});
</script>

<h1 class="text-center text-4xl mt-1 mb-4">Selection</h1>

<p class="text-2xl pb-2">Apply Pattern:</p>
<div class="mb-2 w-full flex flex-wrap gap-2 justify-center item-center">
	{#if aggregateable}
		<button
			class="bg-slate-900 border px-3 py-2 hover:bg-slate-700"
			on:click={() => createAggregator(serviceList)}>Aggregator</button
		>
	{:else}
		<button
			class="bg-slate-600 border px-3 py-2  border-slate-400 text-slate-400"
			disabled
			title={aggregateableReason}>Aggregator</button
		>
	{/if}

	{#if circuitbreakable}
		<button
			class="bg-slate-900 border px-3 py-2 hover:bg-slate-700"
			on:click={() => createAggregator(serviceList)}>Circuit Breaker</button
		>
	{:else}
		<button
			class="bg-slate-600 border px-3 py-2  border-slate-400 text-slate-400"
			disabled
			title="Not Implemented">Circuit Breaker</button
		>
	{/if}

	{#if redirectable}
		<button
			class="bg-slate-900 border px-3 py-2 hover:bg-slate-700"
			on:click={() => createAggregator(serviceList)}>Redirector</button
		>
	{:else}
		<button
			class="bg-slate-600 border px-3 py-2  border-slate-400 text-slate-400"
			disabled
			title="Not Implemented">Redirector</button
		>
	{/if}
</div>

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
