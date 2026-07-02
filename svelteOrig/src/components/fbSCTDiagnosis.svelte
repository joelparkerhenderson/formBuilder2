<script lang="ts">
  import FbSCTProcedure from './fbSCTProcedure.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let required = false;
  export let requiredForAudit = false;
  export let coded: boolean | undefined = undefined;
  export let valueError = '';
  export let tooltip = '';
  export let subfield = false;
  export let onChange: (value: string, coded: boolean) => void = () => {};
  export let change: (value: string, coded: boolean) => void = () => {};
</script>

<FbSCTProcedure searchCommand="findDisorder" {id} {name} {label} {value} {required} {requiredForAudit} {coded} {valueError} {tooltip} {subfield} {onChange} {change} on:change />
