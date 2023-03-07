<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { vscode } from '../lib/data';
	import { addPort } from '../lib/refactoring/create';
	import { findRange, isDockerService } from '../lib/service';
	import { openPortFromServiceSidebar, openServiceIdSidebar } from '../lib/sidebar';
	import { getServicePatternType } from './../lib/patterns';

	export let service: Service;

	let tmp = '';
	const saveInnerHTML = (event: MouseEvent): void => {
		const elem = event.target as Element;
		tmp = elem.innerHTML;
		if (service.file !== undefined) elem.setAttribute('contenteditable', 'true');
	};

	const dispatcher = createEventDispatcher();
	const finishEdit = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			const elem = event.target as Element;
			elem.removeAttribute('contenteditable');
			const change = elem.innerHTML.trim().replaceAll('&nbsp;', '');
			if (change === tmp) return;
			if (!service.file) {
				elem.innerHTML = tmp;
				return;
			}
			service.name = change;
			dispatcher('reloadgraph');
			if (!vscode) return;
			vscode.postMessage({
				command: `rename.service`,
				save: true,
				detail: {
					filename: service.file,
					newServiceName: change,
					range: findRange(service, 'svc_name')
				}
			});
		}
	};
</script>

<h1
	class="text-center text-4xl mt-1 mb-4 line-break"
	on:click|stopPropagation={saveInnerHTML}
	on:keydown|stopPropagation={(e) => finishEdit(e)}
>
	{service.name}
</h1>

<h4 class="text-2xl mb-2">Type: {isDockerService(service) ? 'Docker ' : ''}Service</h4>

{#if getServicePatternType(service)}
	<h4 class="text-2xl mb-2">Annotation: {getServicePatternType(service)}</h4>
{/if}

{#if isDockerService(service)}
	<h4 class="text-2xl mb-2">Image: {service.image}</h4>
	<hr />
	<h4 class="text-2xl mt-1 mb-2">Docker Ports:</h4>
	{#if service.ports && service.ports.length > 0}
		<ul class="mb-4 list-disc mx-6">
			{#each service.ports as port}
				<li class="text-xl my-2">{port.eport}:{port.iport}</li>
			{/each}
		</ul>
	{/if}
{:else}
	<h4 class="text-2xl mb-2">Execution: {service.execution}</h4>
	<hr />
	<h4 class="text-2xl mt-1 mb-2">
		Input Ports:
		{#if service.file}
			<span
				class="float-right cursor-pointer text-3xl"
				on:click={() => addPort('Input', service)}
				on:keydown={() => addPort('Input', service)}>+</span
			>
		{/if}
	</h4>
	{#if service.inputPorts && service.inputPorts.length > 0}
		<ul class="mb-4 list-disc mx-6">
			{#each service.inputPorts as ip}
				<li
					class="text-xl cursor-pointer my-2"
					on:click={(e) => openPortFromServiceSidebar(e, service, 'ip')}
					on:keydown={(e) => openPortFromServiceSidebar(e, service, 'ip')}
				>
					{ip.name}{ip.location.startsWith('!local') || ip.location.startsWith('!local')
						? ''
						: ' - ' + ip.location} - {ip.protocol}
				</li>
			{/each}
		</ul>
	{/if}
	<hr />
	<h4 class="text-2xl mt-1 mb-2">
		Output Ports:
		{#if service.file}
			<span
				class="float-right cursor-pointer text-3xl"
				on:click={() => addPort('Output', service)}
				on:keydown={() => addPort('Output', service)}>+</span
			>
		{/if}
	</h4>
	{#if service.outputPorts && service.outputPorts.length > 0}
		<ul class="mb-4 list-disc mx-6">
			{#each service.outputPorts as op}
				<li
					class="text-xl cursor-pointer my-2"
					on:click={(e) => openPortFromServiceSidebar(e, service, 'op')}
					on:keydown={(e) => openPortFromServiceSidebar(e, service, 'op')}
				>
					{op.name}{op.location.startsWith('!local') || op.location.startsWith('local')
						? ''
						: ' - ' + op.location} - {op.protocol}
				</li>
			{/each}
		</ul>
	{/if}
	{#if service.embeddings && service.embeddings.length > 0}
		<hr />
		<h4 class="text-2xl mt-1 mb-2">Embeddings:</h4>
		<ul class="mb-4 list-disc mx-6">
			{#each service.embeddings as embed}
				<li
					class="text-xl cursor-pointer my-2"
					on:click={() => openServiceIdSidebar(embed.id)}
					on:keydown={() => openServiceIdSidebar(embed.id)}
				>
					{embed.name}
				</li>
			{/each}
		</ul>
	{/if}
{/if}
