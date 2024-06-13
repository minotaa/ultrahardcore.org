<script lang="ts">
  import "../../../app.css"
  import Navbar from "../../../components/Navbar.svelte";
  import Footer from "../../../components/Footer.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { token } from "../../../hooks/auth";
  import moment from "moment";
  import { toast } from '@zerodevx/svelte-toast'
  import { CheckCircle2, XCircle } from "lucide-svelte";

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
    configOptions: object[],
    optionalConfiguration: boolean
  }

  let servers: Server[]
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
      if (user.role != "admin") {
        goto('/')
      }
    } else {
      token.set(undefined)
      user = null
    }
    response = await fetch(`http://localhost:9000/server/getApprovableServers`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    payload = await response.json()
    if (payload.success) {
      servers = payload.servers
    }
    loadedYet = true
  })

  async function getServers() {
    loadedYet = false
    let response = await fetch(`http://localhost:9000/server/getApprovableServers`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    let payload = await response.json()
    if (payload.success) {
      servers = payload.servers
    }
    loadedYet = true
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

  async function approve(server: Server) {
    await fetch(`http://localhost:9000/server/approve?server=${server.id}`, {
      method: 'POST', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    getServers()
    toast.push(`Successfully approved ${server.name}!`)
    
  }

  async function deny(server: Server) {
    await fetch(`http://localhost:9000/server/deny?server=${server.id}`, {
      method: 'POST', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    getServers()
    toast.push(`Successfully denied ${server.name}!`)
  }
</script>

<div class="container pl-8">
  <h1 class="pt-6 font-bold text-2xl dark:text-white">Approve Servers</h1>
  {#if loadedYet}
    {#if servers.length == 0}
      <h2 class="pt-2 text-xl text-gray-500 dark:text-gray-100">No servers to approve yet.</h2>
    {:else}
      {#each servers as server}
        <ul class="flex flex-row pt-4 gap-4">
          <li>
            <div class="shadow rounded-lg dark:bg-zinc-800 bg-slate-100 pt-6 pb-6 pl-6 pr-16">
              <h1 class="font-bold text-xl dark:text-white">{server.name}</h1>
              {#if server.ip != null}
                <h2 class="text-md mt-2 dark:text-white">IP: <code>{server.ip}</code></h2>
              {:else}
                <h2 class="text-md dark:text-white">IP: <code>{server.address}</code></h2>
              {/if}
              <h2 class="text-md dark:text-white">Location: <strong>{server.location}</strong></h2>
              <h2 class="text-md dark:text-white">Region: <strong>{getRegion(server.region)}</strong></h2>
              <h2 class="text-md dark:text-white">Created: <strong>{moment(server.createdAt).fromNow()}</strong></h2>
              {#await getOwner(server.owner)}
                <h2 class="text-md dark:text-white">Owner: <strong>Fetching...</strong></h2>
              {:then owner}
                <h2 class="text-md dark:text-white">Owner: <strong>{owner.username}</strong></h2>
              {:catch error}
                <h2 class="text-md dark:text-white">Owner: <strong>Failed...</strong></h2>
              {/await}
              <div class="flex flex-row gap-4">
                <button on:click={deny(server)} class="dark:bg-red-500 bg-red-400 pl-4 pr-4 text-white pt-2 pb-2 mt-2 rounded-lg font-bold"><XCircle class="inline mb-1"/> Deny</button>
                <button on:click={approve(server)} class="dark:bg-green-500 bg-green-400 pl-4 pr-4 text-white pt-2 pb-2 mt-2 rounded-lg font-bold"><CheckCircle2 class="inline mb-1"/> Approve</button>
              </div>
            </div>
          </li>
        </ul>
      {/each}
    {/if}
  {:else}
    <h2 class="pt-2 text-xl text-gray-500 dark:text-gray-100">Fetching servers...</h2>
  {/if}
  <Footer/>
</div>