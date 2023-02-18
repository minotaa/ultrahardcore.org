<script lang="ts">
  import "../app.css";
  import Navbar from "../components/Navbar.svelte";
	import { onMount } from 'svelte';
	import type { SvelteToast } from '@zerodevx/svelte-toast';
	let toast: typeof SvelteToast;
	onMount(() => {
		import('@zerodevx/svelte-toast').then(({ SvelteToast: component }) => (toast = component));
	});
</script>

<main class="pt-4 pl-4">
  {#if toast}
	  <svelte:component this={toast} />
  {/if}
  <Navbar/>
  <slot></slot>
</main>