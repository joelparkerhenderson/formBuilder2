<script lang="ts">
  import FbPartialDate from './fbDatePartial.svelte';
  export let name = '';
  export let value = '';
  export let required = false;
  export let requiredForAudit = false;
  export let showRequiredMarkers = true;
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};
</script>

<FbPartialDate {name} {value} {required} {requiredForAudit} {showRequiredMarkers} exactOnly={true} {onChange} {change} on:change>
  <slot />
</FbPartialDate>
