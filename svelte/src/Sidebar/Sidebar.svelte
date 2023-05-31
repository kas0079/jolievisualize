<script lang="ts">
	import { fly } from 'svelte/transition';
	import { vscode } from '../lib/data';
	import { backSidebar, clearSidebar, current_sidebar_element } from '../lib/sidebar';
	import InterfaceSidebar from './InterfaceSidebar.svelte';
	import PortSidebar from './PortSidebar.svelte';
	import SelectionSidebar from './SelectionSidebar.svelte';
	import ServiceSidebar from './ServiceSidebar.svelte';
	import TypeSidebar from './TypeSidebar.svelte';

	let resizeMode = false;
	let x = 0;

	/**
	 * Clicking on resize bar starts resize mode
	 * @param event MouseEvent
	 */
	const resizeStart = (event: MouseEvent): void => {
		if (resizeMode) return;
		resizeMode = true;
		x = window.innerWidth - event.clientX;
	};

	/**
	 * Moving the mouse while in resize mode resizes the sidebar
	 * @param event MouseEvent
	 */
	const resize = (event: MouseEvent): void => {
		if (!resizeMode) return;
		if (x < 250) x = 250;
		else if (x > window.innerWidth - 20) x = window.innerWidth - 20;
		x -= event.movementX;
	};

	/**
	 * Sends an 'open file' message to vscode
	 */
	const openFile = (): void => {
		const file = $current_sidebar_element.getFile();
		if (vscode)
			vscode.postMessage({
				command: 'open.file',
				detail: {
					file
				}
			});
	};
</script>

<svelte:window
	on:mouseup|stopPropagation={() => {
		resizeMode = false;
	}}
	on:mousemove={resize}
/>
{#if $current_sidebar_element.hist_type >= 0}
	<div
		id="sidebar"
		class="absolute top-0 right-0 w-8/12 sm:w-1/2 lg:w-4/12 xl:w-3/12 h-full bg-gray-800 overflow-x-hidden overflow-y-scroll"
		style={x == 0 ? '' : `width: ${x}px;`}
		in:fly={{ duration: 150, x: 1000 }}
		out:fly={{ duration: 1000, x: 2000 }}
	>
		<div
			on:mousedown|stopPropagation={resizeStart}
			class={vscode !== undefined
				? 'w-2 h-full bg-gray-200 absolute cursor-col-resize'
				: 'w-2 h-full bg-gray-900 absolute cursor-col-resize'}
		/>
		<div class="m-auto w-full min-w-fit text-white px-6 select-none">
			<div class="font-mono text-xl mt-4 flex gap-5 justify-between flex-row-reverse">
				<p
					class="w-fit cursor-pointer text-4xl -mt-1 self-center"
					on:click={() => {
						clearSidebar();
					}}
					on:keypress={() => {
						clearSidebar();
					}}
				>
					&#x2715;
				</p>
				{#if vscode && $current_sidebar_element.getFile()}
					<p
						class="w-fit cursor-pointer text-2xl -mt-3 self-center"
						on:click={() => openFile()}
						on:keypress={() => openFile()}
					>
						&#10100;&#10101;
					</p>
				{/if}
				<p
					class="text-4xl -mt-1 h-0 cursor-pointer w-fit self-start"
					on:click={() => {
						backSidebar();
					}}
					on:keydown={() => {}}
				>
					&larr;
				</p>
			</div>
			{#if $current_sidebar_element.hist_type === 1}
				<PortSidebar
					port={$current_sidebar_element.port}
					portType={$current_sidebar_element.portType}
					parentID={$current_sidebar_element.port_parentID}
					on:reloadgraph
				/>
			{/if}
			{#if $current_sidebar_element.hist_type === 0}
				<ServiceSidebar service={$current_sidebar_element.service} on:reloadgraph />
			{/if}
			{#if $current_sidebar_element.hist_type === 2}
				<InterfaceSidebar interf={$current_sidebar_element.interf} />
			{/if}
			{#if $current_sidebar_element.hist_type === 3}
				<TypeSidebar type={$current_sidebar_element.type} />
			{/if}
			{#if $current_sidebar_element.hist_type === 4}
				<SelectionSidebar serviceList={$current_sidebar_element.serviceList} on:reloadgraph />
			{/if}
		</div>
	</div>
{/if}

<style>
	#sidebar::-webkit-scrollbar {
		display: none;
	}
</style>
