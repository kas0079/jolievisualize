import { writable } from 'svelte/store';

export class PopUp {
	constructor(
		title: string,
		fields: string[],
		sbWidth: number,
		confirm = (vals: { field: string; val: string }[]) => {},
		cancel = () => {}
	) {
		this.title = title;
		this.sbWidth = sbWidth;
		fields.forEach((f) => this.values.push({ field: f, val: '' }));
		this.confirm = confirm;
		this.cancel = cancel;
	}

	title = '';
	sbWidth = 0;
	values: { field: string; val: string }[] = [];
	confirm = (vals: { field: string; val: string }[]) => {};
	cancel = () => {};
}

export const noPopup = new PopUp('', [], 0);
export const current_popup = writable(noPopup);
