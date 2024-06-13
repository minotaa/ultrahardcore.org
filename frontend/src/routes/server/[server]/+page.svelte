<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation';
  import { toast } from '@zerodevx/svelte-toast';
  import { onMount } from 'svelte';
  import { token } from '../../../hooks/auth';
  import Footer from '../../../components/Footer.svelte';
  import { Twitter, Gamepad, Newspaper, Laptop, Link, CheckCircle2, XCircle, ShoppingBag, Ruler, PersonStanding, Dice6, Binary, AlarmClock } from 'lucide-svelte';
  import moment from 'moment';

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
  let extraServers: string[] = []
  onMount(async() => {
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
      user = null
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
    await fetchMatches()
    await startFetching()
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

  async function denyInvite() {
    const response = await fetch(`http://localhost:9000/server/denyInvite?server=${server.id}`, {
      method: 'POST', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    const payload = await response.json()
    if (payload.success) {
      server = payload.server
      toast.push(`Successfully denied ${server.name}'s invite.'`)
    }
  }

  async function acceptInvite() {
    const response = await fetch(`http://localhost:9000/server/acceptInvite?server=${server.id}`, {
      method: 'POST', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    const payload = await response.json()
    if (payload.success) {
      server = payload.server
      toast.push(`Successfully accepted ${server.name}'s invite.'`)
    }
  }

  let matches: any[] = []
  let serverMatches: any[] = []

  async function fetchMatches() {
    let response = await fetch("http://localhost:9000/matches/upcoming", {
      method: "GET",
    })
    let payload = await response.json()
    lastFetched = moment()
    lastFetched = lastFetched
    if (payload.success) {
      matches = payload.matches
      serverMatches = []
      for (const match of matches) {
        if (match.serverId == server.id) {
          serverMatches.push(match)
        }
      }
      return payload.matches
    } else {
      return []
    }
  }

  let lastFetched = moment()
  async function startFetching() {
    const interval = setInterval(async () => {
		  await fetchMatches()
	  }, 15000);
	  return () => clearInterval(interval);
  }

  function getTeamStyle(style: string) {
    let styles = {
      "ffa": "FFA",
      "chosen": "Chosen",
      "random": "Random",
      "captains": "Captains",
      "picked": "Picked",
      "auction": "Auction",
      "mystery": "Mystery",
      "rvb": "RvB",
      "rigged": "Rigged",
      "wished": "Wished"
    }
    //@ts-ignore
    return styles[style]
  }

  async function getServer(id: string) {
    const response = await fetch(`http://localhost:9000/server/get?server=${id}`, {
      method: 'GET' // @ts-ignore
    })
    const payload = await response.json()
    if (payload.success) {
      return payload.server
    } else {
      return null
    }
  }
</script>

<div class="container pl-8">
  {#if loadedYet}
    <h3 class="mt-4 text-sky-400 font-bold"><a href="/">← Go back home</a></h3>
    {#if user && server.invited.includes(user.mId)}
      <div class="mt-2 pt-4 pl-4 pb-4 w-fit rounded-lg pr-4 shadow dark:bg-zinc-800 bg-slate-100">
        <div class="flex flex-row gap-4">
          <div>
            <h2 class="text-xl dark:text-white mt-3">You've been invited to <strong>{server.name}</strong>!</h2>
          </div>
          <div class="flex flex-row gap-4">
            <button on:click={denyInvite} class="dark:bg-red-500 bg-red-400 pl-4 pr-4 text-white pt-2 pb-2 mt-1 rounded-lg font-bold"><XCircle class="inline mb-1"/> Deny Invite</button>
            <button on:click={acceptInvite} class="dark:bg-green-500 bg-green-400 pl-4 pr-4 text-white pt-2 pb-2 mt-1 rounded-lg font-bold"><CheckCircle2 class="inline mb-1"/> Accept Invite</button>
          </div>
        </div>
      </div>
    {/if}
    <h2 class="pt-4 font-bold text-3xl dark:text-white">{server.name}</h2>
    <h3 class="pt-2 text-xl dark:text-white">Region: <strong>{getRegion(server.region)}</strong> • Location: <strong>{server.location}</strong></h3>
    {#await getOwner(server.owner)}
      <h2 class="text-xl dark:text-white">Owner: <strong>Fetching...</strong> • Members: <strong>{server.members.length}</strong></h2>
    {:then owner}
      <h2 class="text-xl dark:text-white">Owner: <strong>{owner.username}</strong> • Members: <strong>{server.members.length}</strong></h2>
    {:catch error}
      <h2 class="text-xl dark:text-white">Owner: <strong>Failed...</strong> • Members: <strong>{server.members.length}</strong></h2>
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
      {#if server.storeUrl}
        <a rel="noreferrer" target="_blank" href={server.storeUrl}><h3 class="pt-4 text-md dark:text-sky-500 text-sky-400"><ShoppingBag class="inline mb-1"/> Store</h3></a>
      {/if}
      {#if server.extraLinks && server.extraLinks.length > 0}
        {#each server.extraLinks as extra}
          <a rel="noreferrer" target="_blank" href={extra.url}><h3 class="pt-4 text-md dark:text-sky-500 text-sky-400"><Link class="inline mb-1"/> {extra.name}</h3></a>
        {/each}
      {/if}
    </div>
    <hr class="border-0 dark:bg-zinc-800 bg-slate-100 mt-6 h-px"/>
    <h1 class="pt-4 font-bold text-2xl dark:text-white">Upcoming {server.name} matches</h1>
    <h2 class="text-sm dark:text-white mb-4 italic">Last fetched @ {lastFetched.format("HH:mm:ss")}</h2>
    <div class="gap-4 flex grid grid-flow-row-dense grid-cols-3">
      {#each serverMatches as match}
        <div class="shadow dark:bg-zinc-800 rounded-lg bg-slate-100 pl-4 pt-4 pb-4 w-auto">
          <div class="flex flex-row gap-2">
            <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pr-3 bg-gray-500 shadow w-fit" title={moment(match.opensAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Opens <strong>{moment(match.opensAt).fromNow()}</strong></p>
            <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pr-3 bg-gray-500 shadow w-fit">{match.version}</p>
            {#if match.teamStyle != "ffa" && match.teamStyle != "auction"}
              <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pr-3 bg-gray-500 shadow w-fit">{getTeamStyle(match.teamStyle)} To{match.teamSize}</p>
            {:else}
              <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pr-3 bg-gray-500 shadow w-fit">{getTeamStyle(match.teamStyle)}</p>
            {/if}
          </div>
          <h2 class="mt-2 text-lg dark:text-white font-bold mb-2">{match.displayName}'s #{match.hostCount}</h2>
          <p class="text-md dark:text-white break-normal"><Dice6 class="mb-1 mr-2 inline"/>Scenarios: <code class="text-md dark:text-white">{match.scenarios.join(', ')}</code></p>
          <p class="text-md dark:text-white"><Ruler class="mb-1 mr-2 inline"/>Border: <code>{match.mapSize}x{match.mapSize}</code></p>
          <p class="text-md dark:text-white"><Binary class="mb-1 mr-2 inline"/>Server IP: <code>{match.serverIp}</code>
          <p class="text-md dark:text-white"><PersonStanding class=" mr-2 inline"/>Slots: <code>{match.slots}</code></p>
          <h3 class="text-md dark:text-white"><AlarmClock class="mb-1 inline"/>&nbsp; Final Heal: {match.finalHealOccurs}m • PvP: {match.pvpEnabledIn}m • Meetup: {match.meetupOccursAt}m</h3>
        </div>
      {/each}
    </div>
  {:else}
    <h2 class="pt-4 font-bold text-2xl dark:text-white">Fetching server details...</h2>
  {/if}
  <Footer/>
</div>