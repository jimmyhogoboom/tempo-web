<script lang="ts">
  import {
    endOfWeekWithOptions,
    startOfWeekWithOptions,
    isAfter,
    isBefore,
    addWeeks,
    format,
    getDay,
    setDay,
  } from 'date-fns/fp';
  import Maybe, { just, nothing, unwrapOr as unwrapMaybeOr } from 'true-myth/maybe';
  import { entries, time } from '$stores/stores';
  import { formatEntryDuration } from '$lib/utils/entryUtils';
  import Timer from '$components/Timer.svelte';
  import EntryListItem from '$components/EntryListItem.svelte';
  import EntryEdit from '$components/EntryEdit.svelte';
  import Copyleft from '$components/Copyleft.svelte';
  import TimePager from '$components/TimePager.svelte';
  import { Modals, closeModal } from 'svelte-modals';
  import github from '$lib/assets/github.svg';
  import '../styles/global.scss';

  let currentEntry = $state(entries.findOpenEntry());

  let open = $state(false);
  let selectedEntry: TimeEntry | undefined = $state(undefined);

  let timeEnd = $state(endOfWeekWithOptions({ weekStartsOn: 0 }, new Date()));
  let timeStart = $state(startOfWeekWithOptions({ weekStartsOn: 0 }, new Date()));

  // TODO: replace this filter with a new store so we don't have to "load" the entire list of entires.
  const entriesPage = $derived(
    $entries.filter((entry: TimeEntry) => isAfter(timeStart, entry.createdAt) && isBefore(timeEnd, entry.createdAt))
  );

  const currentTime = $derived(formatEntryDuration($time, unwrapMaybeOr(undefined, currentEntry)));

  let savedTitle = '';

  const changePage = (weeksNumber: number) => {
    timeEnd = addWeeks(weeksNumber, timeEnd);
    timeStart = addWeeks(weeksNumber, timeStart);
  };

  const handlePrevClick = () => {
    changePage(-1);
  };
  const handleNextClick = () => {
    changePage(1);
  };

  const addEntry = (entry: NewTimeEntry) => {
    const result = entries.add(entry);

    if (result.isErr) {
      console.error(result.error);
      return;
    }

    currentEntry = just(result.value);
  };

  const updateEntry = (entry: TimeEntryUpdate) => {
    const result = entries.update(entry);

    if (result.isErr) {
      console.error(result.error);

      return;
    }

    if (currentEntry.isJust && result.value.id === currentEntry.value.id) {
      currentEntry = just(result.value);
    }
  };

  const handleStartClick = () => {
    addEntry({
      title: savedTitle,
      startTime: new Date(),
    });

    // Must be cleared to avoid polluting next entry
    savedTitle = '';
  };

  const handleStopClick = () => {
    if (currentEntry.isJust) {
      // TODO: there should be a domain function like `closeTask` to set the endTime
      updateEntry({ ...currentEntry.value, endTime: new Date() });
      currentEntry = nothing();
    }
  };

  const handleTitleChange = (entry: Maybe<TimeEntry>) => (text: string) => {
    if (entry.isNothing) {
      savedTitle = text;
    } else {
      updateEntry({ ...entry.value, title: text });
    }
  };

  const handleChange = (entry?: TimeEntry) => (updatedEntry?: TimeEntryUpdate) => {
    if (!entry) {
      savedTitle = updatedEntry?.title || '';
    } else {
      updateEntry({ ...entry, ...updatedEntry });
    }

    if (selectedEntry) selectedEntry = undefined;
  };

  const handleEntryClick = (entry: TimeEntry) => () => {
    if (open && entry.id === selectedEntry?.id) {
      open = false;
      selectedEntry = undefined;
    } else {
      open = true;
      selectedEntry = entry;
    }
  };

  const handleCopyClick = (entry?: TimeEntry) => () => {
    if (!entry) return;

    addEntry({
      ...entry,
      startTime: undefined,
      endTime: undefined,
    });

    // TODO: Set the new entry as the currentEntry
  };

  const handleDeleteClick = (entry?: TimeEntry) => () => {
    if (entry && confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      if (currentEntry.isJust && currentEntry.value.id === entry.id) {
        currentEntry = nothing();
      }

      entries.delete(entry.id);
      selectedEntry = undefined;
      open = false;
    }
  };

  type DayOfWeek = number;
  type WeekDictionary = Record<DayOfWeek, TimeEntry[]>;
  let week = $derived(
    entriesPage?.reduce((dict, entry) => {
      const day = getDay(entry.createdAt);
      return {
        ...dict,
        [day]: [...(dict[day] || []), entry],
      };
    }, {} as WeekDictionary) || {}
  );
</script>

<svelte:head>
  <title>{currentEntry.isJust ? currentTime : 'Tempo'}</title>
</svelte:head>
<div class="full background-dark wrapper">
  <header class="head-wrapper">
    <div class="timer">
      <Timer
        entry={unwrapMaybeOr(undefined, currentEntry)}
        onStart={handleStartClick}
        onStop={handleStopClick}
        onTitleChange={handleTitleChange(currentEntry)}
      />
    </div>
  </header>

  <div class="page-body">
    <div class="list-wrapper {open && 'open'}">
      <div class="list-container">
        <TimePager
          entries={entriesPage}
          startDate={timeStart}
          endDate={timeEnd}
          onNextClick={handleNextClick}
          onPrevClick={handlePrevClick}
        />
        <ul>
          {#if entriesPage.length < 1}
            <div class="prompt">Hit the start button to start a new entry</div>
          {/if}
          {#each Object.keys(week).map(Number) as dayOfWeek}
            <div class="day-separator">
              <div class="day">{format('EEE', setDay(dayOfWeek, new Date()))}</div>
            </div>
            {#each week[dayOfWeek] as entry}
              {@const isSelected = selectedEntry?.id === entry.id}
              <EntryListItem {entry} onClick={handleEntryClick(entry)} selected={isSelected} />
              <div class="popout {isSelected && 'open'}">
                <EntryEdit
                  {entry}
                  onCancelClick={handleEntryClick(entry)}
                  onCopyClick={handleCopyClick(entry)}
                  onDeleteClick={handleDeleteClick(entry)}
                  onChange={handleChange(entry)}
                />
              </div>
            {/each}
          {/each}
        </ul>
      </div>
    </div>
  </div>

  <footer>
    <div class="footer-wrapper">
      <div>
        <Copyleft />
        <a href="https://hogoboom.dev" target="_blank">Jimmy Hogoboom</a>
      </div>
      <div>
        <a href="https://github.com/jimmyhogoboom/tempo-web" target="_blank">
          <img class="github" src={github} alt="Github Logo" />
        </a>
      </div>
    </div>
  </footer>
  <Modals>
    {#snippet backdrop()}
      <div
        class="backdrop"
        onclick={closeModal}
        onkeyup={(e) => {
          if (e.key === 'Escape') {
            closeModal();
          }
        }}
        role="button"
        aria-label="Close Modal"
        tabindex="0"
      ></div>
    {/snippet}
  </Modals>
</div>

<style lang="scss">
  .github {
    max-width: 3rem;
    filter: brightness(0) saturate(100%) contrast(50%);
  }
</style>
