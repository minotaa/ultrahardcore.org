<script lang="ts">
  import "../../app.css";
  import Navbar from "../../components/Navbar.svelte";
  import Footer from "../../components/Footer.svelte";
  import moment from "moment"
  import { XCircle, CheckCircle, PlusCircle, CheckCircle2 } from "lucide-svelte";
  
  import { token } from "../../hooks/auth"
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  interface Server {
    name: string,
    ip: string,
    address: string,
    location: string, 
    region: string,
    scenarioDescriptions: string,
    members: object[],
    createdAt: Date,
    owner: string,
    id: string,
    invited: string[],
    verified: boolean
  }

  let user: any
  let servers: string[] = []
  let list: Server[] = []
  let loadedYet = false
  onMount(async () => {
    const response = await fetch(`http://localhost:9000/account/get`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    const payload = await response.json()
    if (payload.success) {
      user = payload.user
      servers = payload.user.servers
      for await (const server of servers) {
        const response = await fetch(`http://localhost:9000/server/get?server=${server}`, {
          method: 'GET', // @ts-ignore
          headers: {
            'Authorization': $token
          }
        })
        const payload = await response.json()
        if (payload.success) {
          list.push(payload.server)
        }
      }
      loadedYet = true
    } else {
      token.set(undefined)
      goto('/')
    }
  })

  function getRegion(region: string) {
    if (region == "na") {
      return "North America"
    } else if (region == "au") {
      return "Oceania"
    } else if (region == "as") {
      return "Asia"
    } else if (region == "sa") {
      return "South America"
    } else if (region == "af") {
      return "Africa"
    }
  }

  async function getMembership(userId: string, serverId: string) {
    const response = await fetch(`http://localhost:9000/server/getMember?user=${userId}&server=${serverId}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    const payload = await response.json()
    if (payload.success) return payload.member
    else return null
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
  <h1 class="pt-6 font-bold text-2xl dark:text-white">Your Servers&nbsp; <a href="/servers/create" class="inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 mt-6 rounded-lg"><button><PlusCircle class="mb-1 inline"/> Create</button></a></h1>
  {#if loadedYet}
    {#if list && list.length === 0}
    <h2 class="pt-2 text-xl dark:text-gray-100 text-gray-500">You are not in any servers. Maybe <a href="/servers/create" class="hover:underline text-sky-500">create one?</a></h2>
    {:else}
      <ul class="flex flex-row pt-4 gap-4">
        {#each list as server}
          <li>
            <div class="shadow dark:bg-zinc-800 rounded-lg bg-slate-100 pt-6 pb-6 pl-6 pr-16">
              <h1 class="font-bold dark:text-white text-xl">{server.name}</h1>
              {#if server.ip != null}
                <h2 class="text-md dark:text-white mt-2">IP: <code>{server.ip}</code></h2>
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
              {/await }
              {#if server.verified == false}
                <h2 class="text-md mt-2 text-red-500 dark:text-red-600"><XCircle class="inline mb-1"/> Not verified yet</h2>
              {:else}
                <h2 class="text-md mt-2 text-green-500 dark:text-green-600"><CheckCircle2 class="inline mb-1"/> Verified</h2>
              {/if}
              {#await getMembership(user.mId, server.id)}
                <h2 class="text-sm dark:text-white">Fetching membership details...</h2>
              {:then member}
                {#if member.role == "owner" || member.role == "admin"}
                  <h2 class="mt-2 text-sm dark:text-white"><a href="/servers/manage/{server.id}" class="text-sky-500 hover:underline">Manage</a> | <a href="/servers/invite/{server.id}" class="text-sky-500 hover:underline">Invite</a> | <a href="/server/{server.id}" class="text-sky-500 hover:underline">View</a></h2>
                {:else}
                  <h2 class="mt-2 text-sm dark:text-white"><a href="/server/{server.id}" class="text-sky-500 hover:underline">View</a></h2>
                {/if}
              {:catch error}
                <h2 class="mt-2 text-sm dark:text-white">Fetching membership details: <strong>Failed...</strong></h2>
              {/await}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <h2 class="pt-2 text-xl text-gray-500 dark:text-gray-100">Fetching servers...</h2>
  {/if}
  <Footer/>
</div>