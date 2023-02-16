import { openPopup } from '../popup';
import { clearSidebar } from '../sidebar';

export const createAggregator = (svcs: Service[]): void => {
	svcs.forEach((svc) => {});
	openPopup(
		'Add location for each service',
		svcs.flatMap((t) => t.name + ' location').concat('Aggregator location'),
		(vals: { field: string; val: string }[]) => {
			return true;
		},
		async () => {}
	);
	clearSidebar();
};
