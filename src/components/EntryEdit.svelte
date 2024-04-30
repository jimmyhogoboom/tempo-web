<script lang="ts">
  import { unwrapOr } from 'true-myth/maybe';
  import { isAfter } from 'date-fns/fp';
  import { dateFormat, parseTime } from '$lib/utils/dateUtils';
  import { formatEntryDuration } from '$lib/utils/entryUtils';
  import { asUUID } from '$lib/utils/uuid';
  import { time } from '$stores/stores';
  import Entries, { type TimeEntryUpdate } from '$lib/Entries';
  import ProjectSelect from './ProjectSelect.svelte';

  const { entryOpen } = Entries;

  export let onCancelClick: () => void;
  export let onCopyClick: () => void;
  export let onDeleteClick: () => void;
  export let onChange: (updatedEntry?: TimeEntryUpdate) => void;
  export let entry: TimeEntry | undefined;
  $: entry;

  type EntryForm = {
    startTime?: string;
    endTime?: string;
    totalTime?: string;
    title?: string;
    projectId?: string;
  };

  const entryToFormValues = (entry?: TimeEntry | TimeEntryUpdate) => ({
    startTime: entry && dateFormat(entry?.startTime || undefined),
    endTime: entry && dateFormat(entry?.endTime || undefined),
    title: entry ? entry.title : '',
    totalTime: entry && formatEntryDuration($time, entry),
    projectId: entry && (entry.projectId as string),
  });

  const timeToDate = (referenceDate: Date = new Date(), text?: string): Date | undefined => {
    if (referenceDate === null || !text) return undefined;

    const r = parseTime(referenceDate, text);

    return r.isOk ? r.value : undefined;
  };

  const formValuesToEntry = (form: EntryForm): TimeEntryUpdate | undefined =>
    entry && form
      ? {
          id: entry.id,
          startTime: timeToDate(entry.createdAt, form.startTime),
          endTime: timeToDate(
            entry.endTime && isAfter(entry.endTime, entry.startTime) ? entry.createdAt : entry.endTime,
            form.endTime
          ),
          title: form.title,
          projectId: form.projectId as UUID,
        }
      : undefined;

  const formEqualsEntry = (form: EntryForm, entry?: TimeEntry) => {
    const entryAsForm = entryToFormValues(entry);

    return (
      entryAsForm.startTime === form.startTime &&
      entryAsForm.endTime === form.endTime &&
      entryAsForm.totalTime === form.totalTime &&
      entryAsForm.title === form.title &&
      entryAsForm.projectId === form.projectId
    );
  };

  const validateForm = (form: EntryForm) => {
    const currentEntry = formValuesToEntry(form);
    const startValid = currentEntry?.startTime !== undefined;
    const endValid = !form?.endTime || currentEntry?.endTime !== undefined;

    return startValid && endValid;
  };

  $: formValues = entryToFormValues(entry);
  $: formDirty = formValues && entry && !formEqualsEntry(formValues, entry);
  $: formValid = validateForm(formValues);
  $: entryCanDelete = !entryOpen(entry);
  $: readOnly = true;

  const onLocalCancelClick = () => {
    formValues = entryToFormValues(entry);
    readOnly = true;
    onCancelClick();
  };

  const onSaveClick = () => {
    if (formValid && formDirty) onChange(formValuesToEntry(formValues));
  };

  const onLocalChange = (change: EntryForm) => {
    const proposedEntry = formValuesToEntry({ ...formValues, ...change });

    // TODO: if it's the totalTime that changed:
    //       if the entry is open, update the startTime to make it true
    //       if the entry is closed, update the endTime to make it true
    //       This should probably be in the model.

    if (change.startTime || change.endTime) {
      const totalTime = formatEntryDuration($time, proposedEntry);
      formValues = { ...formValues, ...change, totalTime };
    } else {
      formValues = { ...formValues, ...change };
    }
  };
</script>

<div class="edit flex-col">
  <div class="flex">
    <input
      class="title"
      type="text"
      placeholder="Entry description"
      value={formValues.title}
      on:input={(e) => onLocalChange({ title: e.currentTarget.value })}
    />
  </div>
  <div class="flex responsive-row">
    <div class="flex project-fields">
      <ProjectSelect
        projectId={unwrapOr(undefined, asUUID(formValues.projectId))}
        bind:readOnly
        onSave={(e) =>
          onLocalChange({
            projectId: e,
          })}
      />
    </div>
    <div class="flex time-fields">
      <div class="flex nowrap">
        <input
          type="text"
          class="time-field"
          value={formValues.startTime}
          on:input={(e) =>
            onLocalChange({
              startTime: e.currentTarget.value,
            })}
        />
        <span style="padding: 0 0.3rem;">→</span>
        <input
          type="text"
          class="time-field"
          value={formValues.endTime}
          on:input={(e) =>
            onLocalChange({
              endTime: e.currentTarget.value,
            })}
        />
      </div>
      <!-- TODO: disable this input if the entry is open -->
      <input
        type="text"
        value={formValues.totalTime}
        class="time-field total"
        disabled
        on:input={(e) => {
          // onLocalChange({
          //   totalTime: e.currentTarget.value
          // })
          return formValues.totalTime;
        }}
        title="Entry duration editing coming soon!"
      />
    </div>
  </div>
  <div class="flex controls">
    <div>
      <!-- {#if currentEntry && !!currentEntry.endTime} -->
      <!-- 	<button on:click={onCopyClick}>Copy</button> -->
      <!-- {/if} -->
      {#if entryCanDelete}
        <button on:click={onDeleteClick} class="error">Delete</button>
      {/if}
    </div>
    <div class="gap">
      <button on:click={onLocalCancelClick} class="secondary">Cancel</button>
      <button on:click={onSaveClick} class="primary" disabled={!(formDirty && formValid)}>Save</button>
    </div>
  </div>
</div>

<style lang="scss">
  @use '../styles/colors';
  @use '../styles/variables';
  @use '../styles/button';

  .controls {
    margin: 0 1rem;
    margin-bottom: 0.5rem;
  }

  .edit {
    font-family: sans-serif;
    background-color: darken(colors.$surface-100, 4);
    height: 100%;
    padding-bottom: 0.5rem;
  }

  .flex {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;

    & .gap {
      display: flex;
      gap: 1rem;
    }
  }

  .flex-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .nowrap {
    white-space: nowrap;
  }

  .responsive-row {
    @media screen and (max-width: variables.$small) {
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
    }
  }

  input {
    font-size: 1rem;
    border: none;
    margin: 0;
    padding: 1rem;
    background: darken(colors.$surface-100, 6);
    color: inherit;
    text-align: center;
    box-shadow: inset 0 5px 6px -6px darken(colors.$surface-100, 10);
  }

  .time-fields {
    justify-content: end;
    padding-right: 1rem;

    @media screen and (max-width: variables.$small) {
      padding: 0;
      width: 100%;
      justify-content: space-evenly;
    }
  }

  .time-field {
    max-width: 130px;

    &.total {
      margin-left: 2rem;
    }

    @media screen and (max-width: variables.$small) {
      max-width: 110px;
      padding: 1rem 0rem;

      justify-content: space-evenly;

      &.total {
        margin-left: 1rem;
      }
    }
  }

  .project-fields {
    margin-left: 1rem;

    @media screen and (max-width: variables.$small) {
      margin: 0 auto;
      width: 100%;

      text-align: center;
    }
  }

  .title {
    display: block;
    width: 100%;
    padding: 1.3rem;

    @media screen and (max-width: variables.$small) {
      padding: 1rem;
    }
  }
</style>
