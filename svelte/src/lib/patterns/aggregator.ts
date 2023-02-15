import { PopUp, current_popup } from '../popup';
import { clearSidebar } from '../sidebar';

export const createAggregator = (svcs: Service[]) => {
	svcs.forEach((svc) => {});

	const pu = new PopUp(
		'Add location for each service',
		svcs.flatMap((t) => t.name + ' location').concat('Aggregator location'),
		(vals) => {
			return true;
		},
		async () => {}
	);
	clearSidebar();
	current_popup.set(pu);
};
