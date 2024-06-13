<script lang="ts">
  import "../app.css";
  import Navbar from "../components/Navbar.svelte";
  import Footer from "../components/Footer.svelte";
  import { onMount } from "svelte";
  import { RefreshCcw, Ruler, PersonStanding, Dice6, Binary, AlarmClock } from "lucide-svelte";
  import moment from "moment";

  let matches: any[] = []

  async function fetchMatches() {
    let response = await fetch("http://localhost:9000/matches/upcoming", {
      method: "GET",
    })
    let payload = await response.json()
    lastFetched = moment()
    if (payload.success) {
      matches = payload.matches
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

  onMount(async () => {
    await fetchMatches()
    await startFetching()
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

  async function getUser(id: string) {
    const response = await fetch(`http://localhost:9000/account/getId?id=${id}`, {
      method: 'GET' // @ts-ignore
    })
    const payload = await response.json()
    if (payload.success) return payload.user
    else return null
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

<div class="container pl-6">
  <h1 class="pt-4 font-bold text-2xl dark:text-white">Upcoming matches</h1>
  <h2 class="text-sm dark:text-white mb-4 italic">Last fetched @ {lastFetched.format("HH:mm:ss")}</h2>
  {#if matches.length > 0}
    <div class="gap-4 flex grid grid-flow-row-dense grid-cols-3">
      {#each matches as match}
        <div class="shadow dark:bg-zinc-800 rounded-lg bg-slate-100 pl-4 pt-4 pb-4 w-auto">
          <div class="flex flex-row gap-2">
            {#if (Math.abs(moment().diff(moment(match.opensAt), 'minutes')) <= 15)}
              <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pr-3 bg-red-600 shadow w-fit" title={moment(match.opensAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Opens <strong>{moment(match.opensAt).fromNow()}</strong></p>
            {:else if (Math.abs(moment().diff(moment(match.opensAt), 'minutes')) <= 30)}
              <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pr-3 bg-yellow-500 shadow w-fit" title={moment(match.opensAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Opens <strong>{moment(match.opensAt).fromNow()}</strong></p>
            {:else}
              <p class="text-md mt-2 dark:text-white rounded-lg pl-3 pr-3 bg-green-500 shadow w-fit" title={moment(match.opensAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Opens <strong>{moment(match.opensAt).fromNow()}</strong></p>
            {/if}
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
          <p class="text-md dark:text-white"><Binary class="mb-1 mr-2 inline"/>Server IP: <code>{match.serverIp}</code> {#await getServer(match.serverId)}
            <h3 class="text-md dark:text-white inline">(Fetching server...)</h3>
          {:then server}
            <h3 class="text-md dark:text-white inline">(Hosted on <a href="/server/{server.id}" class="hover:underline font-bold text-sky-300 dark:text-sky-500">{server.name}</a>)</h3>
          {/await}</p>
          <p class="text-md dark:text-white"><PersonStanding class=" mr-2 inline"/>Slots: <code>{match.slots}</code></p>
          <h3 class="text-md dark:text-white"><AlarmClock class="mb-1 inline"/>&nbsp; Final Heal: {match.finalHealOccurs}m • PvP: {match.pvpEnabledIn}m • Meetup: {match.meetupOccursAt}m</h3>
        </div>
      {/each}
    </div>
  {:else}
    <h2 class="text-xl dark:text-gray-200">No matches yet, maybe try <a class="text-sky-500 hover:underline" href="/host">creating a match?</a></h2>  
  {/if}
  <Footer/>
</div>