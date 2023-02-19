<script lang="ts">
  import "../../app.css"
  import { LogIn } from 'lucide-svelte'
  import Navbar from "../../components/Navbar.svelte"
  import { browser } from "$app/environment";
  import { token } from "../../hooks/auth"
  import { goto } from "$app/navigation";
  import Footer from "../../components/Footer.svelte";
  import { onMount } from "svelte";
  import { toast } from '@zerodevx/svelte-toast'

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
      toast.push("You're already logged in!")
      goto('/')
    }
  })

  let email: string 
  let password: string
  let rememberMe: boolean
  let error: string[]
  async function handleSubmit(e: Event) {
    e.preventDefault()
    const res = await fetch(`http://localhost:9000/account/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rememberMe: rememberMe,
        password: password,
        username: email
      })
    })
    const payload = await res.json()
    if (!payload.success) {
      error = payload.errors 
      return
    }
    if (browser) {
      token.set(payload.session)
      goto('/')
      toast.push(`Successfully logged in!`)
    }
  }
</script>

<div class="flex flex-col gap-6 justify-center items-center mt-16">
  <h1 class="text-2xl dark:text-white font-bold">Login to <a href="/" class="hover:underline">ultrahardcore.org</a></h1>
    <form on:submit={handleSubmit}>
      {#if error != null}
        <h2 class="text-center text-md bg-red-100 dark:bg-red-500 shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4"><strong>Errors:</strong> {error.join(', ')}</h2>
      {/if}
      <div class="flex flex-col gap-2">
        <label for="email" class="dark:text-white font-bold">Username or Email:</label>
        <input required bind:value={email} class="dark:text-white shadow bg-slate-100 dark:bg-slate-700 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="text" name="email" id="email"/>
        <label for="password" class="dark:text-white font-bold">Password:</label>
        <input required bind:value={password} class="dark:text-white shadow bg-slate-100 dark:bg-slate-700 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="password" name="password" id="password">
        <div class="mt-2 text-center">
          <input bind:checked={rememberMe} type="checkbox" name="rememberMe" id="rememberMe">
          <label class="dark:text-white" for="rememberMe">Remember me?</label>
        </div>
        <button type="submit" class="dark:bg-green-600 bg-green-400 text-white pt-2 pb-2 mt-2 rounded-lg font-bold"><LogIn class="inline mb-1"/> Log in</button>
      </div>
      <Footer/>
    </form>
</div>