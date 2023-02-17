import { writable } from "svelte/store";
export const token = writable()

if (typeof localStorage !== 'undefined') {
  token.set(localStorage.token)
  token.subscribe((value) => localStorage.token = value)
}