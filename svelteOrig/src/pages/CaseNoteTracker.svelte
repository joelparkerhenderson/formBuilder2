<script lang="ts">
  import CaseNoteTracker from '../caseNoteTracker/CaseNoteTracker.svelte';

  const params = new URLSearchParams(window.location.search);
  const initialView = params.get('view') || '';
</script>

<CaseNoteTracker {initialView} />
