<script lang="ts">
  export let style = '';
  export let className = '';
</script>

<table class={`fb-table ${className}`} {style} {...$$restProps}><slot /></table>

<style>
  .fb-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
  }
</style>
