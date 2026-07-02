<script lang="ts">
  import { page } from '$app/state';
</script>

<main class="fb-error-page">
  <h1>Error</h1>
  <p>{page.error?.message || 'Something went wrong.'}</p>
</main>

<style>
  .fb-error-page {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 1.5rem;
    background: white;
    color: black;
  }

  h1 {
    margin: 0 0 0.8rem 0;
    color: #1b6ec2;
    font-size: 2rem;
    font-weight: 500;
  }
</style>
