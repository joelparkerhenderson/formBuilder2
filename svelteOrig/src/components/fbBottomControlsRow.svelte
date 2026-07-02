<script lang="ts">
  import { fbBlue } from '../lib/constants';
</script>

<footer class="fb-bottom-controls-row" style="border-top: 0.2rem solid {fbBlue};">
  <slot />
</footer>

<style>
  .fb-bottom-controls-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    min-height: 2.4rem;
    padding: 0.2rem 0.4rem;
    background: white;
    box-sizing: border-box;
  }
</style>
