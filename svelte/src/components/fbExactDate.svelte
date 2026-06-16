<script lang="ts">
  import FbPartialDate from './fbPartialDate.svelte';
  export let name = '';
  export let value = '';
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};
</script>

<FbPartialDate {name} {value} exactOnly={true} {onChange} {change} on:change />
