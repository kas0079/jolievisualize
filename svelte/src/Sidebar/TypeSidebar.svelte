<script lang="ts">
	import { openTypeSidebar } from '../lib/sidebar';

	export let type: Type;

	let tmp = '';
	/**
	 * When some elements are clicked on. Make the text editable and save the old text.
	 * Used for editing information.
	 * @param event MouseEvent
	 */
	const saveInnerHTML = (event: MouseEvent): void => {
		const elem = event.target as Element;
		tmp = elem.innerHTML;
		if (type.file !== undefined) elem.setAttribute('contenteditable', 'true');
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
	{type.name}
</h1>
<h4 class="text-2xl mb-2">Type: Type</h4>
<h4 class="text-2xl mb-2">Root Type: {type.type ?? 'void'}</h4>
{#if type.leftType && type.rightType}
	<h4 class="text-2xl mb-2">
		Left Type: <span
			class="cursor-pointer"
			on:click={() => openTypeSidebar(type.leftType)}
			on:keydown={() => openTypeSidebar(type.leftType)}>{type.leftType}</span
		>
	</h4>
	<h4 class="text-2xl mb-2">
		Right Type: <span
			class="cursor-pointer"
			on:click={() => openTypeSidebar(type.rightType)}
			on:keydown={() => openTypeSidebar(type.rightType)}>{type.rightType}</span
		>
	</h4>
{/if}
{#if type.subTypes && type.subTypes.length > 0}
	<hr />
	<h4 class="text-2xl mb-2">Subtypes:</h4>
	<ul class="mb-4 list-disc mx-6">
		{#each type.subTypes as st}
			<li class="text-xl my-2">
				{st.name}: {st.type}
				{#if st.subTypes && st.subTypes.length > 0}
					<span
						class="cursor-pointer"
						on:click={() => openTypeSidebar(st.name)}
						on:keydown={() => openTypeSidebar(st.name)}>{'{...subtypes}'}</span
					>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
