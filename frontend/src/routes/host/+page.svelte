<script lang="ts">
  import moment from "moment"
  import { readable } from "svelte/store";
  import calendarize from 'calendarize'

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

  function setDate(day: string) {
    desiredTime.date(parseInt(day))
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

  let errors: string[] = []
  checkConflicts()
  let thisMonth = calendarize(moment().toDate())
  let thisMonthLabel = moment().format("MMMM YYYY")
  let nextMonth = calendarize(moment().add(1, 'months').toDate())
  let nm = moment().add(1, 'months')
  let nextMonthLabel = moment().add(1, 'months').format("MMMM YYYY")
</script>

<div class="container pl-8">
  <h1 class="pt-6 font-bold text-2xl dark:text-white">Create Match</h1>
  <h2 class="font-bold text-xl dark:text-white">desired: {desiredTime.format("MMM Do, HH:mm")}</h2>
  <div class="flex flex-col justify-center">
    {#if errors.length > 0}
      <h2 class="text-center mt-2 text-md bg-red-100 dark:text-white dark:bg-red-500 shadow rounded-lg pt-2 pb-2 pr-8 pl-8 mb-4"><strong>Error:</strong> {errors.join(', ')}</h2>
    {/if}
    <div class="flex flex-row gap-6 justify-center">
      <div class="flex flex-col rounded dark:border-slate-600 bg-slate-200 dark:bg-slate-800 border-2 w-fit">
        <h1 class="text-lg dark:text-white text-center font-bold p-2">{thisMonthLabel}</h1>
        {#each thisMonth as week}
          <div class="flex flex-row">
            {#each week as day}
              {#if day == 0}
                <button class="p-2 w-12 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">&nbsp;</button> 
              {:else}
                <button class="p-2 w-12 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">{day}</button> 
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
                <button class="p-2 w-12 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">&nbsp;</button> 
              {:else}
                <button class="p-2 w-12 hover:bg-zinc-900 h-12 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">{day}</button> 
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>
    <div class="flex-row gap-4">
      <h3 class="border-2 border-slate-50 select-none border-slate-200 dark:border-slate-700 text-xl dark:text-white pt-2 pb-2 pl-8 pr-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-center w-fit mt-2">{desiredTime.format("HH:mm")}</h3>
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
    </div>
  </div>
</div>