import { writable } from 'svelte/store';

const noError: Error = { error: false };
export const error = writable(noError);

export const removeError = (): void => {
	error.set(noError);
};

type Error = {
	error: boolean;
	file?: { path: string };
};
