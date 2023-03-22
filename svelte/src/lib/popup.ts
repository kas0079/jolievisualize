import { writable } from 'svelte/store';

/**
 * Class representing a popup screen.
 */
export class PopUp {
	constructor(
		title: string,
		fields: { field: string; name?: string }[],
		confirm = (vals: { field: string; val: string }[]): Promise<boolean> => {
			return new Promise<boolean>((res) => res(false));
		},
		cancel = (): Promise<void> => {
			return;
		}
	) {
		this.title = title;
		fields.forEach((f) =>
			this.values.push({ field: f.field, val: '', fieldName: f.name ?? f.field })
		);
		this.confirm = confirm;
		this.cancel = cancel;
	}
	title = '';
	values: { field: string; val: string; fieldName?: string }[] = [];
	confirm = (vals: { field: string; val: string }[]): Promise<boolean> => {
		return new Promise<boolean>((res) => res(false));
	};
	cancel = (): Promise<void> => {
		return;
	};
}

const noPopup = new PopUp('', []);
/**
 * Svelte store to keep global state of the current popup.
 */
export const current_popup = writable(noPopup);

/**
 * Opens a popup by setting the svelte store
 * @param title Title string of the popup
 * @param fields Fields of the popup
 * @param confirm Callback for when the user clicks confirm
 * @param cancel Callback for when the user clicks cancel
 */
export const openPopup = (
	title: string,
	fields: { field: string; name?: string }[],
	confirm?,
	cancel?
): void => {
	current_popup.set(new PopUp(title, fields, confirm, cancel));
};

/**
 * Closes the popup by setting the svelte store
 */
export const closePopup = (): void => {
	current_popup.set(noPopup);
};
