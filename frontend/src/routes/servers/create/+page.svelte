<script lang="ts">
  import "../../../app.css";
  import Navbar from "../../../components/Navbar.svelte";
  import Footer from "../../../components/Footer.svelte";
  
  import { token } from "../../../hooks/auth"
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
    <h1 class="pt-6 font-bold text-2xl">Create Server</h1>
    
    <Footer/>
  </div>
</main>