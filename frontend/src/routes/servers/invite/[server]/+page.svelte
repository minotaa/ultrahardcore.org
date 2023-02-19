<script lang="ts">
  import { page } from '$app/stores'
  import { onMount } from 'svelte';
  import { token } from "../../../../hooks/auth";
  import moment from "moment";
  import { toast } from '@zerodevx/svelte-toast'
  import { goto } from '$app/navigation';
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
    extraLinks: object[],
    customizableRules: object[],
    configOptions: object[]
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
  let invitee: string

  async function getSuggestions() {
    let response = await fetch(`http://localhost:9000/account/getNames?name=${invitee}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    let payload = await response.json()
    if (payload.success) {
      foundUsers = payload.users
    }
  }
  let foundUsers = []
</script>

<div class="container pl-8">
  {#if loadedYet}
    <div class="flex-col flex-gap">
      <h3 class="mt-4 text-sky-400 font-bold"><a href="/servers">← Go back to servers list</a></h3>
      <h2 class="pt-4 font-bold text-2xl dark:text-white">Invite Users</h2>
      <h3 class="mb-2 text-lg dark:text-white">Invite other members to {server.name}!</h3>
      <input on:input={getSuggestions} bind:value={invitee} class="shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="invite" id="invite"/>
      <button class="w-1/8 inline bg-sky-400 dark:bg-sky-500 text-md text-white pl-2 pr-2 pt-2 pb-2 rounded-lg">Invite</button>
    </div>
    <ul>
      {#if foundUsers.length > 0}
        {#each foundUsers as user, i}
          <li class="w-1/3 text-md dark:text-white pl-2 pt-2 pb-2 dark:bg-slate-800 bg-slate-200 dark:hover:bg-slate-900 hover:bg-slate-300">{user.username}</li>
        {/each}
      {/if}
    </ul>
  {:else}
    <h3 class="mb-2 mt-6 text-xl dark:text-white">Fetching server details...</h3>
  {/if}
  <Footer/>
</div>