<script lang="ts">
  import "../app.css"
  import { Clock, ChevronDown, Server, ServerCrash, UserMinus, Wrench, StickyNote } from 'lucide-svelte'
  import moment from 'moment'
  import { readable, writable } from 'svelte/store'
  import { token, BACKEND_URI } from "../hooks/auth"
  import { onMount } from "svelte";
  import { toast } from "@zerodevx/svelte-toast"
    //import { BACKEND_URI } from "$env/static/private";

  let user: any
  onMount(async () => {
    const response = await fetch(`${BACKEND_URI}/account/get`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    const payload = await response.json()
    if (payload.success) {
      user = payload.user
    } else {
      token.set(undefined)
    }
  })

  token.subscribe(async (value) => {
    const response = await fetch(`${BACKEND_URI}/account/get`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    const payload = await response.json()
    if (payload.success) {
      user = payload.user
    } else {
      token.set(undefined)
    }
  })

  const time = readable("", set => {
    set(moment().format("HH:mm:ss"));
    const interval = setInterval(() => {
		  set(moment().format("HH:mm:ss"));
	  }, 500);
	  return () => clearInterval(interval);
  })

  function logOut(e: Event) {
    e.preventDefault()
    token.set(null)
    user = null
    toast.push("You've logged out!")
  }
</script>

<nav class="p-2 pr-4 flex flex-row flex-wrap justify-between gap-2">
  <div class="order-0 flex">
    <h1 class="text-xl font-bold"><img alt="Logo" src="/favicon.png" class="mb-2 inline" width="32" height="32"/>&nbsp; <a class="dark:text-white hover:underline" href="/">ultrahardcore.org</a></h1>
  </div>
  <div class="order-last flex gap-2">
    <code class="shadow mb-4 text-xl bg-slate-100 dark:bg-slate-800 dark:text-white rounded-lg pt-2 pl-4 pr-4 pb-1"><Clock class="mb-1 inline"/>&nbsp;{$time}</code>
    {#if user == null}
      <a href="/register"><button class="shadow dark:bg-slate-800 dark:hover:bg-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 pt-2 pl-4 pr-4 pb-2 rounded-lg">Register</button></a>
      <a href="/login"><button class="shadow dark:bg-slate-800 dark:hover:bg-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 pt-2 pl-4 pr-4 pb-2 rounded-lg">Login</button></a>
    {:else}
      {#if user.role == "admin"}
        <div class="dropdown inline-block relative">
          <button id="userDropdownButton" class="dark:bg-slate-800 dark:text-white font-bold inline-flex items-center block shadow mb-2 bg-slate-100 dark:hover:bg-slate-900 hover:bg-slate-200 pt-2 pl-4 pr-4 pb-2 rounded-lg"><Wrench class="inline"/>&nbsp;<ChevronDown class="inline"/></button>
          <div id="dropdownHover" class="w-40 absolute dropdown-menu z-50 hidden w-40 dark:bg-slate-700 dark:text-white bg-slate-200 divide-y divide-gray-100 rounded shadow">
            <ul aria-labelledby="userDropdownButton">
              <a href="/servers/approve"><li class="block text-sm px-4 py-2 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-800 hover:bg-slate-300"><ServerCrash class="inline"/>&nbsp; Approve servers</li></a>
            </ul>
          </div>
        </div>
      {/if}
      <div class="dropdown inline-block relative">
        <button id="userDropdownButton" class="dark:bg-slate-800 dark:text-white mr-4 font-bold inline-flex items-center block shadow mb-2 bg-slate-100 dark:hover:bg-slate-900 hover:bg-slate-200 pt-2 pl-4 pr-4 pb-2 rounded-lg">{user.username} <ChevronDown class="inline"/></button>
        <div id="dropdownHover" class="w-auto absolute dark:bg-slate-700 dropdown-menu z-50 hidden bg-slate-200 divide-y divide-gray-100 rounded shadow">
          <ul aria-labelledby="userDropdownButton">
            <a href="/servers"><li class="block text-sm px-4 py-2 dark:hover:bg-slate-800 dark:text-white dark:bg-slate-700 hover:bg-slate-300"><Server class="inline"/>&nbsp; Your servers</li></a>
            <a href="/host"><li class="block text-sm px-4 py-2 dark:hover:bg-slate-800 dark:text-white dark:bg-slate-700 hover:bg-slate-300"><StickyNote class="inline"/>&nbsp; Create a match</li></a>
            <li on:click={logOut} class="block text-sm px-4 py-2 dark:hover:bg-slate-800 dark:text-white hover:bg-slate-300"><UserMinus class="inline"/>&nbsp; Log out</li>
          </ul>
        </div>
      </div>
    {/if}
  </div>
</nav>
<hr class="border-0 dark:bg-zinc-800 bg-slate-100 mb-2 h-px"/>