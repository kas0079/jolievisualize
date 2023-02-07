<script lang="ts">
	import type { ElkPort } from 'elkjs/lib/elk.bundled';
	import { afterUpdate } from 'svelte';
	import { current_sidebar_element, openSidebar, SidebarElement } from './lib/sidebar';

	export let portNode: ElkPort;
	export let parentService: Service;

	let port =
		portNode.labels[0].text === 'ip'
			? parentService.inputPorts.find((t) => t.name == portNode.labels[1].text)
			: parentService.outputPorts.find((t) => t.name == portNode.labels[1].text);

	const drawPort = () => {
		d3.select(`#${portNode.id}`).attr(
			'transform',
			`translate(${portNode.x ?? 0}, ${portNode.y ?? 0})`
		);
		d3.select(`#${portNode.id} > rect`)
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', portNode.width ?? 0)
			.attr('height', portNode.height ?? 0);
	};

	const openPortInSidebar = () => {
		const sbPort = new SidebarElement(1, port.name);
		sbPort.port = port;
		sbPort.port_parentID = parentService.id;
		sbPort.portType = portNode.labels[0].text;
		openSidebar(sbPort, $current_sidebar_element);
	};

	afterUpdate(() => {
		drawPort();
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
			? 'fill-inputPort stroke-ipStroke cursor-pointer'
			: 'fill-outputPort stroke-opStroke cursor-pointer'}
		on:click|stopPropagation={openPortInSidebar}
		on:keydown|stopPropagation={openPortInSidebar}
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
