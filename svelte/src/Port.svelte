<script lang="ts">
	import type { ElkPort } from 'elkjs/lib/elk.bundled';
	import { afterUpdate } from 'svelte';

	export let portNode: ElkPort;
	export let parentService: Service;

	let port =
		portNode.labels[0].text === 'ip'
			? parentService.inputPorts.find((t) => t.name == portNode.labels[1].text)
			: parentService.outputPorts.find((t) => t.name == portNode.labels[1].text);

	// //wrong---
	// const port =
	// 	portNode.labels[0].text === 'ip'
	// 		? parentService.inputPorts.find((i) => i.name === portNode.labels[1].text)
	// 		: parentService.outputPorts.find((i) => i.name === portNode.labels[1].text);

	const drawPort = async () => {
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

	afterUpdate(async () => {
		await drawPort();
		port =
			portNode.labels[0].text === 'ip'
				? parentService.inputPorts.find((t) => t.name == portNode.labels[1].text)
				: parentService.outputPorts.find((t) => t.name == portNode.labels[1].text);
	});

	const printInfo = () => {
		console.log(port);
	};
</script>

<g id={portNode.id}>
	{#if portNode.labels[0].text === 'ip'}
		<rect
			class="fill-inputPort stroke-ipStroke cursor-pointer"
			on:click={printInfo}
			on:keypress={printInfo}
		/>
	{:else}
		<rect
			class="fill-outputPort stroke-opStroke cursor-pointer"
			on:click={printInfo}
			on:keypress={printInfo}
		/>
	{/if}
</g>

<style>
	rect {
		stroke-width: 0.4;
	}
	rect:hover {
		stroke-width: 0.8;
	}
</style>
