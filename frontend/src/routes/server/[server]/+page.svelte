<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation';
  import { toast } from '@zerodevx/svelte-toast';
  import { onMount } from 'svelte';
  import { token } from '../../../hooks/auth';
  import Footer from '../../../components/Footer.svelte';
  import { Twitter, Gamepad, Newspaper, Laptop, Link } from 'lucide-svelte';

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
    extraLinks: object[],
    customizableRules: object[],
    configOptions: object[]
  }

  let server: Server
  let loadedYet = false
  let extraServers = []
  onMount(async() => {
    let response = await fetch(`http://localhost:9000/server/get?server=${await $page.params.server}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    let payload = await response.json()
    if (payload.success) {
      server = payload.server
      if (server.extraServers.length > 0) {
        server.extraServers.forEach(extra => {
          extraServers.push(`${extra.name} (${extra.ip})`)
        })
        extraServers.push(`Hub (${server.ip})`)
      }
    } else {
      goto('/')
      toast.push("Invalid server ID!")
    }
    loadedYet = true
  })

  function getRegion(region: string) {
    if (region == "na") {
      return "🌎 North America"
    } else if (region == "au") {
      return "🌏 Oceania"
    } else if (region == "as") {
      return "🌏 Asia"
    } else if (region == "sa") {
      return "🌎 South America"
    } else if (region == "af") {
      return "🌍 Africa"
    } else if (region == "eu") {
      return "🌍 Europe" 
    }
  }

  async function getOwner(id: string) {
    const response = await fetch(`http://localhost:9000/account/getId?id=${id}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    const payload = await response.json()
    if (payload.success) return payload.user
    else return null
  }
</script>

<div class="container pl-8">
  {#if loadedYet}
    <h2 class="pt-4 font-bold text-3xl dark:text-white">{server.name}</h2>
    <h3 class="pt-2 text-xl dark:text-white">Region: <strong>{getRegion(server.region)}</strong> | Location: <strong>{server.location}</strong></h3>
    {#await getOwner(server.owner)}
      <h2 class="text-xl dark:text-white">Owner: <strong>Fetching...</strong></h2>
    {:then owner}
      <h2 class="text-xl dark:text-white">Owner: <strong>{owner.username}</strong></h2>
    {:catch error}
      <h2 class="text-xl dark:text-white">Owner: <strong>Failed...</strong></h2>
    {/await}
    {#if server.extraServers && server.extraServers.length > 0}
      <h3 class="pt-2 text-xl dark:text-white"><strong>Servers:</strong></h3>
      <ul>
        {#each extraServers as extra}
          <li class="list-disc list-inside dark:text-white text-gray-100"><strong>{extra}</strong></li>
        {/each}
      </ul>
    {:else}
      <h3 class="pt-2 text-xl dark:text-white">IP: <code>{server.ip}</code></h3>
    {/if}
    <div class="flex-row flex gap-4">
      {#if server.twitterUrl}
        <a rel="noreferrer" target="_blank" href={server.twitterUrl}><h3 class="pt-4 text-md dark:text-sky-500 text-sky-400"><Twitter class="inline mb-1"/> Twitter</h3></a>
      {/if}
      {#if server.discordUrl}
        <a rel="noreferrer" target="_blank" href={server.discordUrl}><h3 class="pt-4 text-md dark:text-sky-500 text-sky-400"><Gamepad class="inline mb-1"/> Discord</h3></a>
      {/if}
      {#if server.scenarioDescriptions}
        <a rel="noreferrer" target="_blank" href={server.scenarioDescriptions} class="pt-4 text-md dark:text-sky-500 text-sky-400"><Newspaper class="inline mb-1"/> Scenario Descriptions</a>
      {/if}
      {#if server.websiteUrl}
        <a rel="noreferrer" target="_blank" href={server.websiteUrl}><h3 class="pt-4 text-md dark:text-sky-500 text-sky-400"><Laptop class="inline mb-1"/> Website</h3></a>
      {/if}
      {#if server.extraLinks && server.extraLinks.length > 0}
        {#each server.extraLinks as extra}
          <a rel="noreferrer" target="_blank" href={extra.url}><h3 class="pt-4 text-md dark:text-sky-500 text-sky-400"><Link class="inline mb-1"/> {extra.name}</h3></a>
        {/each}
      {/if}
    </div>
    <hr class="border-0 dark:bg-zinc-800 bg-slate-100 mt-6 h-px"/>
  {:else}
    <h2 class="pt-4 font-bold text-2xl dark:text-white">Fetching server details...</h2>
  {/if}
  <Footer/>
</div>