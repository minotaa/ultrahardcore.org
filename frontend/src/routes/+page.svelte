<script lang="ts">
  import "../app.css";
  import Navbar from "../components/Navbar.svelte";
  import { writable } from "svelte/store";
    import Footer from "../components/Footer.svelte";
</script>

<main class="pt-4 pl-4">
  <Navbar/>
  <h1 class="pt-8 text-center font-bold text-2xl">Upcoming matches</h1>
  <Footer/>
</main>