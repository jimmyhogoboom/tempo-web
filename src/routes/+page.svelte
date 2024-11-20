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

  let currentEntry: Maybe<OpenTimeEntry>;
  $: currentEntry = entries.findOpenEntry();

  $: open = false;
  let selectedEntry: TimeEntry | undefined;
  $: selectedEntry = undefined;

  $: savedTitle = '';

  $: timeEnd = endOfWeekWithOptions({ weekStartsOn: 0 }, new Date());
  $: timeStart = startOfWeekWithOptions({ weekStartsOn: 0 }, new Date());

  // TODO: replace this filter with a new store so we don't have to "load" the entire list of entires.
  $: entriesPage = $entries.filter(
    (entry: TimeEntry) => isAfter(timeStart, entry.createdAt) && isBefore(timeEnd, entry.createdAt)
  );

  $: currentTime = formatEntryDuration($time, unwrapMaybeOr(undefined, currentEntry));

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
  $: week =
    entriesPage?.reduce((dict, entry) => {
      const day = getDay(entry.createdAt);
      return {
        ...dict,
        [day]: [...(dict[day] || []), entry],
      };
    }, {} as WeekDictionary) || {};
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
          <img
            class="github"
            src="data:image/svg+xml,%3csvg%20width='98'%20height='96'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M48.854%200C21.839%200%200%2022%200%2049.217c0%2021.756%2013.993%2040.172%2033.405%2046.69%202.427.49%203.316-1.059%203.316-2.362%200-1.141-.08-5.052-.08-9.127-13.59%202.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015%204.934.326%207.523%205.052%207.523%205.052%204.367%207.496%2011.404%205.378%2014.235%204.074.404-3.178%201.699-5.378%203.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283%200-5.378%201.94-9.778%205.014-13.2-.485-1.222-2.184-6.275.486-13.038%200%200%204.125-1.304%2013.426%205.052a46.97%2046.97%200%200%201%2012.214-1.63c4.125%200%208.33.571%2012.213%201.63%209.302-6.356%2013.427-5.052%2013.427-5.052%202.67%206.763.97%2011.816.485%2013.038%203.155%203.422%205.015%207.822%205.015%2013.2%200%2018.905-11.404%2023.06-22.324%2024.283%201.78%201.548%203.316%204.481%203.316%209.126%200%206.6-.08%2011.897-.08%2013.526%200%201.304.89%202.853%203.316%202.364%2019.412-6.52%2033.405-24.935%2033.405-46.691C97.707%2022%2075.788%200%2048.854%200z'%20fill='%2324292f'/%3e%3c/svg%3e"
            alt="Github Logo"
          />
        </a>
      </div>
    </div>
  </footer>
  <Modals>
    <div
      slot="backdrop"
      class="backdrop"
      on:click={closeModal}
      on:keyup={(e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      }}
      role="button"
      aria-label="Close Modal"
      tabindex="0"
    />
  </Modals>
</div>

<style lang="scss">
  @use '../styles/colors';
  @use '../styles/variables';

  .prompt {
    font-family: sans-serif;
    font-size: 1.1rem;
    width: 100%;
    text-align: center;
    margin-top: 3rem;
  }

  .head-wrapper {
    position: sticky;
    top: 0;
    width: 100%;
    box-shadow: 0px -5px 5px 5px black;
    z-index: 10;
  }

  .list-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    margin-top: 1rem;
    margin-bottom: 2rem;
    max-width: 800px;
    z-index: 1;

    .list-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .popout {
        transition: height 0.5s;
        overflow: hidden;
        height: 0;

        &.open {
          height: 15rem;

          @media screen and (max-width: variables.$small) {
            height: 19rem;
          }
        }
      }
    }
  }

  ul {
    max-width: 800px;
    margin: 0 auto;
  }

  .full {
    position: relative;
    margin: 0 auto;
    height: 100%;
    overflow: auto;
  }

  .background-dark {
    background-color: colors.$background-dark;
    color: colors.$text-dim;
  }

  .wrapper {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  header,
  footer {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .page-body {
    flex-grow: 1;
  }

  footer {
    padding: 4rem 0;
    background: darken(colors.$surface-100, 10);
    color: inherit;
    font-family: sans-serif;

    & .footer-wrapper {
      display: flex;
      justify-content: space-between;
      align-content: center;
      margin: 0 auto;
      max-width: 800px;

      @media screen and (max-width: variables.$small) {
        padding: 2rem;
      }
    }
  }

  a {
    color: inherit;
    text-underline-offset: 0.1rem;

    &:hover,
    &:hover:visited {
      color: colors.$text;
    }

    &:visited {
      color: colors.$surface-400;
    }
  }

  .github {
    max-width: 3rem;
    filter: brightness(0) saturate(100%) contrast(50%);
  }

  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  .day-separator {
    display: flex;
    justify-content: center;

    & .day {
      text-align: center;
      padding: 1rem;
    }
  }
</style>
