<script lang="ts">
  import { onMount } from "svelte";
  import { token, BACKEND_URI } from "../../../hooks/auth";
  import { goto } from "$app/navigation";
  import { toast } from "@zerodevx/svelte-toast";
  import { page } from "$app/stores";
  import moment from "moment";
  import { error } from "@sveltejs/kit";
  import Footer from "../../../components/Footer.svelte";
  import { AlarmClock, Dice6, PersonStanding, Ruler, Copy, Twitter, Newspaper, Laptop, ShoppingBag, Link, Gamepad, Check, X } from "lucide-svelte";
    //import { BACKEND_URI } from "$env/static/private";

  interface Match {
    createdAt: Date,
    opensAt: Date,
    createdBy: string,
    removedBy: string,
    removedAt: Date,
    removedReason: string,
    removed: boolean,
    mapSize: number,
    pvpEnabledIn: number,
    finalHealOccurs: number,
    meetupOccursAt: number,
    extraRules: Array<any>,
    extraConfig: Object,
    scenarios: Array<any>,
    hostCount: number,
    displayName: string,
    serverIp: string,
    teamStyle: string,
    teamSize: number,
    slots: number,
    version: string,
    id: string,
    serverId: string,
    description: string
  }

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
    extraLinks: any[],
    customizableRules: object[],
    configOptions: object[],
    hostHidConfig: boolean
  }

  let server: Server
  let user: any
  let match: Match
  let loadedYet = false
  onMount(async () => {
    let response = await fetch(`${BACKEND_URI}/account/get`, {
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
    response = await fetch(`${BACKEND_URI}/matches/get?match=${await $page.params.match}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    payload = await response.json()
    if (payload.success) {
      match = payload.match
      server = await getServer(match.serverId)
      console.log(match)
      loadedYet = true
    } else {
      error(404, {
        message: 'Not found'
      })
      goto('/')
      toast.push("Invalid match ID!")
    }
  })

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
    const response = await fetch(`${BACKEND_URI}/server/get?server=${id}`, {
      method: 'GET' // @ts-ignore
    })
    const payload = await response.json()
    if (payload.success) {
      return payload.server
    } else {
      return null
    }
  }

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
</script>

{#if loadedYet == true}
  <h3 class="mt-4 pl-4 text-sky-400 font-bold"><a href="/">← Go back home</a></h3>
  <div class="pl-4 flex justify-center items-center pr-4">
    <div class="flex justify-center mt-4 pb-6 flex-col shadow rounded-lg dark:bg-zinc-800 bg-slate-200 w-full">
      <div class="flex flex-col items-center">
        <div class="flex flex-row gap-2 mt-4">
          {#await getServer(match.serverId)}
            <h3 class="text-md mt-2 dark:text-white rounded-lg pt-2 pb-2 pl-3 pr-3 bg-sky-500 shadow w-fit">Fetching region...</h3>
          {:then server}
            <h3 class="text-md mt-2 dark:text-white rounded-lg pt-2 pb-2 pl-3 pr-3 bg-sky-500 shadow w-fit">{getRegion(server.region)}</h3>
          {/await}
          {#if (Math.abs(moment().diff(moment(match.opensAt), 'minutes')) <= 15)}
            <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pt-2 pb-2 pr-3 bg-red-600 shadow w-fit" title={moment(match.opensAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}>{moment(match.opensAt) > moment() ? "Opens" : "Opened"} <strong>{moment(match.opensAt).fromNow()}</strong></p>
          {:else if (Math.abs(moment().diff(moment(match.opensAt), 'minutes')) <= 30)}
            <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pt-2 pb-2 pr-3 bg-yellow-500 shadow w-fit" title={moment(match.opensAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}>{moment(match.opensAt) > moment() ? "Opens" : "Opened"} <strong>{moment(match.opensAt).fromNow()}</strong></p>
          {:else}
            <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pt-2 pb-2 pr-3 bg-green-500 shadow w-fit" title={moment(match.opensAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}>{moment(match.opensAt) > moment() ? "Opens" : "Opened"} <strong>{moment(match.opensAt).fromNow()}</strong></p>
          {/if}
          <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pt-2 pb-2 pr-3 bg-gray-500 shadow w-fit">{match.version}</p>
          {#if match.teamStyle != "ffa" && match.teamStyle != "auction"}
            <p class="text-md mt-2 dark:text-white rounded-lg pt-2 pb-2 pl-3 pr-3 bg-gray-500 shadow w-fit">{getTeamStyle(match.teamStyle)} To{match.teamSize}</p>
          {:else}
            <p class="text-md mt-2 dark:text-white rounded-lg pt-2 pb-2 pl-3 pr-3 bg-gray-500 shadow w-fit">{getTeamStyle(match.teamStyle)}</p>
          {/if}
        </div>
        <h2 class="text-3xl dark:text-white font-bold mt-4">{match.displayName}'s #{match.hostCount}</h2>
        <h3 class="text-xl mt-2 dark:text-white"><Dice6 class="mb-1 inline"/> Scenarios: <strong>{match.scenarios.join(', ')}</strong></h3>
        <h3 class="text-xl dark:text-white"><Ruler class="mb-1 inline"/> Border: <strong>{match.mapSize}x{match.mapSize}</strong></h3>
        <h3 class="text-xl dark:text-white"><PersonStanding class="mb-1 inline"/> Slots: <strong>{match.slots}</strong></h3>
        <h3 class="text-xl dark:text-white"><AlarmClock class="mb-1 inline"/>&nbsp;Final Heal: <strong>{match.finalHealOccurs}m</strong> • PvP: <strong>{match.pvpEnabledIn}m</strong> • Meetup: <strong>{match.meetupOccursAt}m</strong></h3>
        <div class="flex justify-center items-center flex-row mt-4">
          <input class="shadow flex items-center w-96 pt-2 pb-2 pl-2 text-lg rounded-lg text-center dark:text-white dark:bg-zinc-900 bg-slate-200" type="text" name="serverIp" id="serverIp" value={match.serverIp} disabled>
          <button class="text-xl pt-2 pr-2 pb-2 pl-2 hover:scale-110 transition-all" title="Copy to clipboard" on:click={navigator.clipboard.writeText(match.serverIp).then(() => { toast.push('Copied to clipboard!') }).catch(err => alert(err))}><Copy class="dark:text-white"/></button>
        </div>
      </div>
      <hr class="border-0 dark:bg-zinc-700 bg-slate-100 mt-8 mb-8 h-px"/>
      <div class="flex justify-center items-center flex-col">
        <h2 class="text-2xl dark:text-white font-bold">Hosted on <a class="text-sky-100 dark:text-sky-500" href={"/server/" + server.id}>{server.name}</a></h2>
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
      </div>
      {#if match.hostHidConfig == false || match.hostHidConfig == null}
        <hr class="border-0 dark:bg-zinc-700 bg-slate-100 mt-8 mb-4 h-px"/>
        <div class="flex flex-col gap-y-4 pl-12 pr-12 justify-center items-center mb-4">
          {#if Object.keys(match.extraConfig).length > 0}
            <h2 class="text-2xl font-bold dark:text-white mt-2">Game Configuration</h2>
            <h3 class="text-xl dark:text-white -mt-3">The host has provided game options for this match.</h3>
            <div class="flex flex-wrap gap-x-2 gap-y-1 container">
              {#each Object.keys(match.extraConfig) as configOption}
                  {#if (match.extraConfig[configOption]) == true}
                    <h3 class="text-lg font-bold dark:text-white pl-2 pr-2 dark:bg-green-600 bg-green-500 rounded-lg shadow"><Check class="mb-1 inline"/>{configOption}</h3>
                  {:else if (match.extraConfig[configOption]) == false}
                    <h3 class="text-lg font-bold dark:text-white pl-2 pr-2 dark:bg-red-600 bg-red-500 rounded-lg shadow"><X class="mb-1 inline"/>{configOption}</h3>
                  {:else if !(isNaN(match.extraConfig[configOption]))}
                    <h3 class="text-lg font-bold dark:text-white pl-2 pr-2 dark:bg-sky-600 bg-sky-500 rounded-lg shadow">{configOption}: {match.extraConfig[configOption]}</h3>
                  {/if}
              {/each}
            </div>
          {/if}
            {#if match.extraRules.length > 0}
              <h2 class="text-2xl font-bold dark:text-white mt-2">Game Rules</h2>
              <h3 class="text-xl dark:text-white -mt-3">The host has provided game rules for this match.</h3>
              <div class="flex flex-wrap gap-x-2 gap-y-1 container">
                {#each match.extraRules as rule}
                  {#if rule.status == true}
                    <h3 class="text-lg font-bold dark:text-white pl-2 pr-2 dark:bg-green-600 bg-green-500 rounded-lg shadow"><Check class="mb-1 inline"/>{rule.rule.name}: Allowed</h3>
                  {:else}
                    <h3 class="text-lg font-bold dark:text-white pl-2 pr-2 dark:bg-red-600 bg-red-500 rounded-lg shadow"><X class="mb-1 inline"/>{rule.rule.name}: Not allowed</h3>
                  {/if}
                {/each}
              </div>
            {/if}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <h1 class="dark:text-white text-2xl font-bold mt-6 pl-2 placeholder">Fetching data...</h1>
  <h2 class="dark:text-white text-xl mt-2 pl-2">Note that if you can see this for more than a second then something is seriously wrong.</h2>
{/if}
<div class="container pl-4">
  <Footer/>
</div>