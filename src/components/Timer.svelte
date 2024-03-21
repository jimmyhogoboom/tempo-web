<script lang="ts">
	import EntryTime from '$components/EntryTime.svelte';
	import Entries from '$lib/Entries';

	export let entry: TimeEntry | undefined;
	export let onStart: () => void;
	export let onStop: () => void;
	export let onTitleChange: (text: string) => void;

	$: title = entry?.title ?? '';

	$: entryIsOpen = entry && Entries.entryOpen(entry);

	const onClick = () => {
		entryIsOpen ? onStop() : onStart();
	};
</script>

<div class="timer">
	<input
		type="text"
		placeholder="Entry description"
		bind:value={title}
		on:input={() => onTitleChange(title)}
		class="input"
	/>

	<div class="time">
		<EntryTime {entry} />
	</div>

	<button on:click={onClick} class="button" aria-label={entryIsOpen ? 'Stop timer' : 'Start timer'}
		>{entryIsOpen ? '■' : '▶'}</button
	>
</div>

<style lang="scss">
	@use '../styles/colors';

	.timer {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: baseline;
		padding: 1rem 0;
	}

	.input {
		font-size: 1rem;
		display: block;
		border: 0px;
		border-bottom: solid 0.2rem colors.$surface-600;
		margin: 0px;
		width: 100%;
		padding: 1rem;
		background: rgba(0, 0, 0, 0);
		color: colors.$text;
	}

	.time {
		padding: 1rem 2rem;
	}

	.button {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		border-radius: 50%;
		border: none;
		background-color: colors.$primary-100;
		height: 2.4rem;
		width: 2.4rem;
		cursor: pointer;
		box-shadow: 0 0 0 3px rgba(colors.$primary-100, 0.5);
	}
</style>
