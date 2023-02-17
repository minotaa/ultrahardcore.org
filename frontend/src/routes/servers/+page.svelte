<script lang="ts">
  import "../../app.css";
  import Navbar from "../../components/Navbar.svelte";
  import Footer from "../../components/Footer.svelte";
  
  import { token } from "../../hooks/auth"
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let user: any
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
    } else {
      token.set(undefined)
      
    }
    if (!user) {
      goto('/')
    }
  })
</script>

<main class="pt-4 pl-4">
  <Navbar/>
  <div class="container pl-8">
    <h1 class="pt-6 font-bold text-2xl">Your Servers</h1>
    {#if user && user.servers.length === 0}
     <h2 class="pt-2 text-xl text-gray-500">You are not in any servers. Maybe <a href="/servers/create" class="hover:underline text-sky-500">create one?</a></h2>
    {:else}
    
    {/if}
    <Footer/>
  </div>
</main>