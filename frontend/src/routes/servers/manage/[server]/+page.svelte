<script lang="ts">
  import { page } from '$app/stores'
  import { onMount } from 'svelte';
  import { token } from "../../../../hooks/auth";
  import moment from "moment";
  import { toast } from '@zerodevx/svelte-toast'
  import { goto } from '$app/navigation';
    import { PlusCircle, X } from 'lucide-svelte';
    import Footer from '../../../../components/Footer.svelte';

  interface Server {
    name: string,
    ip: string,
    address: string,
    location: string, 
    region: string,
    members: object[],
    createdAt: Date,
    owner: string,
    id: string,
    invited: string[],
    verified: boolean,
    extraServers: object[],
    discordUrl: string,
    twitterUrl: string,
    scenarioDescriptions: string,
    websiteUrl: string,
    extraLinks: object[]
  }

  let server: Server
  let user: any
  let loadedYet = false
  onMount(async () => {
    let response = await fetch(`http://localhost:9000/account/get`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    let payload = await response.json()
    if (payload.success) {
      user = payload.user
    } else {
      token.set(undefined)
      
    }
    if (!user) {
      goto('/')
      toast.push("You're not logged in!")
    }
    response = await fetch(`http://localhost:9000/server/get?server=${await $page.params.server}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    payload = await response.json()
    if (payload.success) {
      server = payload.server
    } else {
      goto('/servers')
      toast.push("Invalid server ID!")
    }
    loadedYet = true
  })

  function createCustom() {
    server.extraLinks.push({ name: '', url: '' })
    server.extraLinks = server.extraLinks
  }

  function removeExtraLink(index: number) {
    server.extraLinks.splice(index, 1)
    server.extraLinks = server.extraLinks
  }

  function createExtra() {
    server.extraServers.push({ name: '', ip: '' })
    server.extraServers = server.extraServers
  }

  function removeExtraServer(index: number) {
    server.extraServers.splice(index, 1)
    server.extraServers = server.extraServers
  }
</script>

<div class="container pl-8">
  {#if loadedYet}
    <h1 class="pt-6 font-bold text-3xl dark:text-white">Manage {server.name}</h1>
    <div class="flex flex-col gap-2 justify-center">
      <h2 class="pt-4 mt-6 font-bold text-2xl dark:text-white">Server Details</h2>
      <h3 class="mb-2 text-lg dark:text-white">Change general details about your server.</h3>
      <label for="serverName" class="font-bold mt-2 dark:text-white">Change Name:</label>
      <input required bind:value={server.name} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="serverName" id="serverName"/>
      <label for="serverLocation" class="font-bold mt-2 dark:text-white">Change Location:</label>
      <input required bind:value={server.location} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="serverLocation" id="serverLocation"/>
      <label for="serverRegion" class="font-bold mt-2 dark:text-white">Change Region:</label>
      <select bind:value={server.region} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-96 pl-2">
        <option value="na" class="dark:text-white">North America</option>
        <option value="eu" class="dark:text-white">Europe</option>
        <option value="au" class="dark:text-white">Oceania</option>
        <option value="as" class="dark:text-white">Asia</option>
        <option value="sa" class="dark:text-white">South America</option>
        <option value="af" class="dark:text-white">Africa</option>
      </select>
      <label for="serverIp" class="font-bold mt-2 dark:text-white">IP Address:</label>
      <input bind:value={server.ip} class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="serverIp" id="serverIp"/>
      <h2 class="pt-4 mt-4 font-bold text-2xl dark:text-white">Links</h2>
      <h3 class="text-lg dark:text-white">Set certain links to promote your Discord server, Twitter, Store, etc.</h3>
      <label for="discordServer" class="font-bold mt-2 dark:text-white">Discord Invite:</label>
      <input required bind:value={server.discordUrl} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="url" name="discordServer" id="discordServer"/>
      <label for="twitterUrl" class="font-bold mt-2 dark:text-white">Twitter Profile:</label>
      <input required bind:value={server.twitterUrl} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="url" name="twitterLink" id="twitterLink"/>
      <label for="scenarioExplanationsWebsite" class="font-bold mt-2 dark:text-white">Scenario Explanations Website:</label>
      <input required bind:value={server.scenarioDescriptions} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="url" name="scenarioExplanationsLink" id="scenarioExplanationsLink"/>
      <label for="websiteUrl" class="font-bold mt-2 dark:text-white">Website:</label>
      <input required bind:value={server.websiteUrl} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="url" name="websiteUrl" id="websiteUrl"/>
      <h3 class="font-bold mt-2 dark:text-white">Custom Links:</h3>
      {#if server.extraLinks.length == 0}
        <h2 class="text-md dark:text-white text-gray-500 dark:text-gray-100">You have no custom links.&nbsp; <button on:click={createCustom} class="inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button></h2>
      {:else}
        <ul>
          {#each server.extraLinks as extra, index} 
            <li>
              <div class="pt-1 pr-2 pb-1 flex flex-row gap-4 w-auto hideable rounded-lg">
                <input bind:value={server.extraLinks[index].name} class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 w-40" placeholder="name" type="text" name="extraName" id="extraName" required/> <input required bind:value={server.extraLinks[index].url} class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 w-60" placeholder="url" type="url" name="extraIp" id="extraIp"/> 
                <button on:click={() => { removeExtraLink(index) }} class="hidden hoverHidden inline text-gray-100"><X class="inline"/></button>
              </div>
            </li>
          {/each}
        </ul>
        <button on:click={createCustom} class="w-20 inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button>
      {/if}
      
      <h2 class="pt-4 mt-4 font-bold text-2xl dark:text-white">Extra Servers</h2>
      <h3 class="text-lg dark:text-white">Add/remove extra server IPs to allow hosts to host on separate servers.</h3>
      {#if server.extraServers.length == 0}
        <h2 class="text-lg dark:text-white mt-2 text-gray-500 dark:text-gray-100">You have no extra servers.&nbsp; <button on:click={createExtra} class="inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button></h2>
      {:else}
        <ul>
          {#each server.extraServers as extra, index} 
            <li>
              <div class="pt-1 pr-2 pb-1 flex flex-row gap-4 w-auto hideable rounded-lg">
                <input bind:value={server.extraServers[index].name} class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 w-[128px]" placeholder="name" type="text" name="extraName" id="extraName" required/> <input required bind:value={server.extraServers[index].ip} class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 w-60" placeholder="ip address" type="text" name="extraIp" id="extraIp"/> 
                <button on:click={() => { removeExtraServer(index) }} class="hidden hoverHidden inline text-gray-100"><X class="inline"/></button>
              </div>
            </li>
          {/each}
        </ul>
        <button on:click={createExtra} class="w-20 inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button>
      {/if}
    </div>

  {:else}
    <h1 class="pt-6 font-bold text-2xl dark:text-white">Fetching server details...</h1>
  {/if}
  <Footer/>
</div>