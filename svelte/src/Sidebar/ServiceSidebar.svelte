<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { services, vscode } from '../lib/data';
	import { current_popup, PopUp } from '../lib/popup';
	import { findRange, getAllServices } from '../lib/service';
	import { current_sidebar_element, noSidebar, SidebarElement } from '../lib/sidebar';

	export let service: Service;

	let tmp = '';
	const saveInnerHTML = (event: MouseEvent) => {
		if (service.file === undefined && vscode === undefined) return;
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
			const oldname = service.name;
			service.name = change;
			dispatcher('editService', {
				filename: service.file,
				oldServiceName: oldname,
				newServiceName: change,
				range: findRange(service, 'svc_name')
			});
		}
	};

	const openPortSidebar = (event: Event, portType: string) => {
		const elem = event.target as Element;
		const portName = elem.textContent.split(' - ')[0];
		let port: Port;
		if (portType === 'op') port = service.outputPorts.find((t) => t.name === portName);
		else port = service.inputPorts.find((t) => t.name === portName);
		if (port === undefined) return;
		const sbPort = new SidebarElement(1, portName);
		sbPort.port = port;
		sbPort.portType = portType;
		sbPort.port_parentID = service.id;
		dispatcher('opensidebar', {
			elem: sbPort,
			action: 'sidebar_open'
		});
	};

	const openServiceSidebar = (id: number) => {
		const svc = getAllServices(services).find((t) => t.id === id);
		if (svc === undefined) return;
		const sbPort = new SidebarElement(0, svc.name);
		sbPort.service = svc;
		dispatcher('opensidebar', {
			elem: sbPort,
			action: 'sidebar_open'
		});
	};

	const addPort = (type: string) => {
		current_popup.set(
			new PopUp(
				`Create new ${type.toLowerCase()} port`,
				['name', 'protocol', 'location', 'interfaces'],
				300,
				(vals) => {
					// TODO validate inputs
					const tmp_interfaces = [];
					vals
						.find((t) => t.field === 'interfaces')
						?.val.split(',')
						.forEach((str) => tmp_interfaces.push({ name: str.trim() }));

					const newPort: Port = {
						name: vals.find((t) => t.field === 'name')?.val,
						protocol: vals.find((t) => t.field === 'protocol')?.val,
						location: vals.find((t) => t.field === 'location')?.val,
						interfaces: tmp_interfaces,
						file: service.file
					};

					let isFirst = true;
					let range: CodeRange;
					if (type === 'Input') {
						if (!service.inputPorts) service.inputPorts = [];
						isFirst = service.inputPorts.length === 0;
						range = isFirst
							? service.ranges.find((t) => t.name === 'svc_name')
							: service.inputPorts[0].ranges.find((t) => t.name === 'port');
						service.inputPorts.push(newPort);
					} else {
						if (!service.outputPorts) service.outputPorts = [];
						isFirst = service.outputPorts.length === 0;
						range = isFirst
							? service.ranges.find((t) => t.name === 'svc_name')
							: service.outputPorts[0].ranges.find((t) => t.name === 'port');
						service.outputPorts.push(newPort);
					}

					dispatcher('reloadgraph');
					current_sidebar_element.set(noSidebar);

					if (!vscode) return;
					vscode.postMessage({
						command: `newPort`,
						detail: {
							file: service.file,
							portType: type === 'Input' ? 'inputPort' : 'outputPort',
							isFirst,
							range: range.range,
							port: {
								name: vals.find((t) => t.field === 'name')?.val,
								protocol: vals.find((t) => t.field === 'protocol')?.val,
								location: vals.find((t) => t.field === 'location')?.val,
								interfaces: vals.find((t) => t.field === 'interfaces')?.val
							}
						}
					});
				}
			)
		);
	};
</script>

<h1
	class="text-center text-4xl mt-1 mb-4"
	on:click|stopPropagation={saveInnerHTML}
	on:keydown|stopPropagation={(e) => finishEdit(e)}
>
	{service.name}
</h1>
<h4 class="text-2xl mb-2">Type: Service</h4>
<h4 class="text-2xl mb-2">Execution: {service.execution}</h4>
<hr />
<h4 class="text-2xl mt-1 mb-2">
	Input Ports:
	{#if service.file}
		<span
			class="float-right cursor-pointer text-3xl"
			on:click={() => addPort('Input')}
			on:keydown={() => addPort('Input')}>+</span
		>
	{/if}
</h4>
{#if service.inputPorts && service.inputPorts.length > 0}
	<ul class="mb-4 list-disc mx-6">
		{#each service.inputPorts as ip}
			<li
				class="text-xl cursor-pointer my-2"
				on:click={(e) => openPortSidebar(e, 'ip')}
				on:keydown={(e) => openPortSidebar(e, 'ip')}
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
			on:click={() => addPort('Output')}
			on:keydown={() => addPort('Output')}>+</span
		>
	{/if}
</h4>
{#if service.outputPorts && service.outputPorts.length > 0}
	<ul class="mb-4 list-disc mx-6">
		{#each service.outputPorts as op}
			<li
				class="text-xl cursor-pointer my-2"
				on:click={(e) => openPortSidebar(e, 'op')}
				on:keydown={(e) => openPortSidebar(e, 'op')}
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
				on:click={() => openServiceSidebar(embed.id)}
				on:keydown={() => openServiceSidebar(embed.id)}
			>
				{embed.name}
			</li>
		{/each}
	</ul>
{/if}
