<script lang="ts">
  import "../app.css";
  import Navbar from "../components/Navbar.svelte";
  import { writable } from "svelte/store";
  import Footer from "../components/Footer.svelte";
</script>

<h1 class="pt-8 text-center font-bold text-2xl dark:text-white">Upcoming matches</h1>
<h2 class="pt-2 text-center text-xl dark:text-gray-200">No matches yet, maybe try <a class="text-sky-500 hover:underline" href="/host">creating a match?</a></h2>
<div class="text-center">
  <Footer/>
</div>