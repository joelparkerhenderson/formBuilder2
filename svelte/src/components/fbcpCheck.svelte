<script lang="ts">
  export let checked = false;
  export let onChange: (checked: boolean) => void = () => {};
</script>

<input
  class="fbcp-check"
  type="checkbox"
  {checked}
  onchange={(event) => onChange(event.currentTarget.checked)}
/>
