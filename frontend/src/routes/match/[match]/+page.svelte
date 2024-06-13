<script lang="ts">
  import { onMount } from "svelte";
  import { token } from "../../../hooks/auth";
  import { goto } from "$app/navigation";
  import { toast } from "@zerodevx/svelte-toast";
  import { page } from "$app/stores";
  import moment from "moment";
    import { error } from "@sveltejs/kit";
    import { AlarmClock, Dice6, PersonStanding, Ruler } from "lucide-svelte";

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

  let user: any
  let match: Match
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
      user = null
    }
    response = await fetch(`http://localhost:9000/matches/get?match=${await $page.params.match}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    payload = await response.json()
    if (payload.success) {
      match = payload.match
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
  <div class="container pl-4">
    <h3 class="mt-4 text-sky-400 font-bold"><a href="/">← Go back home</a></h3>
    <div class="flex justify-center mt-4 pb-6 flex-col items-left pl-8 shadow rounded-lg dark:bg-zinc-800 bg-slate-200">
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
      </div>
      <hr class="border-0 dark:bg-zinc-700 bg-slate-100 mt-4 mb-4 h-px"/>
    </div>
  </div>
{:else}
  <h1 class="dark:text-white text-2xl font-bold mt-6 pl-2">Fetching data...</h1>
{/if}