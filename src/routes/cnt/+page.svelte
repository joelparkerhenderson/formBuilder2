<script lang="ts">
  import CaseNoteTracker from '$lib/caseNoteTracker/CaseNoteTracker.svelte';

  const params = new URLSearchParams(window.location.search);
  const initialView = params.get('view') || '';
</script>

<svelte:head>
  <title>Case note tracker</title>
</svelte:head>

<CaseNoteTracker {initialView} />
