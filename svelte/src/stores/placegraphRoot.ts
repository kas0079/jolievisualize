import { writable } from 'svelte/store';
import { placegraph } from '../lib/data/data';

export const pgRoot = writable(placegraph[0]);
