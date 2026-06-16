<script lang="ts">
  import SimpleClinicalForm from '../components/SimpleClinicalForm.svelte';
  import { operationNoteSpec } from '../lib/simpleClinicalSpecs';
</script>

<SimpleClinicalForm spec={operationNoteSpec} />
