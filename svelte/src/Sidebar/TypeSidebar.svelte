<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { types, vscode } from '../lib/data';
	import { primitives, SidebarElement } from '../lib/sidebar';

	export let type: Type;

	let tmp = '';
	const saveInnerHTML = (event: MouseEvent) => {
		if (type.file === undefined && vscode === undefined) return;
		const elem = event.target as Element;
		tmp = elem.innerHTML;
		elem.setAttribute('contenteditable', 'true');
	};

	const dispatcher = createEventDispatcher();
	const finishEdit = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			const elem = event.target as Element;
			elem.removeAttribute('contenteditable');
			const change = elem.innerHTML.trim().replaceAll('&nbsp;', '');
			if (change === tmp) return;
		}
	};

	const openTypeSidebar = (typename: string) => {
		if (primitives.includes(typename.toLowerCase())) return;
		const type = types.find((t) => t.name === typename);

		if (type === undefined) return;

		const sbElemt = new SidebarElement(3, typename);
		sbElemt.type = type;
		dispatcher('opensidebar', {
			elem: sbElemt,
			action: 'sidebar_open'
		});
	};
</script>

<h1
	class="text-center text-4xl mt-1 mb-4"
	on:click|stopPropagation={saveInnerHTML}
	on:keydown|stopPropagation={(e) => finishEdit(e)}
>
	{type.name}
</h1>
<h4 class="text-2xl mb-2">Type: Type</h4>
<h4 class="text-2xl mb-2">Root Type: {type.type ?? 'void'}</h4>
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
