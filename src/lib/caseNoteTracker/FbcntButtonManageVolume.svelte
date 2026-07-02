<script lang="ts">
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  export let onClick: () => void = () => {};
</script>

<FbcntSmallButton {onClick}>Manage</FbcntSmallButton>
