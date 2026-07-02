<script lang="ts">
  export let width = '';
  export let style = '';
  export let className = '';
</script>

<th class={className} style={`${width ? `width: ${width}; ` : ''}${style}`} {...$$restProps}><slot /></th>

<style>
  th {
    padding: 0.4rem;
    text-align: left;
    color: #555;
    font-size: 0.8rem;
    font-style: italic;
    font-weight: 300;
    background: white;
    vertical-align: bottom;
  }
</style>
