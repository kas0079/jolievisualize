<script lang="ts">
	import Edge from './Edge.svelte';
	import type { ElkNode } from 'elkjs/lib/elk.bundled';
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { services } from './lib/data';
	import { portSize } from './lib/graph';
	import Port from './Port.svelte';

	export let serviceNode: ElkNode;
	export let parent: Service | undefined;
	const service = parent
		? parent.embeddings.find((t) => t.name + '' + t.id === serviceNode.id)
		: services.flat().find((t) => t.name + '' + t.id === serviceNode.id);

	let expanded = serviceNode.children[0].id !== '!leaf';

	const dispatcher = createEventDispatcher();
	const expandService = () => {
		if (service.embeddings === undefined || service.embeddings.length === 0) return;
		expanded = true;
		dispatcher('message', {
			serviceID: service.id,
			serviceName: service.name,
			action: 'expandService'
		});
	};
	const shrinkService = () => {
		expanded = false;
		dispatcher('message', {
			serviceID: service.id,
			serviceName: service.name,
			action: 'shrinkService'
		});
	};

	const handleChildEvent = (event: CustomEvent) => {
		dispatcher('message', {
			serviceID: event.detail.serviceID,
			serviceName: event.detail.serviceName,
			action: event.detail.action
		});
	};

	const drawService = () => {
		serviceNode.x = serviceNode.x ?? 0;
		serviceNode.y = serviceNode.y ?? 0;
		serviceNode.width = serviceNode.width ?? 0;
		serviceNode.height = serviceNode.height ?? 0;

		const w = serviceNode.width / 2;
		const h = serviceNode.height;
		const sideOffset = Math.min(w / 4, portSize - 1);

		d3.select(`#${serviceNode.id}`).attr(
			'transform',
			`translate(${serviceNode.x}, ${serviceNode.y})`
		);
		d3.select(`#${serviceNode.id} > polygon`)
			.attr(
				'points',
				`${-sideOffset},${h / 2} ${0},${h} ${w * 2},${h} ${w * 2 + sideOffset},${h / 2} ${
					w * 2
				},${0} ${0},${0}`
			)
			.on('mouseover', () => {
				d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.8');
			})
			.on('mouseleave', () => {
				d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.4');
			});

		d3.select(`#${serviceNode.id} > text`)
			.attr('x', w)
			.attr('text-anchor', 'middle')
			.attr('y', expanded ? 5 : h / 2 + 1)
			.style('font', '4px sans-serif')
			.on('mouseover', () => {
				d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.8');
			})
			.on('mouseleave', () => {
				d3.select(`#${serviceNode.id} > polygon`).attr('style', 'stroke-width: 0.4');
			});
	};

	afterUpdate(() => {
		drawService();
	});
</script>

<g id={serviceNode.id}>
	<polygon
		class="fill-service stroke-serviceStroke cursor-pointer"
		style="stroke-width: 0.4"
		on:click|stopPropagation={expanded ? shrinkService : expandService}
		on:keypress|stopPropagation={expanded ? shrinkService : expandService}
	/>
	<text class="servicename cursor-pointer">{service.name}</text>
	{#if serviceNode.ports && serviceNode.ports.length > 0}
		{#each serviceNode.ports as portNode}
			<Port {portNode} parentService={service} on:opensidebar />
		{/each}
	{/if}
	{#if expanded}
		{#each serviceNode.children as embed}
			<svelte:self serviceNode={embed} parent={service} on:message={handleChildEvent} />
		{/each}
		{#if serviceNode.edges && serviceNode.edges.length > 0}
			{#each serviceNode.edges as edge}
				{#if edge.sections}
					<Edge {edge} />
				{/if}
			{/each}
		{/if}
	{/if}
</g>
