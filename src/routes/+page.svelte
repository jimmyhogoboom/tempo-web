<script>
	import { entries } from '$stores/stores';
</script>

<div>
	<button
		on:click={() =>
			entries.update((es) =>
				es.concat({
					id: '', // TODO: generate guid
					startTime: new Date(),
					title: ''
				})
			)}>Start</button
	>

	<ul>
		{JSON.stringify($entries)}
	</ul>
</div>
