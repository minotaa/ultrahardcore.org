import { writable } from "svelte/store";
export const token = writable()
import { dev } from '$app/environment'
export let BACKEND_URI = "http://localhost:9000"

if (!dev) {
  BACKEND_URI = "https://api.ultrahardcore.org"
}

if (typeof localStorage !== 'undefined') {
  token.set(localStorage.token)
  token.subscribe((value) => localStorage.token = value)
}