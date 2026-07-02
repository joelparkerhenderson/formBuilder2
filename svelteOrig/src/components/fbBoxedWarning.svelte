<script lang="ts">
  import FbBoxedMessage from './fbBoxedMessage.svelte';
  export let text = '';
</script>

<FbBoxedMessage variant="warning" {text} />
