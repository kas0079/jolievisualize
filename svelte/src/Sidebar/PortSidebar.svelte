<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { interfaces, services, vscode } from '../lib/data';
	import { getAllServices } from '../lib/service';
	import { SidebarElement } from '../lib/sidebar';

	export let port: Port;
	export let portType: string;
	export let parentID: number;

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
			const change = elem.innerHTML.trim().replaceAll('&nbsp;', '');
			if (change === tmp) return;
			const oldPort: Port = {
				name: port.name,
				location: port.location,
				protocol: port.protocol,
				aggregates: port.aggregates,
				interfaces: port.interfaces,
				couriers: port.couriers,
				redirects: port.redirects,
				resource: port.resource,
				file: port.file
			};
			switch (editType) {
				case 'port_name':
					port.name = change;
					break;
				case 'protocol':
					port.protocol = change;
					break;
				case 'location':
					port.location = change;
					break;
			}
			dispatcher('editPort', {
				oldPort,
				newPort: port,
				portType,
				editType
			});
		}
	};

	const openInterface = (interfName: string) => {
		const interf = interfaces.find((t) => t.name === interfName);
		const sbElem = new SidebarElement(2, interfName);
		sbElem.interf = interf;
		dispatcher('opensidebar', {
			elem: sbElem,
			action: 'sidebar_open'
		});
	};

	const openAggregate = (aggrName: string) => {
		const svc = getAllServices(services).find((t) => t.id === parentID);
		if (svc === undefined) return;

		const aggrPort = svc.outputPorts?.find((t) => t.name === aggrName);
		if (aggrName === undefined) return;

		const sbElem = new SidebarElement(1, aggrName);
		sbElem.port = aggrPort;
		sbElem.port_parentID = parentID;
		dispatcher('opensidebar', {
			elem: sbElem,
			action: 'sidebar_open'
		});
	};
</script>

<h1
	class="text-center text-4xl mt-1 mb-4"
	on:click|stopPropagation={saveInnerHTML}
	on:keydown|stopPropagation={(e) => finishEdit(e, 'port_name')}
>
	{port.name}
</h1>
<h4 class="text-2xl mb-2">Type: {portType === 'op' ? 'Output Port' : 'Input Port'}</h4>
<h4 class="text-2xl mb-2">
	Protocol: <span
		on:click|stopPropagation={saveInnerHTML}
		on:keydown|stopPropagation={(e) => finishEdit(e, 'protocol')}
	>
		{port.protocol}</span
	>
</h4>
{#if !port.location.startsWith('!local')}
	<h4 class="text-2xl mb-2">
		Location: <span
			on:click|stopPropagation={saveInnerHTML}
			on:keydown|stopPropagation={(e) => finishEdit(e, 'location')}>{port.location}</span
		>
	</h4>
{/if}

<h4 class="text-2xl mb-2">Interfaces:</h4>
<ul class="list-disc mx-6">
	{#each port.interfaces as interf}
		<li
			class="text-xl cursor-pointer my-2"
			on:click={() => openInterface(interf.name)}
			on:keydown={() => openInterface(interf.name)}
		>
			{interf.name}
		</li>
	{/each}
</ul>

{#if port.aggregates}
	<h4 class="text-2xl mt-4 mb-2">Aggregates:</h4>
	<ul class="list-disc mx-6">
		{#each port.aggregates as aggr}
			<li
				class="text-xl cursor-pointer my-2"
				on:click={() => openAggregate(aggr.name)}
				on:keydown={() => openAggregate(aggr.name)}
			>
				{aggr.name}
			</li>
		{/each}
	</ul>
{/if}
