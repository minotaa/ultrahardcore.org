<script lang="ts">
  import "../app.css"
  import { Clock } from 'lucide-svelte'
  import moment from 'moment'
  import { readable, writable } from 'svelte/store'

  export const token = writable<string>()
  if (typeof localStorage !== 'undefined') {
    token.subscribe((key) => localStorage.token = key)
  }
  
  const time = readable("", set => {
    set(moment().format("HH:mm:ss"));
    const interval = setInterval(() => {
		  set(moment().format("HH:mm:ss"));
	  }, 1000);
	  return () => clearInterval(interval);
  })
</script>

<nav class="p-2 pr-4 flex flex-row flex-wrap justify-between gap-2">
  <div class="order-0 flex">
    <h1 class="text-xl font-bold"><img alt="Logo" src="/favicon.png" class="mb-2 inline" width="32" height="32"/>&nbsp; <a class="hover:underline" href="/">ultrahardcore.org</a></h1>
  </div>
  <div class="order-2">
    <code class="shadow text-xl bg-slate-100 rounded-lg pt-2 pl-2 pr-2 pb-2"><Clock class="inline"/>&nbsp;{$time}</code>
  </div>
  <div class="order-last flex gap-2">
    <a href="/register"><button class="shadow bg-slate-100 hover:bg-slate-200 pt-2 pl-4 pr-4 pb-2 rounded-lg">Register</button></a>
    <a href="/login"><button class="shadow bg-slate-100 hover:bg-slate-200 pt-2 pl-4 pr-4 pb-2 rounded-lg">Login</button></a>
  </div>
</nav>