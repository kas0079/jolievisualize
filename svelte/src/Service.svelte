<script lang="ts">
	import type { ElkNode } from 'elkjs/lib/elk.bundled';
	import { afterUpdate, beforeUpdate, createEventDispatcher, tick } from 'svelte';
	import Edge from './Edge.svelte';
	import { loading, services, vscode } from './lib/data';
	import { portSize } from './lib/graph';
	import {
		addServiceToNetwork,
		getClickedNetworkGroupId,
		getNumberOfNetworks,
		getNumberOfServicesInNetwork,
		getServiceNetworkId,
		removeFromNetwork
	} from './lib/network';
	import {
		disembed,
		embed,
		getAllServices,
		getHoveredPolygon,
		getServiceFromCoords,
		isAncestor,
		renderGhostNodeOnDrag
	} from './lib/service';
	import {
		clearSidebar,
		current_sidebar_element,
		openSidebar,
		SidebarElement
	} from './lib/sidebar';
	import Port from './Port.svelte';

	export let serviceNode: ElkNode;
	export let parent: Service | undefined;

	let service: Service;

	let expanded = serviceNode.children[0].id !== '!leaf';
	let selected = false;
	let dragged = 0;
	let dragging = false;

	$: if ($current_sidebar_element.hist_type === 4) {
		if ($current_sidebar_element.serviceList.filter((t) => t.id === service.id).length > 0)
			selected = true;
	} else selected = false;

	const dispatcher = createEventDispatcher();
	const expandService = () => {
		if (service.embeddings === undefined || service.embeddings.length === 0) return;
		expanded = true;
		if ($current_sidebar_element.hist_type === 4) clearSidebar();
		dispatcher('message', {
			serviceID: service.id,
			serviceName: service.name,
			action: 'expandService'
		});
	};
	const shrinkService = () => {
		expanded = false;
		if ($current_sidebar_element.hist_type === 4) clearSidebar();
		dispatcher('message', {
			serviceID: service.id,
			serviceName: service.name,
			action: 'shrinkService'
		});
	};

	const openServiceInSidebar = (event: Event) => {
		if (event instanceof PointerEvent && event.shiftKey) return;
		if (dragged > 1) {
			dragged = 0;
			return;
		}
		const sbElem = new SidebarElement(0, service.name);
		sbElem.service = service;
		openSidebar(sbElem, $current_sidebar_element);
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

	let pressTimer: number;
	let startX: number, startY: number;

	const startDrag = (e: MouseEvent) => {
		if (e.button !== 0) return;
		if (e.shiftKey) {
			if (selected) {
				const tmp = new SidebarElement(4, 'Selection');
				tmp.serviceList = $current_sidebar_element.serviceList.filter((t) => t.id !== service.id);
				selected = false;
				openSidebar(
					tmp.serviceList.length == 0 ? new SidebarElement(-1, '') : tmp,
					$current_sidebar_element
				);
				return;
			}
			const sbElem =
				$current_sidebar_element.hist_type == 4
					? $current_sidebar_element
					: new SidebarElement(4, 'Selection');
			if (sbElem.serviceList === undefined) sbElem.serviceList = [];
			sbElem.serviceList.push(service);
			openSidebar(sbElem, $current_sidebar_element);
		}
		if (e.shiftKey || !service.file) return;
		dragged = 1;
		pressTimer = window.setTimeout(() => {
			const polygon = document.querySelector('#' + serviceNode.id).children[0];
			polygon.setAttribute('style', 'stroke-width: 0.4; fill: #f0c168;');
			dragging = true;
			dragged = 2;
			startX = e.pageX;
			startY = e.pageY;
			clearSidebar();
		}, 50);
	};

	const endDrag = async (e: MouseEvent) => {
		clearTimeout(pressTimer);
		if (e.button !== 0 || e.shiftKey || dragged < 2) return;
		const polygon = document.querySelector('#' + serviceNode.id).children[0];
		polygon.setAttribute('style', 'stroke-width: 0.4;');
		dragging = false;
		dragged = 0;
		const droppedOnSvc = getServiceFromCoords(e, services);
		const networkId = getClickedNetworkGroupId(e);
		const svcNwId = getServiceNetworkId(service);
		if (!droppedOnSvc) {
			//dropped on network
			if (networkId === undefined) {
				if (getNumberOfServicesInNetwork(svcNwId) === 1 && !service.parent) return;
				addServiceToNetwork(service, getNumberOfNetworks());
				if (service.parent) {
					if (vscode) loading.set(true);
					await tick();
					await disembed(service);
				}
			} else {
				if (!service.file || (networkId === svcNwId && !service.parent)) return;
				addServiceToNetwork(service, networkId);
				if (vscode && service.parent) loading.set(true);
				await tick();
				await disembed(service);
			}
			dispatcher('message', { action: 'reset' });
			return;
		}
		if (droppedOnSvc.id === service.id || isAncestor(service, droppedOnSvc) || !droppedOnSvc.file)
			return;
		await tick();
		removeFromNetwork(service, svcNwId);
		await embed(service, droppedOnSvc, svcNwId);
		if (vscode) loading.set(true);
		dispatcher('message', { action: 'reset' });
	};

	let prevPoly: Element;

	const dragListener = (e: MouseEvent) => {
		if (!dragging) return;
		renderGhostNodeOnDrag(serviceNode, e, startX, startY);
		const polyUnder = getHoveredPolygon(e);
		if (polyUnder === undefined || polyUnder.parentElement.getAttribute('id') === serviceNode.id) {
			if (prevPoly) prevPoly.setAttribute('style', 'stroke-width: 0.4');
			return;
		}
		if (prevPoly && prevPoly !== polyUnder) prevPoly.setAttribute('style', 'stroke-width: 0.4');
		polyUnder.setAttribute('style', 'stroke-width: 0.8');
		prevPoly = polyUnder;
	};

	// const test = (svc: Service[][]) => {
	// 	service = parent
	// 		? parent.embeddings.find((t) => t.name + '' + t.id === serviceNode.id)
	// 		: getAllServices(services).find((t) => t.name + '' + t.id === serviceNode.id);
	// };

	// $: test(services);

	beforeUpdate(() => {
		service = parent
			? parent.embeddings.find((t) => t.name + '' + t.id === serviceNode.id)
			: getAllServices(services).find((t) => t.name + '' + t.id === serviceNode.id);
	});

	afterUpdate(() => {
		drawService();
	});
</script>

<svelte:window on:mousemove|stopPropagation={dragListener} on:mouseup|stopPropagation={endDrag} />
<g id={serviceNode.id}>
	<polygon
		class=" stroke-serviceStroke cursor-pointer {selected
			? 'fill-serviceHighlight'
			: 'fill-service'}"
		style="stroke-width: 0.4"
		on:dblclick|stopPropagation={openServiceInSidebar}
		on:mousedown|stopPropagation={startDrag}
	/>
	{#if service.embeddings && service.embeddings.length > 0}
		<g>
			<rect
				x={(serviceNode.width ?? 0) - 7}
				y={(serviceNode.height ?? 0) - 7}
				width={5}
				height={5}
				class="fill-serviceStroke cursor-pointer"
				on:click|stopPropagation={expanded ? shrinkService : expandService}
				on:dblclick|stopPropagation={() => {}}
				on:keypress|stopPropagation={expanded ? shrinkService : expandService}
			/>
			{#if !expanded}
				<rect
					x={(serviceNode.width ?? 0) - 7 + (2.5 - 0.4)}
					y={(serviceNode.height ?? 0) - 7 + 0.5}
					width={0.8}
					height={4}
					rx={1}
					ry={0.5}
					class="fill-white cursor-pointer"
					on:click|stopPropagation={expanded ? shrinkService : expandService}
					on:dblclick|stopPropagation={() => {}}
					on:keypress|stopPropagation={expanded ? shrinkService : expandService}
				/>
			{/if}
			<rect
				x={(serviceNode.width ?? 0) - 7 + 0.5}
				y={(serviceNode.height ?? 0) - 7 + (2.5 - 0.4)}
				width={4.0}
				height={0.8}
				rx={0.5}
				ry={1}
				class="fill-white cursor-pointer"
				on:click|stopPropagation={expanded ? shrinkService : expandService}
				on:dblclick|stopPropagation={() => {}}
				on:keypress|stopPropagation={expanded ? shrinkService : expandService}
			/>
		</g>
	{/if}
	<text
		class="cursor-pointer select-none"
		on:dblclick|stopPropagation={openServiceInSidebar}
		on:mousedown|stopPropagation={startDrag}>{service.name}</text
	>
	{#if serviceNode.edges && serviceNode.edges.length > 0}
		{#each serviceNode.edges as edge}
			{#if edge.sections}
				<Edge {edge} white={false} />
			{/if}
		{/each}
	{/if}
	{#if serviceNode.ports && serviceNode.ports.length > 0}
		{#each serviceNode.ports as portNode}
			<Port {portNode} parentService={service} on:opensidebar />
		{/each}
	{/if}
	{#if expanded}
		{#each serviceNode.children as embed}
			<svelte:self
				serviceNode={embed}
				parent={service}
				on:message={handleChildEvent}
				on:opensidebar
			/>
		{/each}
	{/if}
</g>

{#if dragging}
	<svg id="tmp" class="absolute top-0 left-0 w-1 h-1 overflow-visible">
		<polygon />
		<text text-anchor="middle" />
	</svg>
{/if}
