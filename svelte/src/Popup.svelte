<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { closePopup, current_popup } from './lib/popup';

	const dispatcher = createEventDispatcher();

	/**
	 * Clicking cancel on popup calls the callback function.
	 */
	const cancel = async (): Promise<void> => {
		await $current_popup.cancel();
		closePopup();
		dispatcher('cancel');
	};

	/**
	 * Clicking confirm on popup calls the callback function.
	 */
	const confirm = async (): Promise<void> => {
		const res = await $current_popup.confirm($current_popup.values);
		if (!res) await cancel();
		else {
			closePopup();
			dispatcher('rerender');
		}
	};
</script>

<div
	class="w-full h-full absolute top-0 left-0 flex justify-center"
	style="background-color: rgba(0,0,0,0.8)"
>
	<div class="absolute bg-gray-800 max-h-[800px] text-white top-12 rounded-md">
		<h2 class="text-center text-xl my-2 px-3">{$current_popup.title}</h2>
		<div
			id="popup-content"
			class="px-5 grid gap-2 mt-4 max-h-[600px] overflow-scroll"
			style="grid-template-columns: auto 1fr;"
		>
			{#each $current_popup.values as val}
				{#if val.field !== ''}
					<p class="grid self-center">{val.fieldName}:</p>
					<input
						class="grid text-gray-900 p-2 rounded-sm self-center"
						type="text"
						placeholder={val.fieldName}
						bind:value={val.val}
					/>
				{:else}
					<hr class="col-span-2" />
				{/if}
			{/each}
		</div>

		<div class="flex text-gray-900 justify-end mt-4">
			<button class="bg-service p-2 m-2 rounded-md hover:bg-serviceHighlight" on:click={cancel}
				>Cancel</button
			>
			<button class="bg-service p-2 m-2 rounded-md hover:bg-serviceHighlight" on:click={confirm}
				>Confirm</button
			>
		</div>
	</div>
</div>

<style>
	#popup-content::-webkit-scrollbar {
		display: none;
	}
</style>
