<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { current_popup, noPopup } from './lib/popup';

	const dispatcher = createEventDispatcher();
	const cancel = async () => {
		await $current_popup.cancel();
		current_popup.set(noPopup);
		dispatcher('cancel');
	};

	const confirm = async () => {
		const res = $current_popup.confirm($current_popup.values);
		if (!res) await cancel();
		else current_popup.set(noPopup);
	};
</script>

<div class="w-full h-full absolute top-0 left-0" style="background-color: rgba(0,0,0,0.8)">
	<div
		class="absolute bg-gray-800 text-white top-12 rounded-md"
		style="left: 50%;transform: translateX(-50%)"
	>
		<h2 class="text-center text-xl my-2">{$current_popup.title}</h2>
		<div class="px-5 grid gap-2 mt-4" style="grid-template-columns: auto 1fr;">
			{#each $current_popup.values as val}
				<p class="grid self-center">{val.field}:</p>
				<input
					class="grid text-gray-900 p-2 rounded-sm self-center"
					type="text"
					placeholder={val.field}
					bind:value={val.val}
				/>
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
