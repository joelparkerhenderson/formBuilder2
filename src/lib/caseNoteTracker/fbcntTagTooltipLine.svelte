<script lang="ts">
  export let text = '';
  export let tooltip = '';
</script>

<span class="tooltip-line" title={tooltip}>{text}</span>

<style>
  .tooltip-line {
    display: block;
    color: #1b6ec2;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
