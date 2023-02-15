export const patternAnnotations = ['aggregator', 'redirector'];

export const getServicePatternType = (svc: Service): string => {
	let res: string = '';
	if (!svc.inputPorts) return;
	svc.inputPorts.forEach((ip) => {
		if (!ip.annotation) return;
		res = patternAnnotations.find((t) => t === ip.annotation);
	});
	if (!svc.outputPorts) return;
	if (res === undefined)
		svc.outputPorts.forEach((ip) => {
			if (!ip.annotation) return;
			res = patternAnnotations.find((t) => t === ip.annotation);
		});
	return res;
};
