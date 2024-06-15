<script lang="ts">
  import "../../../app.css";
  import Navbar from "../../../components/Navbar.svelte";
  import Footer from "../../../components/Footer.svelte";
  import { HardDrive } from "lucide-svelte";

  import { token } from "../../../hooks/auth"
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
    import { BACKEND_URI } from "$env/static/private";

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
    if (!user) {
      goto('/')
    }
  })

  let serverName: string
  let serverIp: string
  let serverLocation: string
  let success: boolean
  let error: string[]
  let serverRegion: string
  
  async function handleSubmit(e: Event) {
    e.preventDefault()
    
    const res = await fetch(`${BACKEND_URI}/server/create`, {
      method: 'POST', // @ts-ignore
      headers: {
        'Content-Type': 'application/json',
        'Authorization': $token
      },
      body: JSON.stringify({
        name: serverName,
        ip: serverIp,
        location: serverLocation,
        region: serverRegion
      })
    })
    const payload = await res.json()
    if (!payload.success) {
      error = payload.errors 
    }
    if (payload.success) {
      success = true
    }
  }

</script>

<div class="container pl-8">
  <h1 class="pt-6 font-bold text-2xl dark:text-white">Create Server</h1>
  {#if !success}
    {#if error != null}
      <h2 class="mt-2 text-center dark:bg-red-500 text-md bg-red-100 shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4"><strong>Errors:</strong> {error.join(', ')}</h2>
    {/if}
    <form on:submit={handleSubmit}>
      <div class="flex flex-col gap-2 justify-center">
        <label for="serverName" class="font-bold mt-6 dark:text-white">Server Name:</label>
        <input required bind:value={serverName} placeholder="for example: applejuice" class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="serverName" id="serverName"/>
        <label for="serverIp" class="font-bold mt-4 dark:text-white">IP Address:</label>
        <input bind:value={serverIp} placeholder="this must be your Hub IP, not a direct IP" class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="serverIp" id="serverIp"/>
        <label for="serverLocation" class="font-bold mt-4 dark:text-white">Server Region:</label>
        <select bind:value={serverRegion} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-96 pl-2">
          <option value="na" class="dark:text-white">North America</option>
          <option value="eu" class="dark:text-white">Europe</option>
          <option value="au" class="dark:text-white">Oceania</option>
          <option value="as" class="dark:text-white">Asia</option>
          <option value="sa" class="dark:text-white">South America</option>
          <option value="af" class="dark:text-white">Africa</option>
        </select>
        <label for="serverLocation" class="font-bold mt-4 dark:text-white">Server Location:</label>
        <input required bind:value={serverLocation} placeholder="for example: Montreal, Canada" class="dark:text-white dark:bg-slate-700 shadow bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="serverLocation" id="serverLocation"/>
        <button type="submit" class="bg-green-400 text-white pt-2 pb-2 mt-6 rounded-lg dark:bg-green-600 font-bold w-96"><HardDrive class="inline mb-1"/> Create Server</button>

      </div>
    </form>
  {:else}
    <h2 class="text-center dark:text-white dark:bg-zinc-800 text-md shadow rounded-lg mt-4 pt-4 pb-4 w-80 pr-8 pl-8 mb-4">Successfully created the server, please wait a Staff member to verify your server.<br/><br/><a href="/servers" class="text-sky-500 hover:underline">Go back to servers page.</a></h2>
  {/if}
  <div class="mb-6">
    <Footer/>
  </div>
</div>