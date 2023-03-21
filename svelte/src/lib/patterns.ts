const patternAnnotations = ['aggregator', 'redirector', 'circuit breaker'];

export const getServicePatternType = (svc: Service): string => {
	let res: string = '';
	if (!svc.inputPorts || svc.inputPorts.length == 0) return;
	svc.inputPorts.forEach((ip) => {
		if (!ip.annotation) return;
		res = patternAnnotations.find((t) => t === ip.annotation);
	});
	if (!svc.outputPorts || svc.outputPorts.length == 0) return;
	if (res === undefined)
		svc.outputPorts.forEach((ip) => {
			if (!ip.annotation) return;
			res = patternAnnotations.find((t) => t === ip.annotation);
		});
	return res;
};
