import { writable } from 'svelte/store';
import { placegraph } from './data/data';

export const pgRoot = writable(placegraph[0]);
