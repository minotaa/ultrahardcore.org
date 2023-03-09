<script lang="ts">
  import "../app.css";
  import Navbar from "../components/Navbar.svelte";
  import Footer from "../components/Footer.svelte";
  import { onMount } from "svelte";
</script>

<div class="container pl-6">
  <h1 class="pt-4 font-bold text-2xl dark:text-white">Upcoming matches</h1>
  <h2 class="pt-2 text-xl dark:text-gray-200">No matches yet, maybe try <a class="text-sky-500 hover:underline" href="/host">creating a match?</a></h2>
  <Footer/>
</div>