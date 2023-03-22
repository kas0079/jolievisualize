import { writable } from 'svelte/store';

const noError: ParsingError = { error: false };
/**
 * Svelte store to keep global state of the error.
 */
export const error = writable(noError);

/**
 * Sets the svelte store to the no error state
 */
export const removeError = (): void => {
	error.set(noError);
};
