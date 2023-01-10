export const getClickedNetworkGroupId = (e: MouseEvent) => {
	const allNetworkNodes = document.querySelectorAll('svg > g > g');
	for (let i = 0; i < allNetworkNodes.length; i++)
		if (mouseIntersectWithRect(e, allNetworkNodes.item(i).getBoundingClientRect()))
			return allNetworkNodes.item(i).id.replace('network', '');
	return undefined;
};

const mouseIntersectWithRect = (e: MouseEvent, rect: DOMRect) => {
	const x = e.pageX;
	const y = e.pageY;
	return rect.x <= x && rect.y <= y && rect.width + rect.x >= x && rect.height + rect.y >= y;
};
