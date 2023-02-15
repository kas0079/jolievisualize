<script lang="ts">
	import { beforeUpdate, createEventDispatcher } from 'svelte';
	import { interfaces, services, vscode } from '../lib/data';
	import { findRange, getAllServices, isDockerService } from '../lib/service';
	import { current_sidebar_element, openSidebar, SidebarElement } from '../lib/sidebar';

	export let port: Port;
	export let portType: string;
	export let parentID: number;

	let isDockerPort = isDockerService(getAllServices(services).find((t) => t.id === parentID));

	let tmp = '';
	const saveInnerHTML = (event: MouseEvent) => {
		if (port.file === undefined && vscode === undefined) return;
		const elem = event.target as Element;
		tmp = elem.innerHTML;
		elem.setAttribute('contenteditable', 'true');
	};

	const dispatcher = createEventDispatcher();
	const finishEdit = (event: KeyboardEvent, editType: string) => {
		if (event.key === 'Enter') {
			const elem = event.target as Element;
			elem.removeAttribute('contenteditable');
			let change = elem.innerHTML.trim().replaceAll('&nbsp;', '');
			if (change === tmp) return;
			switch (editType) {
				case 'protocol':
					port.protocol = change;
					break;
				case 'port_name':
					port.name = change;
					break;
				case 'location':
					port.location = change;
					break;
			}
			dispatcher('reloadgraph');
			if (!vscode) return;
			if (port.resource && editType === 'location')
				change += `${change.endsWith('/') ? '' : '/'}!/${port.resource}`;
			if (editType === 'location') change = `\"${change}\"`;
			if (!port.file) return;
			vscode.postMessage({
				command: 'renamePort',
				save: true,
				detail: {
					filename: port.file,
					newLine: change,
					editType,
					range: findRange(port, editType)
				}
			});
		}
	};

	const openInterfaceSidebar = (interfName: string): void => {
		openSpecificInterfaceSidebar(interfaces.find((t) => t.name === interfName));
	};

	const openSpecificInterfaceSidebar = (interf: Interface): void => {
		if (!interf) return;
		const sbElem = new SidebarElement(2, interf.name);
		sbElem.interf = interf;
		openSidebar(sbElem, $current_sidebar_element);
	};

	const openAggregateSidebar = (aggrName: string) => {
		const svc = getAllServices(services).find((t) => t.id === parentID);
		if (svc === undefined) return;

		const aggrPort = svc.outputPorts?.find((t) => t.name === aggrName);
		if (aggrName === undefined) return;

		const sbElem = new SidebarElement(1, aggrPort.name);
		sbElem.port = aggrPort;
		sbElem.portType = 'op';
		sbElem.port_parentID = parentID;
		openSidebar(sbElem, $current_sidebar_element);
	};

	const openRedirectPortSidebar = (redirPortName: string): void => {
		const parent = getAllServices(services).find((t) => t.id === parentID);
		const port = parent.outputPorts.find((t) => t.name === redirPortName);
		const sbPort = new SidebarElement(1, port.name);
		sbPort.port = port;
		sbPort.port_parentID = parentID;
		sbPort.portType = 'op';
		openSidebar(sbPort, $current_sidebar_element);
	};

	beforeUpdate(() => {
		isDockerPort = isDockerService(getAllServices(services).find((t) => t.id === parentID));
	});
</script>

<h1
	class="text-center text-4xl mt-1 mb-4 line-break"
	on:click|stopPropagation={saveInnerHTML}
	on:keydown|stopPropagation={(e) => finishEdit(e, 'port_name')}
>
	{port.name}
</h1>

{#if isDockerPort}
	<h4 class="text-2xl mb-2">Type: Docker External Port</h4>
	<h4 class="text-2xl mb-2">
		Location: <span
			on:click|stopPropagation={saveInnerHTML}
			on:keydown|stopPropagation={(e) => finishEdit(e, 'location')}>{port.location}</span
		>
	</h4>
{:else}
	<h4 class="text-2xl mb-2">Type: {portType === 'op' ? 'Output Port' : 'Input Port'}</h4>
	<h4 class="text-2xl mb-2">
		Protocol: <span
			on:click|stopPropagation={saveInnerHTML}
			on:keydown|stopPropagation={(e) => finishEdit(e, 'protocol')}
		>
			{port.protocol}</span
		>
	</h4>

	{#if port.resource}
		<h4 class="text-2xl mb-2">Resource: {port.resource}</h4>
	{/if}

	{#if !port.location.startsWith('!local')}
		<h4 class="text-2xl mb-2">
			Location: <span
				on:click|stopPropagation={saveInnerHTML}
				on:keydown|stopPropagation={(e) => finishEdit(e, 'location')}>{port.location}</span
			>
		</h4>
	{/if}

	{#if port.redirects}
		<hr />
		<h4 class="text-2xl mb-2">Redirects:</h4>
		<ul class="list-disc mx-6">
			{#each port.redirects as redir}
				<li class="text-xl my-2">
					{redir.name} &rArr;
					<span
						class="cursor-pointer"
						on:click={() => openRedirectPortSidebar(redir.port)}
						on:keydown={() => openRedirectPortSidebar(redir.port)}>{redir.port}</span
					>
				</li>
			{/each}
		</ul>
	{/if}

	{#if port.interfaces}
		<hr />
		<h4 class="text-2xl mb-2">Interfaces:</h4>
		<ul class="list-disc mx-6">
			{#each port.interfaces as interf}
				<li
					class="text-xl cursor-pointer my-2"
					on:click={() => openInterfaceSidebar(interf.name)}
					on:keydown={() => openInterfaceSidebar(interf.name)}
				>
					{interf.name}
				</li>
			{/each}
		</ul>
	{/if}

	{#if port.aggregates}
		<hr class="mt-4 " />
		<h4 class="text-2xl mb-2">Aggregates:</h4>
		<ul class="list-disc mx-6">
			{#each port.aggregates as aggr}
				{#if aggr.collection && aggr.collection.length > 0}
					<li class="text-xl">
						&lbrace;
						{#each aggr.collection as col}
							<span
								class="px-1 cursor-pointer"
								on:click={() => openAggregateSidebar(col.name)}
								on:keydown={() => openAggregateSidebar(col.name)}
								>{col.name}
								{#if col.name !== aggr.collection[aggr.collection.length - 1].name}
									,
								{/if}
							</span>
						{/each}
						&rbrace;
						{#if aggr.extender}
							<span
								class="cursor-pointer text-xl"
								on:click={() => openSpecificInterfaceSidebar(aggr.extender)}
								on:keydown={() => openSpecificInterfaceSidebar(aggr.extender)}
								>- {aggr.extender.name}</span
							>
						{/if}
					</li>
				{:else}
					<li
						class="text-xl cursor-pointer my-2"
						on:click={() => openAggregateSidebar(aggr.name)}
						on:keydown={() => openAggregateSidebar(aggr.name)}
					>
						{aggr.name}
						{#if aggr.extender}
							<span>- {aggr.extender.name}</span>
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
	{/if}
{/if}
