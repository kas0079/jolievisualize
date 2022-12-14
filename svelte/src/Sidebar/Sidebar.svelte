<script lang="ts">
	import { fly } from 'svelte/transition';
	import PortSidebar from './PortSidebar.svelte';
	import type { SidebarElement } from './sidebar';

	export let current: SidebarElement;
</script>

{#if current.hist_type >= 0}
	<div
		class="absolute top-0 right-0 w-1/3 min-w-fit h-full bg-bg border-l-4"
		in:fly={{ duration: 150, x: 1000 }}
		out:fly={{ duration: 1000, x: 2000 }}
	>
		<div class="m-auto w-11/12 min-w-fit text-white px-3">
			{#if current.hist_type === 1}
				<PortSidebar port={current.port} portType={current.portType} />
			{/if}
		</div>
	</div>
{/if}
