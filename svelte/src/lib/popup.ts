import { writable } from 'svelte/store';

export class PopUp {
	constructor(
		title: string,
		fields: string[],
		confirm = (vals: { field: string; val: string }[]): Promise<boolean> => {
			return new Promise<boolean>((res) => res(false));
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
	confirm = (vals: { field: string; val: string }[]): Promise<boolean> => {
		return new Promise<boolean>((res) => res(false));
	};
	cancel = (): Promise<void> => {
		return;
	};
}

const noPopup = new PopUp('', []);
export const current_popup = writable(noPopup);

export const openPopup = (title: string, fields: string[], confirm?, cancel?): void => {
	current_popup.set(new PopUp(title, fields, confirm, cancel));
};

export const closePopup = (): void => {
	current_popup.set(noPopup);
};
