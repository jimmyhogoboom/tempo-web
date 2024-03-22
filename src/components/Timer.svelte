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
	<div class="display">
		<div class="time">
			<EntryTime {entry} />
		</div>

		<button
			on:click={onClick}
			class="button {entryIsOpen ? 'glow' : ''}"
			aria-label={entryIsOpen ? 'Stop timer' : 'Start timer'}
		>
			<span>{entryIsOpen ? '■' : '▶'}</span>
		</button>
	</div>

	<input
		type="text"
		placeholder="Entry description"
		bind:value={title}
		on:input={() => onTitleChange(title)}
	/>
</div>

<style lang="scss">
	@use '../styles/colors';

	.timer {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: baseline;
		padding: 0;
		padding-top: 3rem;
		background-color: darken(colors.$surface-100, 4);
	}

	.display {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: 3rem;
		padding-bottom: 1.3rem;
	}

	input {
		font-size: 1rem;
		display: block;
		border: none;
		margin: 0;
		margin-top: 1rem;
		width: 100%;
		padding: 1.3rem;
		background: darken(colors.$surface-100, 6);
		color: inherit;
		text-align: center;
	}

	.time {
		font-size: 3rem;
	}

	.button {
		font-size: 1.2rem;
		cursor: pointer;
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		border-radius: 50%;
		background-color: colors.$primary-100;
		height: 3.2rem;
		width: 3.2rem;
		border: 1px solid rgba(colors.$primary-100, 1);
		transition: box-shadow 0.4s;

		&.glow {
			box-shadow: 0 0 0 3px rgba(colors.$primary-100, 0.5);
		}
	}

	.button span {
		margin-top: -2px;
	}
</style>
