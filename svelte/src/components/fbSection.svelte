<script lang="ts">
  import { fbBlue } from '../lib/constants';
  export let id = '';
  export let title = '';
</script>

<section {id} class="fb-section-block">
  <h3 style="background-color: {fbBlue};">{title}</h3>
  <div class="fb-section-content"><slot /></div>
</section>

<style>
  .fb-section-block {
    margin-bottom: 0.8rem;
  }

  h3 {
    color: white;
    border-radius: 0.2rem 0.2rem 0 0;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.2rem;
    padding: 0.2rem 0.2rem 0.2rem 0.4rem;
    margin: 0;
  }

  .fb-section-content {
    margin-top: 0.4rem;
    margin-bottom: 0.6rem;
    padding: 0.4rem 0;
  }
</style>
