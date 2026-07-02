<script lang="ts">
  import { base } from '$app/paths';

  const donaldDuckPatientUuid = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  $effect(() => {
    window.location.replace(`${base}/patient-record/${donaldDuckPatientUuid}`);
  });
</script>

<main class="patient-record-redirect">
  <p>Opening Patient record...</p>
</main>

<style>
  .patient-record-redirect {
    min-height: 100vh;
    display: grid;
    place-items: center;
    font-family: 'Roboto', sans-serif;
    color: #666;
  }
</style>
