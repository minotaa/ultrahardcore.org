<script lang="ts">
  import moment from "moment"
  import { readable } from "svelte/store";
  import calendarize from 'calendarize'
  import Footer from "../../components/Footer.svelte";
  import { ArrowUpRight, Key, Milestone, PlusCircle, X } from "lucide-svelte";
  import { onMount } from "svelte";
  import { token } from "../../hooks/auth";
  import { goto } from "$app/navigation";
  import { toast } from "@zerodevx/svelte-toast";

  function toNearest15Minutes(date: Date) {
    const start = moment(date)
    let remainder: number
    const elapse = start.minute() % 15
    if (elapse === 0) {
      return moment(date)
    } else {
      remainder = 15 - elapse
      return moment(start).add(remainder, "minutes")
    }
  }

  const nearest = readable(toNearest15Minutes(new Date()), set => {
    set(toNearest15Minutes(new Date()));
    const interval = setInterval(() => {
		  set(toNearest15Minutes(new Date()));
	  }, 500);
	  return () => clearInterval(interval);
  })

  let desiredTime = $nearest
    .add('minutes', 30)
    .set('seconds', 0)
    .set('milliseconds', 0)

  let hours = [
    "00", 
    "01", 
    "02", 
    "03", 
    "04", 
    "05", 
    "06", 
    "07", 
    "08", 
    "09", 
    "10", 
    "11", 
    "12", 
    "13", 
    "14", 
    "15", 
    "16", 
    "17", 
    "18", 
    "19", 
    "20",
    "21", 
    "22", 
    "23"
  ]
  let minutes = [
    "00",
    "15",
    "30",
    "45"
  ]

  function setHour(hours: string) {
    desiredTime.hours(parseInt(hours))
    desiredTime = desiredTime
    checkConflicts()
  }

  function setMinute(minute: string) {
    desiredTime.minutes(parseInt(minute))
    desiredTime = desiredTime
    checkConflicts()
  }

  function setDate(day: number) {
    desiredTime.set({ 'month': tm.month(), 'date': day })
    desiredTime = desiredTime
    checkConflicts()
  }

  function setDateNextMonth(month: number, day: number) {
    desiredTime.set({ 'month': month, 'date': day })
    desiredTime = desiredTime
    checkConflicts()
  }

  function checkConflicts() {
    errors = []
    if (desiredTime.isBefore(moment())) { 
      errors.push("Your time must be 30 minutes in advance.")
      return
    }
    if (desiredTime.diff(moment()) < 1800000) { 
      errors.push("Your time must be 30 minutes in advance.")
      return
    }
  }

  interface Server {
    name: string,
    ip: string,
    address: string,
    location: string, 
    region: string,
    members: object[],
    createdAt: Date,
    owner: string,
    id: string,
    invited: string[],
    verified: boolean,
    extraServers: object[],
    discordUrl: string,
    twitterUrl: string,
    scenarioDescriptions: string,
    websiteUrl: string,
    extraLinks: object[],
    customizableRules: object[],
    configOptions: any[],
    optionalConfiguration: boolean
  }

  let errors: string[] = []
  checkConflicts()
  let thisMonth = calendarize(moment().toDate())
  let thisMonthLabel = moment().format("MMMM YYYY")
  let nextMonth = calendarize(moment().add(1, 'months').toDate())
  let nm = moment().add(1, 'months')
  let tm = moment()
  let shown = false
  let nextMonthLabel = moment().add(1, 'months').format("MMMM YYYY")

  let displayName = ''
  let hostCount: number
  let pvpEnabledIn: number = 20
  let finalHealOccurs: number = 10
  let meetupOccursAt: number = 60 
  let customizableRules: object[] = []
  let borderSize: number = 2000
  let scenarios: string[] = ['Vanilla+']
  let serverSelected: Server
  let extras: any = {}
  let selectedServerIp: string
  let selectedServerId: string
  let teamSize: number
  let teamsStyle: string
  let slots: number = 80
  let version: string = "1.8"
  let error: string[]
  let showServerConfig: boolean = false

  async function postMatch(e: Event) {
    let response = await fetch("http://localhost:9000/matches/post", {
      method: 'POST',
      headers: {
        'Authorization': $token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'opensAt': desiredTime.toDate(),
        'createdBy': user.mId,
        'displayName': displayName,
        'hostCount': hostCount,
        'pvpEnabledIn': pvpEnabledIn,
        'finalHealOccurs': finalHealOccurs,
        'meetupOccursAt': meetupOccursAt,
        'extraRules': customizableRules,
        'extraConfig': extras,
        'mapSize': borderSize,
        'server': selectedServerId,
        'scenarios': scenarios,
        'serverIp': selectedServerIp,
        'teamStyle': teamsStyle,
        'teamSize': teamSize || 1,
        'slots': slots,
        'version': version,
        'hostHidConfig': !showServerConfig
      })
    })
    let payload = await response.json()
    if (!payload.success) {
      error = payload.errors
      toast.push("An error occurred while posting your match...")
    } else {
      toast.push("Successfully posted your match!")
    }
  }

  function removeScenario(index: number) {
    scenarios.splice(index, 1)
    if (scenarios.length == 0) {
      scenarios.push("Vanilla+")
    }
    scenarios = scenarios
  }

  function addScenario() {
    scenarios.push("") 
    if (scenarios.includes("Vanilla+")) {
      scenarios.splice(scenarios.indexOf("Vanilla+"), 1)
    }
    scenarios = scenarios
  }

  function handleScenKeyPress(e: KeyboardEvent) {
    if (e.key == "Enter") {
      addScenario()
    }
  }

  let user: any
  let servers: Server[]
  let loadedYet: boolean
  onMount(async () => {
    loadedYet = false
    let response = await fetch(`http://localhost:9000/account/get`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    let payload = await response.json()
    if (payload.success) {
      user = payload.user
    } else {
      token.set(undefined)
      user = null
    }
    response = await fetch(`http://localhost:9000/account/servers`, {
      method: 'GET', // @ts-ignore
      headers: {
        'Authorization': $token
      }
    })
    payload = await response.json()
    if (payload.success) {
      servers = payload.servers
    } else {
      goto('/')
      toast.push("No servers to post on.")
    }
    loadedYet = true
  })

  let versions = [
    "1.21",
    "1.20",
    "1.19",
    "1.18",
    "1.17",
    "1.16",
    "1.14",
    "1.13",
    "1.12",
    "1.11",
    "1.10",
    "1.9",
    "1.8",
    "1.7",
    "1.6",
    "1.5",
    "1.4",
    "1.3",
    "1.2"
  ]

  let styles = [
    "FFA",
    "Chosen",
    "Random",
    "Captains",
    "Picked",
    "Auction",
    "Mystery",
    "RvB",
    "Rigged",
    "Wished"
  ]

  function selectServer(id: string) {
    for (const server of servers) {
      if (server.id == id) {
        serverSelected = server
        selectedServerIp = server.ip
        Object.keys(server.configOptions).forEach((key: any) => {
          if (server.configOptions[key] == "bool") {
            extras[key] = false
          } else if (server.configOptions[key] == "percent") {
            extras[key] = 0
          } else if (server.configOptions[key] == "number") {
            extras[key] = 0
          }
        })
        Object.keys(server.customizableRules).forEach((key: any) => {
          customizableRules.push({
            status: false,
            note: "",
            rule: server.customizableRules[key]
          })
        })
      }
    }
  }
</script>

<div class="container pl-8">
  <h1 class="pt-6 font-bold text-3xl dark:text-white">Create Match</h1>
  {#if serverSelected != null}  
    <h2 class="font-bold text-2xl dark:text-white mt-6">Opening time</h2>
    <h2 class="text-xl dark:text-white mb-4">Opening at: <strong>{desiredTime.format("MMM Do, HH:mm")}, {desiredTime.fromNow()}</strong></h2>
    <div class="flex flex-col gap-3">
      {#if errors.length > 0}
        <h2 class="text-center mt-2 text-md bg-red-100 dark:text-white dark:bg-red-500 shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4"><strong>Error:</strong> {errors.join(', ')}</h2>
      {/if}
      <div class="flex flex-row gap-6 ">
        <div class="flex flex-col rounded dark:border-slate-600 bg-slate-200 dark:bg-slate-800 border-2 w-fit">
          <h1 class="text-lg dark:text-white text-center font-bold p-2">{thisMonthLabel}</h1>
          {#each thisMonth as week}
            <div class="flex flex-row">
              {#each week as day}
                {#if day == 0}
                  <button class="outline-none p-2 w-12 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">&nbsp;</button> 
                {:else}
                  {#if desiredTime.month() == tm.month() && desiredTime.date() == day}
                    <button class="p-2 w-12 bg-zinc-900 h-12 dark:text-white border-slate-200 dark:border-slate-700">{day}</button> 
                  {:else}
                    <button on:click={() => { setDate(day) }} class="p-2 w-12 hover:bg-zinc-900 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">{day}</button> 
                  {/if}
                {/if}
              {/each}
            </div>
          {/each}
        </div>
        <div class="flex flex-col rounded dark:border-slate-600 bg-slate-200 dark:bg-slate-800 border-2 w-fit">
          <h1 class="text-lg dark:text-white text-center font-bold p-2">{nextMonthLabel}</h1>
          {#each nextMonth as week}
            <div class="flex flex-row">
              {#each week as day}
                {#if day == 0}
                  <button class="outline-none p-2 w-12 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">&nbsp;</button> 
                {:else}
                  {#if desiredTime.month() == nm.month() && desiredTime.date() == day}
                    <button class="p-2 w-12 bg-zinc-900 h-12 dark:text-white border-slate-200 dark:border-slate-700">{day}</button> 
                  {:else}
                    <button on:click={() => { setDateNextMonth(nm.month(), day) }} class="p-2 w-12 hover:bg-zinc-900 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">{day}</button> 
                  {/if}
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>
      <div class="flex-row gap-4">
        <h3 on:click={() => { shown = !shown }} class="border-2 border-slate-50 select-none border-slate-200 dark:border-slate-700 text-xl dark:text-white pt-2 pb-2 pl-8 pr-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-center w-fit mt-2">{desiredTime.format("HH:mm")}</h3>
        {#if shown}
        <div class="gap-2 border-slate-200 flex-row flex mt-2 border-2 bg-slate-100 dark:bg-slate-800 select-none dark:border-slate-700 rounded-lg pt-2 pb-2 pl-4 pr-4 w-fit text-md dark:text-white">
            <div class="overflow-x-hidden overflow-y-auto h-[128px] mr-2 pr-4">
              <ul>
                {#each hours as hour} <!-- I don't know why, but I just can't make these elements active. sad -->
                  {#if (desiredTime.format("HH") === hour)}
                    <li><button class:active={(desiredTime.format("HH") === hour)} on:click={() => {setHour(hour)}} class="font-bold dark:bg-slate-900 bg-slate-200 active:font-bold dark:active:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xl pl-2 pr-2">{hour}</button></li>
                  {:else}
                    <li><button class:active={(desiredTime.format("HH") === hour)} on:click={() => {setHour(hour)}} class="active:font-bold dark:active:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xl pl-2 pr-2">{hour}</button></li>
                  {/if}
                {/each}
              </ul>
            </div>
            <div class="overflow-x-hidden overflow-y-auto h-[30] mr-2 pr-6">
              <ul>
                {#each minutes as minute} <!-- I don't know why, but I just can't make these elements active. sad -->
                  {#if (desiredTime.format("mm") === minute)}
                    <li><button class:active={(desiredTime.format("mm") === minute)} on:click={() => {setMinute(minute)}} class="font-bold dark:bg-slate-900 bg-slate-200 active:font-bold dark:active:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xl pl-2 pr-2">{minute}</button></li>
                  {:else}
                    <li><button class:active={(desiredTime.format("mm") === minute)} on:click={() => {setMinute(minute)}} class="active:font-bold dark:active:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xl pl-2 pr-2">{minute}</button></li>
                  {/if}
                {/each}
              </ul>
            </div>
          </div>
        {/if}
      </div>
    </div>
    <form on:submit={postMatch}>
      <hr class="border-0 dark:bg-zinc-800 mt-6 mb-4 bg-slate-100 mb-2 h-px"/>
      <h2 class="font-bold text-2xl dark:text-white mt-4">Game Details</h2>
      <h2 class="text-xl dark:text-white mb-4">Edit information about the game</h2>

      {#if serverSelected.optionalConfiguration}
        <div class="flex flex-row">
          <input bind:checked={showServerConfig} class="inline" type="checkbox" name="optionalConfiguration" id="optionalConfiguration"> <label class="dark:text-white mt-2 mb-1 ml-2 inline" for="optionalConfiguration">Show server configuration options</label>
        </div>
      {/if}

      <h3 class="text-lg dark:text-white mt-6 mb-2 font-bold">General Information</h3>
      <div class="flex flex-col gap-4">
        <h2 class="text-lg dark:text-white">Host Information</h2>
        <div class="flex flex-row gap-4">
          <input required bind:value={displayName} placeholder="display name" class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-8 w-96" type="username" name="username" id="username"/>
          <input required bind:value={hostCount} placeholder="game count" class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="hostCount" id="hostCount"/>
        </div>
        <h2 class="text-lg dark:text-white">Server Information</h2>
        <div class="flex flex-row gap-4">
          <input required bind:value={slots} placeholder="slots" class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-20" type="number" name="hostCount" id="hostCount"/>
          <select bind:value={version} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-96 pl-2">
            <option value={null} class="dark:text-white" disabled selected>Select a server version</option>
            {#each versions as ver}
              <option value={ver} class="dark:text-white">{ver}</option>
            {/each}
          </select>
        </div>
        <h2 class="text-lg dark:text-white">Teams</h2>
        <div class="flex flex-row gap-4">
          <select bind:value={teamsStyle} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-96 pl-2">
            <option value={null} class="dark:text-white" disabled selected>Select a team style</option>
            {#each styles as style}
              <option value={style.toLowerCase()} class="dark:text-white">{style}</option>
            {/each}
          </select>
          {#if teamsStyle != null && teamsStyle.toLowerCase() != "ffa"}
            <input required bind:value={teamSize} placeholder="team size" class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="hostCount" id="hostCount"/>
          {/if}
        </div>
      </div>

      {#if serverSelected.extraServers && serverSelected.extraServers.length > 0}
        <h3 class="text-lg dark:text-white mt-6 mb-2 font-bold">Select server</h3>
        <select bind:value={selectedServerIp} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-96 pl-2">
          <option value={serverSelected.ip} class="dark:text-white" selected>Hub ({serverSelected.ip})</option>
          {#each serverSelected.extraServers as extra}
            <option value={extra.ip} class="dark:text-white">{extra.name} ({extra.ip})</option>
          {/each}
        </select>
      {/if}
      <h3 class="text-lg dark:text-white mt-8 font-bold">Event Timers</h3>
      <div class="flex flex-col gap-2">
        <label for="finalHealOccursIn" class="dark:text-white mt-2">Final Heal occurs in (min.)</label>
        <input required bind:value={finalHealOccurs} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="finalHealOccursIn" id="finalHealOccursIn"/>
        <label for="pvpEnabledIn" class="dark:text-white mt-2">PvP enabled in (min.)</label>
        <input required bind:value={pvpEnabledIn} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="pvpEnabledIn" id="pvpEnabledIn"/>
        <label for="meetupOccursAt" class="dark:text-white mt-2">Meetup occurs in (min.)</label>
        <input required bind:value={meetupOccursAt} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="meetupOccursAt" id="meetupOccursAt"/>
      </div>

      {#if !(serverSelected.optionalConfiguration && showServerConfig == false)}
        {#if serverSelected.customizableRules.length > 0}
          <h3 class="text-lg dark:text-white mt-6 mb-2 font-bold">Game Rules</h3>
          <div class="flex flex-col gap-2">
            {#each customizableRules as rule}
              <div class="flex flex-row gap-2">
                <label class="mt-2 dark:text-white">{rule.rule.name}</label>
                <select bind:value={rule.status} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-40 pl-2">
                  <option value={false} class="dark:text-white" selected>Not allowed</option>
                  <option value={true} class="dark:text-white" selected>Allowed</option>
                </select>
                {#if rule.rule.allowHostsToType == true}
                  <input bind:value={rule.note} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-60" type="text" name="extraNote" id="extraNote"/>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      {/if}
      <h3 class="text-lg dark:text-white mt-6 mb-2 font-bold">Game Configuration</h3>
      <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-2">
          <label for="meetupOccursAt" class="mt-2 dark:text-white">Map size (diameter)</label>
          <input required bind:value={borderSize} placeholder="game count" class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="borderSize" id="borderSize"/>
        </div>
        {#if !(serverSelected.optionalConfiguration && showServerConfig == false)}
          {#each serverSelected.configOptions as extra} 
            <div class="flex flex-row gap-2">
              {#if extra.type == "bool"}
                <label class="mt-2 dark:text-white">{extra.name}</label>
                <select bind:value={extras[extra.name]} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-40 pl-2">
                  <option value={false} class="dark:text-white" selected>Disabled</option>
                  <option value={true} class="dark:text-white" selected>Enabled</option>
                </select>
              {:else if extra.type == "number"}
                <label class="mt-2 dark:text-white">{extra.name}</label>
                <input required bind:value={extras[extra.name]} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="finalHealOccursIn" id="finalHealOccursIn"/>
              {:else if extra.type == "percent"}
                <label class="mt-2 dark:text-white">{extra.name}</label>
                <input required bind:value={extras[extra.name]} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="number" name="finalHealOccursIn" id="finalHealOccursIn" min="0" max="100"/>
              {:else if extra.type == "text"}
                <label class="mt-2 dark:text-white">{extra.name}</label>
                <input required bind:value={extras[extra.name]} class="dark:text-white shadow dark:bg-slate-700 bg-slate-100 gap-2 rounded-lg pt-2 pb-2 pl-2 pr-2 w-40" type="text" name="finalHealOccursIn" id="finalHealOccursIn"/>
                
              {/if}
            </div>
          {/each}
        {/if}
        <label for="scenariosLabel" class="mt-2 dark:text-white text-lg font-bold">Scenarios</label>
        <ul>
          {#each scenarios as scenario, index} 
            <li>
              <div class="pt-1 pr-2 pb-1 flex flex-row gap-4 w-auto hideable rounded-lg">
                <input on:keydown={handleScenKeyPress} bind:value={scenarios[index]} class="w-1/4 shadow dark:text-white dark:bg-slate-700 bg-slate-100 rounded-lg pt-2 pb-2 pl-2 w-60" placeholder="scenario" type="text" name="scenario" id="scenario" required/>
                <button on:click={() => { removeScenario(index) }} class="hidden hoverHidden inline text-gray-100"><X class="inline"/></button>
              </div>
            </li>
          {/each}
          <button on:click={addScenario} class="w-fit mt-2 inline bg-green-400 dark:bg-green-500 text-md text-white pl-2 pr-2 pt-1 pb-1 rounded-lg"><PlusCircle class="mb-1 inline"/> Add Scenarios</button>
        </ul>
      </div>
      <h2 class="font-bold text-2xl dark:text-white mt-4">Matchpost Conflicts</h2>
      {#if error != null}
          <h2 class="text-center text-md bg-red-100 dark:bg-red-500 shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4"><strong>Errors:</strong> {error.join(', ')}</h2>
      {/if}
      <button type="submit" class="w-fit inline bg-green-400 dark:bg-green-500 text-md text-white mt-6 pl-2 pr-2 pt-1 pb-1 rounded-lg"><Milestone class="mb-1 inline"/> Create Match</button>
    </form>
  {:else}
    {#if loadedYet == true}
      <h2 class="text-xl mb-2 dark:text-white mt-4">Select server to host from</h2>
      <div class="flex flex-col">
        <select bind:value={selectedServerId} required name="serverRegion" id="serverRegion" class="dark:text-white dark:text-white shadow dark:bg-slate-700 rounded-lg bg-slate-100 pt-2 pb-2 w-96 pl-2">
          <option value="none" class="dark:text-white" disabled selected>Select a server</option>
          {#each servers as server}
            {#if server.verified == true}
              <option value={server.id} class="dark:text-white">{server.name}</option>
            {:else}
              <option value={server.id} class="dark:text-white" disabled>{server.name}</option>
            {/if}
          {/each}
        </select>
        <button on:click={() => {
          selectServer(selectedServerId)
        }} type="submit" class="dark:bg-green-600 bg-green-400 text-white pt-1 pb-1 pr-2 pl-1 mt-2 rounded-lg font-bold w-fit"><ArrowUpRight class="inline mb-1"/> Create post</button>
      </div>
    {:else}
      <h2 class="text-lg mb-2 dark:text-white mt-4">Fetching server data...</h2>
    {/if}
  {/if}
  <Footer/>
</div>