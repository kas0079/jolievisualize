<script lang="ts">
	import type { ElkPort } from 'elkjs/lib/elk.bundled';
	import { afterUpdate } from 'svelte';
	import { drawPort } from './lib/draw';
	import { isDockerService } from './lib/service';
	import { openPortSidebar } from './lib/sidebar';

	export let portNode: ElkPort;
	export let parentService: Service;

	let port =
		portNode.labels[0].text === 'ip'
			? parentService.inputPorts.find((t) => t.name == portNode.labels[1].text)
			: parentService.outputPorts.find((t) => t.name == portNode.labels[1].text);

	let isDockerPort = isDockerService(parentService);

	afterUpdate(() => {
		drawPort(portNode);
		port =
			portNode.labels[0].text === 'ip'
				? parentService.inputPorts.find((t) => t.name == portNode.labels[1].text)
				: parentService.outputPorts.find((t) => t.name == portNode.labels[1].text);
		if (parentService && port) port.file = parentService.file;
	});
</script>

<g id={portNode.id}>
	<rect
		class={portNode.labels[0].text === 'ip'
			? isDockerPort
				? 'fill-teal-800 stroke-teal-900 cursor-pointer'
				: 'fill-inputPort stroke-ipStroke cursor-pointer'
			: 'fill-outputPort stroke-opStroke cursor-pointer'}
		on:click|stopPropagation={() => openPortSidebar(port, portNode, parentService.id)}
		on:keydown|stopPropagation={() => openPortSidebar(port, portNode, parentService.id)}
		on:dblclick|stopPropagation={() => {}}
	/>
</g>

<style>
	rect {
		stroke-width: 0.4;
	}
	rect:hover {
		stroke-width: 0.8;
	}
</style>
