<script lang="ts">
  import { page } from '$app/stores'
  import { onMount } from 'svelte';
  import { token } from "../../../../hooks/auth";
  import moment from "moment";
  import { toast } from '@zerodevx/svelte-toast'
  import { goto } from '$app/navigation';
  import { PlusCircle, Save, X } from 'lucide-svelte';
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
    storeUrl: string,
    twitterUrl: string,
    scenarioDescriptions: string,
    websiteUrl: string,
    extraLinks: object[],
    customizableRules: object[],
    configOptions: object[]
  }

  let server: Server
  let user: any
  let loadedYet = false

  async function save() {
    let response = await fetch(`http://localhost:9000/server/edit?server=${server.id}`, {
      method: 'POST', // @ts-ignore
      headers: {
        'Authorization': $token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        server: server
      })
    })
    let payload = await response.json()
    if (payload.success) {
      toast.push('Successfully edited server!')
    } else {
      toast.push('An error occurred, could not edit server!')
    }
  }

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
    response = await fetch(`http://localhost:9000/server/getMember?user=${user.mId}&server=${server.id}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    payload = await response.json()
    if (payload.success) {
      if (payload.member.role !== 'admin' && payload.member.role !== 'owner') {
        goto('/servers')
      }
    } else {
      goto('/servers')
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

  function createRule() {
    server.customizableRules.push({ name: '', allowHostsToType: false })
    server.customizableRules = server.customizableRules
  }

  function removeCustomRule(index: number) {
    server.customizableRules.splice(index, 1)
    server.customizableRules = server.customizableRules
  }

  function createOption() {
    server.configOptions.push({ name: '', type: '' })
    server.configOptions = server.configOptions
  }

  function removeOption(index: number) {
    server.configOptions.splice(index, 1)
    server.configOptions = server.configOptions
  }

  let invitee: string
</script>

<div class="container pl-8">
  {#if loadedYet}
    <h3 class="mt-4 text-sky-400 font-bold"><a href="/servers">← Go back to servers list</a></h3>
    <h1 class="mt-4 mb-2 font-bold text-3xl dark:text-white">Manage {server.name}</h1>
    <button on:click={save} class="w-1/5 mt-2 inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><Save class="mb-1 inline"/> Submit Changes</button>
    <div class="flex flex-col gap-2 mt-4 justify-center">
      <h2 class="pt-4 font-bold text-2xl dark:text-white">Server Details</h2>
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
      <input required bind:value={server.storeUrl} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="url" name="storeLink" id="storeLink"/>
      <label for="storeLink" class="font-bold mt-2 dark:text-white">Store:</label>
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
      <h2 class="pt-4 mt-4 font-bold text-2xl dark:text-white">Game Rules</h2>
      <h3 class="text-lg w-3/5 dark:text-white">Add/remove game rules for hosts to customize while posting (e.g. add Crossteaming to allow hosts to customize Crossteaming rules).</h3>
      {#if server.customizableRules.length == 0}
        <h2 class="text-lg dark:text-white mt-2 text-gray-500 dark:text-gray-100">You have no custom rules.&nbsp; <button on:click={createRule} class="inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button></h2>
      {:else}
        <ul>
          {#each server.customizableRules as extra, index} 
            <li>
              <div class="pt-1 pr-2 pb-1 flex flex-row gap-4 w-auto hideable rounded-lg">
                <input bind:value={server.customizableRules[index].name} class="w-1/4 shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 w-[128px]" placeholder="name" type="text" name="extraName" id="extraName" required/>
                <input bind:checked={server.customizableRules[index].allowHostsToType} type="checkbox" name="allowHostsToType" id="allowHostsToType"> <label class="dark:text-white mt-2 mr-6 inline" for="allowHostsToType">Allow hosts to add a note</label>
                <button on:click={() => { removeCustomRule(index) }} class="hidden hoverHidden inline text-gray-100"><X class="inline"/></button>
              </div>
            </li>
          {/each}
        </ul>
        <button on:click={createRule} class="w-20 inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button>
      {/if}
      <h2 class="pt-4 mt-4 font-bold text-2xl dark:text-white">Config Options</h2>
      <h3 class="text-lg w-3/5 dark:text-white">Add/remove game options for hosts to customize while posting (e.g. add Absorption to be toggled or by hearts).</h3>
      {#if server.configOptions.length == 0}
        <h2 class="text-lg dark:text-white mt-2 text-gray-500 dark:text-gray-100">You have no config options.&nbsp; <button on:click={createOption} class="inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button></h2>
      {:else}
        <ul>
          {#each server.configOptions as extra, index} 
            <li>
              <div class="pt-1 pr-2 pb-1 flex flex-row gap-4 w-auto hideable rounded-lg">
                <input bind:value={server.configOptions[index].name} class="w-1/4 shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 w-[128px]" placeholder="name" type="text" name="extraName" id="extraName" required/>
                <select bind:value={server.configOptions[index].type} placeholder="select a type" required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-1/5 pl-2">
                  <option value="bool" class="dark:text-white">Boolean</option>
                  <option value="percent" class="dark:text-white">Percent</option>
                  <option value="number" class="dark:text-white">Number</option>
                  <option value="text" class="dark:text-white">Text</option>
                </select>
                <button on:click={() => { removeOption(index) }} class="hidden hoverHidden inline text-gray-100"><X class="inline"/></button>
              </div>
            </li>
          {/each}
        </ul>
        <button on:click={createOption} class="w-20 inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button>
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
        <button on:click={createExtra} class="w-20 inline bg-green-400 dark:bg-green-500 text-md mb-4 text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add</button>
      {/if}
    </div>
    <button on:click={save} class="w-1/5 mt-8 inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><Save class="mb-1 inline"/> Submit Changes</button>
  {:else}
    <h1 class="pt-6 font-bold text-2xl dark:text-white">Fetching server details...</h1>
  {/if}
  <Footer/>
</div>