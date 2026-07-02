<script lang="ts">
  import type { CntStore } from './cntStore';
  import FbcntLocation from './FbcntLocation.svelte';

  export let store: CntStore;
  export let value = '';
  export let onChange: (value: string) => void = () => {};
  export let allowBlank = false;
</script>

<FbcntLocation label="To" {store} {value} {onChange} {allowBlank} />
