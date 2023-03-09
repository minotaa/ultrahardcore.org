<script lang="ts">
  import "../app.css";
  import Navbar from "../components/Navbar.svelte";
  import Footer from "../components/Footer.svelte";
  import { onMount } from "svelte";
  import { RefreshCcw } from "lucide-svelte";
    import moment from "moment";

  let matches = []

  async function fetchMatches() {
    let response = await fetch("http://localhost:9000/matches/upcoming", {
      method: "GET",
    })
    let payload = await response.json()
    if (payload.success) {
      matches = payload.matches
      return payload.matches
    } else {
      return []
    }
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

  async function getUser(id: string) {
    const response = await fetch(`http://localhost:9000/account/getId?id=${id}`, {
      method: 'GET' // @ts-ignore
    })
    const payload = await response.json()
    if (payload.success) return payload.user
    else return null
  }
</script>

<div class="container pl-6">
  <h1 class="pt-4 font-bold text-2xl dark:text-white mb-4">Upcoming matches &nbsp;<a on:click={fetchMatches} class="inline bg-sky-300 dark:bg-sky-400 border border-sky-800 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><button><RefreshCcw class="mb-1 inline"/> Refresh</button></a></h1>
  {#await fetchMatches()}
    <h2 class="pt-2 text-xl dark:text-gray-200">Fetching matches...</h2>
  {:then matches}
    {#if matches.length > 0}
      <div class="gap-2 flex grid grid-flow-row-dense grid-cols-3">
        {#each matches as match}
          <div class="shadow dark:bg-zinc-800 rounded-lg bg-slate-100 pl-4 pt-4 pb-4 w-auto">
            {#if match.teamStyle != "ffa"}
              <h2 class="text-lg pb-2 dark:text-white font-bold">{match.displayName}'s #{match.hostCount} - {getTeamStyle(match.teamStyle)} To{match.teamSize}</h2>
            {:else}
              <h2 class="text-lg pb-2 dark:text-white font-bold">{match.displayName}'s #{match.hostCount} - {getTeamStyle(match.teamStyle)}</h2>
            {/if}
            <p class="text-md dark:text-white break-normal">Scenarios: <code class="text-md dark:text-white">{match.scenarios.join(', ')}</code></p>
            <p class="text-md dark:text-white">Border: <code>{match.mapSize}x{match.mapSize}</code></p>
            <p class="text-md dark:text-white">Server IP: <code>{match.serverIp}</code></p>
            <p class="text-md dark:text-white">Slots: <code>{match.slots}</code></p>
            <h3 class="text-sm italic font-bold dark:text-white mt-2"><strong>Final Heal: {match.finalHealOccurs}m / PvP: {match.pvpEnabledIn}m / Meetup: {match.meetupOccursAt}m</strong></h3>
            <h3 class="text-sm dark:text-slate-200 italic">Opens {moment(match.opensAt).fromNow()} | Version: <strong>{match.version}</strong></h3>
          </div>
        {/each}
      </div>
    {:else}
      <h2 class="pt-2 text-xl dark:text-gray-200">No matches yet, maybe try <a class="text-sky-500 hover:underline" href="/host">creating a match?</a></h2>  
    {/if}
  {:catch error}
    <h2 class="pt-2 text-xl dark:text-gray-200">Failed fetching matches...</h2>
  {/await }
  <Footer/>
</div>