<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation';
  import { toast } from '@zerodevx/svelte-toast';
  import { onMount } from 'svelte';
  import { token } from '../../../hooks/auth';

  let server 

  onMount(async() => {
    let response = await fetch(`http://localhost:9000/server/get?server=${await $page.params.server}`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    let payload = await response.json()
    if (payload.success) {
      server = payload.server
    } else {
      goto('/')
      toast.push("Invalid server ID!")
    }
  })
</script>