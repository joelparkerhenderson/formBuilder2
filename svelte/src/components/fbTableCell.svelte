<script lang="ts">
  export let width = '';
  export let style = '';
  export let className = '';
</script>

<td class={className} style={`${width ? `width: ${width}; ` : ''}${style}`} {...$$restProps}><slot /></td>

<style>
  td {
    padding: 0.4rem;
    border-bottom: 0.1rem solid silver;
    vertical-align: top;
    background: white;
    transition: background-color 0.2s ease;
  }

  td:hover,
  td:focus-within {
    background: #ffffcc;
  }
</style>
