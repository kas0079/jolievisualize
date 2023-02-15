import { writable } from 'svelte/store';

export class PopUp {
	constructor(
		title: string,
		fields: string[],

		confirm = (vals: { field: string; val: string }[]): boolean => {
			return false;
		},
		cancel = (): Promise<void> => {
			return;
		}
	) {
		this.title = title;

		fields.forEach((f) => this.values.push({ field: f, val: '' }));
		this.confirm = confirm;
		this.cancel = cancel;
	}

	title = '';

	values: { field: string; val: string }[] = [];
	confirm = (vals: { field: string; val: string }[]): boolean => {
		return false;
	};
	cancel = (): Promise<void> => {
		return;
	};
}

export const noPopup = new PopUp('', []);
export const current_popup = writable(noPopup);

// TODO write functions similar to sidebar
