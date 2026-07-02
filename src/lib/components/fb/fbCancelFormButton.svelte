<script lang="ts">
  import FbButton from './fbButton.svelte';

  let {
    onclick,
    class: className = '',
    style = ''
  }: {
    onclick?: (event: MouseEvent) => void;
    class?: string;
    style?: string;
  } = $props();
</script>

<FbButton type="button" variant="danger" class={className} {style} {onclick}>Cancel</FbButton>
