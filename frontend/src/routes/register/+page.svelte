<script lang="ts">
  import "../../app.css"
  import { UserPlus } from 'lucide-svelte'
  import Navbar from "../../components/Navbar.svelte"
  import Footer from "../../components/Footer.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { token } from "../../hooks/auth";

  let email: string 
  let username: string
  let confirmEmail: string
  let confirmPassword: string
  let password: string
  let error: string[]
  let success: boolean = false
  async function handleSubmit(e: Event) {
    e.preventDefault()
    const res = await fetch(`http://localhost:9000/account/register`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirmPassword: confirmPassword,
        confirmEmail: confirmEmail,
        password: password,
        username: username,
        email: email
      })
    })
    const payload = await res.json()
    if (!payload.success) {
      error = payload.errors 
    }
    if (payload.success) {
      success = true
    }
  }

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
      user = null
    }
    if (user) {
      goto('/')
    }
  })
</script>

<main class="pt-4 pl-4">
  <Navbar/>
  <div class="flex flex-col gap-6 justify-center items-center mt-16">
    <h1 class="text-2xl font-bold">Register for <a href="/" class="hover:underline">ultrahardcore.org</a></h1>
      {#if success == false} 
        {#if error != null}
          <h2 class="text-center text-md bg-red-100 shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4"><strong>Errors:</strong> {error.join(', ')}</h2>
        {/if}
        <form on:submit={handleSubmit}>
          <div class="flex flex-col gap-2 justify-center">
            <label for="username" class="font-bold">Username:</label>
            <input required bind:value={username} class="shadow bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="name" name="username" id="username"/>
            <label for="email" class="font-bold mt-4">Email:</label>
            <input required bind:value={email} class="shadow bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="email" name="email" id="email"/>
            <label for="confirmEmail" class="font-bold">Confirm Email:</label>
            <input required bind:value={confirmEmail} class="shadow bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="email" name="confirmEmail" id="confirmEmail"/>
            <label for="password" class="font-bold mt-4">Password:</label>
            <input required bind:value={password} class="shadow bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="password" name="password" id="password"/>
            <label for="confirmPassword" class="font-bold">Confirm Password:</label>
            <input required bind:value={confirmPassword} class="shadow bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="password" name="confirmPassword" id="confirmPassword"/>
            <button type="submit" class="bg-green-400 text-white pt-2 pb-2 mt-2 rounded-lg font-bold"><UserPlus class="inline mb-1"/> Register</button>
          </div>
        </form>
      {:else}
        <h2 class="text-center text-md shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4">Check your email for the verification link.</h2>
      {/if}
      <Footer/>
  </div>
</main>