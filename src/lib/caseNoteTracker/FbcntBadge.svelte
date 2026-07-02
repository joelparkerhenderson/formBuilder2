<script lang="ts">
  import { fbBlue } from './cntStyles';
  export let text = 'Badge';
  export let backgroundColor = fbBlue;
</script>

<span class="fbcnt-badge" style={`background-color: ${backgroundColor}`}>{text}</span>

<style>
  .fbcnt-badge {
    display: inline-block;
    color: white;
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 1;
    border-radius: 0.2rem;
    padding: 0.12rem 0.35rem;
    white-space: nowrap;
  }
</style>
