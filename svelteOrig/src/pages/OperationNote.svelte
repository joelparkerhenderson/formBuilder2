<script lang="ts">
  import SpecDrivenForm from '../components/SpecDrivenForm.svelte';
  import { operationNoteSpec } from '../lib/specDrivenFormSpecs';

  export let patientUuid = new URLSearchParams(window.location.search).get('patientUuid') || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  export let formUuid = new URLSearchParams(window.location.search).get('formUuid') || '';
  export let openInRoV = new URLSearchParams(window.location.search).get('openInRoV') === 'true';
  export let readOnlyBackOnly = new URLSearchParams(window.location.search).get('readOnlyBackOnly') === 'true';
  export let inline = false;
  export let onClose: () => void = () => {};
</script>

<SpecDrivenForm spec={operationNoteSpec} {patientUuid} {formUuid} {openInRoV} {readOnlyBackOnly} {inline} {onClose} />
