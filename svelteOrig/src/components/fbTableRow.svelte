<script lang="ts">
  export let className = '';
  export let style = '';
</script>

<tr class={className} {style} {...$$restProps}><slot /></tr>

<style>
  tr {
    border-bottom: 0.1rem solid silver;
  }
</style>
