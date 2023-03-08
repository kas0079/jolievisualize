<script lang="ts">
	import type { ElkNode } from 'elkjs/lib/elk.bundled';
	import { afterUpdate, beforeUpdate, createEventDispatcher, tick } from 'svelte';
	import Edge from './Edge.svelte';
	import { loading, services, vscode } from './lib/data';
	import { drawGhostNodeOnDrag, drawService } from './lib/draw';
	import {
		addServiceToNetwork,
		getClickedNetworkGroupId,
		getNumberOfNetworks,
		getNumberOfServicesInNetwork,
		getServiceNetworkId,
		removeFromNetwork
	} from './lib/network';
	import { getServicePatternType } from './lib/patterns';
	import { disembed, embed } from './lib/refactoring/embedding';
	import {
		getAllServices,
		getHoveredPolygon,
		getServiceFromCoords,
		isAncestor,
		isDockerService
	} from './lib/service';
	import {
		clearSidebar,
		current_sidebar_element,
		openServiceInSidebar,
		openSidebar,
		SidebarElement
	} from './lib/sidebar';
	import Port from './Port.svelte';

	export let serviceNode: ElkNode;
	export let parent: Service | undefined;

	let service: Service;
	let annotationType: string;
	let expanded: boolean;

	let selected = false;
	let dragged = 0;
	let dragging = false;

	$: if ($current_sidebar_element.hist_type === 4) {
		if ($current_sidebar_element.serviceList.filter((t) => t.id === service.id).length > 0)
			selected = true;
	} else selected = false;

	const dispatcher = createEventDispatcher();
	const expandService = (): void => {
		if (service.embeddings === undefined || service.embeddings.length === 0) return;
		expanded = true;
		if ($current_sidebar_element.hist_type === 4) clearSidebar();
		dispatcher('message', {
			serviceID: service.id,
			serviceName: service.name,
			action: 'expandService'
		});
	};
	const shrinkService = (): void => {
		expanded = false;
		if ($current_sidebar_element.hist_type === 4) clearSidebar();
		dispatcher('message', {
			serviceID: service.id,
			serviceName: service.name,
			action: 'shrinkService'
		});
	};

	const handleChildEvent = (event: CustomEvent): void => {
		dispatcher('message', {
			serviceID: event.detail.serviceID,
			serviceName: event.detail.serviceName,
			action: event.detail.action
		});
	};

	let pressTimer: number;
	let startX: number, startY: number;
	const startDrag = (e: MouseEvent) => {
		if (e.button !== 0) return;
		if (e.shiftKey) {
			if (isDockerService(service)) return;
			if (selected) {
				const tmp = new SidebarElement(4, 'Selection');
				tmp.serviceList = $current_sidebar_element.serviceList.filter((t) => t.id !== service.id);
				selected = false;
				openSidebar(tmp.serviceList.length == 0 ? new SidebarElement(-1, '') : tmp);
				return;
			}
			const sbElem =
				$current_sidebar_element.hist_type == 4
					? $current_sidebar_element
					: new SidebarElement(4, 'Selection');
			if (sbElem.serviceList === undefined) sbElem.serviceList = [];
			sbElem.serviceList.push(service);
			openSidebar(sbElem);
		}
		if (e.shiftKey || (!service.file && !isDockerService(service))) return;
		dragged = 1;
		pressTimer = window.setTimeout(
			() => {
				const polygon = document.querySelector('#' + serviceNode.id).children[0];
				polygon.setAttribute('style', 'stroke-width: 0.4;');
				dragging = true;
				dragged = 2;
				startX = e.pageX;
				startY = e.pageY;
				clearSidebar();
			},
			$current_sidebar_element.hist_type == -1 ? 50 : 300
		);
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
				if (
					(!service.file && !isDockerService(service)) ||
					(networkId === svcNwId && !service.parent)
				)
					return;
				addServiceToNetwork(service, networkId);
				if (!isDockerService(service)) {
					if (vscode && service.parent) loading.set(true);
					await tick();
					await disembed(service);
				}
			}
			dispatcher('message', { action: 'reset' });
			return;
		}
		if (
			droppedOnSvc.id === service.id ||
			isAncestor(service, droppedOnSvc) ||
			!droppedOnSvc.file ||
			isDockerService(service)
		)
			return;
		await tick();
		await embed(service, droppedOnSvc, svcNwId);
		dispatcher('message', { action: 'reset' });
		if (vscode) loading.set(true);
	};

	let prevPoly: Element;
	const dragListener = (e: MouseEvent) => {
		if (!dragging) return;
		drawGhostNodeOnDrag(serviceNode, e, startX, startY);
		const polyUnder = getHoveredPolygon(e);
		if (polyUnder === undefined || polyUnder.parentElement.getAttribute('id') === serviceNode.id) {
			if (prevPoly) prevPoly.setAttribute('style', 'stroke-width: 0.4');
			return;
		}
		if (prevPoly && prevPoly !== polyUnder) prevPoly.setAttribute('style', 'stroke-width: 0.4');
		polyUnder.setAttribute('style', 'stroke-width: 0.8');
		prevPoly = polyUnder;
	};

	beforeUpdate(() => {
		expanded = serviceNode.children[0].id !== '!leaf';
		service = parent
			? parent.embeddings.find((t) => t.name + '' + t.id === serviceNode.id)
			: getAllServices(services).find((t) => t.name + '' + t.id === serviceNode.id);
		annotationType = getServicePatternType(service);
	});

	afterUpdate(() => {
		drawService(serviceNode, service.name, expanded);
	});
</script>

<svelte:window on:mousemove|stopPropagation={dragListener} on:mouseup|stopPropagation={endDrag} />
<g id={serviceNode.id}>
	<polygon
		class="{isDockerService(service)
			? `stroke-sky-900`
			: annotationType
			? 'stroke-amber-700'
			: 'stroke-serviceStroke'}  cursor-pointer {selected
			? isDockerService(service)
				? `fill-sky-700`
				: annotationType
				? 'fill-amber-500'
				: 'fill-serviceHighlight'
			: isDockerService(service)
			? `fill-sky-800`
			: annotationType
			? 'fill-amber-600'
			: 'fill-service'}"
		style="stroke-width: 0.4"
		on:dblclick|stopPropagation={() => openServiceInSidebar(service, dragged)}
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
		class="cursor-pointer select-none {isDockerService(service) ? 'fill-zinc-100' : 'fill-black'}"
		on:dblclick|stopPropagation={() => openServiceInSidebar(service, dragged)}
		on:mousedown|stopPropagation={startDrag}
	/>
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
