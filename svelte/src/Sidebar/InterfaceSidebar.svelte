<script lang="ts">
	import { openTypeSidebar, primitives } from '../lib/sidebar';

	export let interf: Interface;

	let tmp = '';
	/**
	 * When some elements are clicked on. Make the text editable and save the old text.
	 * Used for editing information.
	 * @param event MouseEvent
	 */
	const saveInnerHTML = (event: MouseEvent): void => {
		const elem = event.target as Element;
		tmp = elem.innerHTML;
		if (interf.file !== undefined) elem.setAttribute('contenteditable', 'true');
	};

	/**
	 * When user presses 'enter', save the new content and make the change in the data.
	 * @param event Keyboard event
	 */
	const finishEdit = (event: KeyboardEvent): void => {
		if (event.key === 'Enter') {
			const elem = event.target as Element;
			elem.removeAttribute('contenteditable');
			const change = elem.innerHTML.trim().replaceAll('&nbsp;', '');
			if (change === tmp) return;
			// ! NOT IMPLEMENTED
		}
	};
</script>

<h1
	class="text-center text-4xl mt-1 mb-4 line-break"
	on:click|stopPropagation={saveInnerHTML}
	on:keydown|stopPropagation={(e) => finishEdit(e)}
>
	{interf.name}
</h1>
<h4 class="text-2xl mb-2">Type: Interface</h4>
{#if interf.reqres && interf.reqres.length > 0}
	<hr />
	<h4 class="text-2xl mt-1 mb-2">Request-Response:</h4>
	<ul class="mb-4 list-disc mx-6">
		{#each interf.reqres as rr}
			<li class="text-xl my-2">
				{rr.name} -
				<span
					class={primitives.includes(rr.req.name.toLowerCase()) ? '' : 'cursor-pointer'}
					on:click={() => openTypeSidebar(rr.req.name, rr.req.file)}
					on:keydown={() => openTypeSidebar(rr.req.name, rr.req.file)}>{rr.req.name}</span
				>
				,
				<span
					class={primitives.includes(rr.res.name.toLowerCase()) ? '' : 'cursor-pointer'}
					on:click={() => openTypeSidebar(rr.res.name, rr.res.file)}
					on:keydown={() => openTypeSidebar(rr.res.name, rr.res.file)}>{rr.res.name}</span
				>
			</li>
		{/each}
	</ul>
{/if}
{#if interf.oneway && interf.oneway.length > 0}
	<hr />
	<h4 class="text-2xl mt-1 mb-2">One-Way:</h4>
	<ul class="mb-4 list-disc mx-6">
		{#each interf.oneway as ow}
			<li class="text-xl cursor-pointer my-2">
				{ow.name} -
				<span
					class={primitives.includes(ow.req.name.toLowerCase()) ? '' : 'cursor-pointer'}
					on:click={() => openTypeSidebar(ow.req.name, ow.req.file)}
					on:keydown={() => openTypeSidebar(ow.req.name, ow.req.file)}>{ow.req.name}</span
				>
			</li>
		{/each}
	</ul>
{/if}
