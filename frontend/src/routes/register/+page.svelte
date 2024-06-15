<script lang="ts">
  import "../../app.css"
  import { UserPlus } from 'lucide-svelte'
  import Navbar from "../../components/Navbar.svelte"
  import Footer from "../../components/Footer.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { token } from "../../hooks/auth";
  import { toast } from "@zerodevx/svelte-toast"
    import { BACKEND_URI } from "$env/static/private";

  let email: string 
  let username: string
  let confirmEmail: string
  let confirmPassword: string
  let password: string
  let error: string[]
  let success: boolean = false
  async function handleSubmit(e: Event) {
    e.preventDefault()
    const res = await fetch(`${BACKEND_URI}/account/register`, {
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
    const response = await fetch(`${BACKEND_URI}/account/get`, {
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
      toast.push("You're already logged in!")
      setTimeout(() => {
        goto('/')
      }, 500)
    }
  })
</script>

<div class="flex flex-col gap-6 justify-center items-center mt-16">
  <h1 class="text-2xl font-bold dark:text-white">Register for <a href="/" class="hover:underline">ultrahardcore.org</a></h1>
    {#if success == false} 
      {#if error != null}
        <h2 class="text-center text-md dark:bg-red-500 bg-red-100 shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4"><strong>Errors:</strong> {error.join(', ')}</h2>
      {/if}
      <form on:submit={handleSubmit}>
        <div class="flex flex-col gap-2 justify-center">
          <label for="username" class="dark:text-white font-bold">Username:</label>
          <input required bind:value={username} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="name" name="username" id="username"/>
          <label for="email" class="dark:text-white font-bold">Email:</label>
          <input required bind:value={email} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="email" name="email" id="email"/>
          <label for="confirmEmail" class="dark:text-white font-bold">Confirm Email:</label>
          <input required bind:value={confirmEmail} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="email" name="confirmEmail" id="confirmEmail"/>
          <label for="password" class="dark:text-white font-bold">Password:</label>
          <input required bind:value={password} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="password" name="password" id="password"/>
          <label for="confirmPassword" class="dark:text-white font-bold">Confirm Password:</label>
          <input required bind:value={confirmPassword} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="password" name="confirmPassword" id="confirmPassword"/>
          <button type="submit" class="dark:bg-green-600 bg-green-400 text-white pt-2 pb-2 mt-2 rounded-lg font-bold"><UserPlus class="inline mb-1"/> Register</button>
        </div>
      </form>
    {:else}
      <h2 class="dark:bg-slate-200 text-center text-md shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4">Check your email for the verification link.</h2>
    {/if}
    <Footer/>
</div>