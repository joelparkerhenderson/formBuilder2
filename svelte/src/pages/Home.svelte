<script lang="ts">
  import FbUserName from '../components/fbUserName.svelte';

  const patientUuid = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  let username = 'demoUser';
  $: waitingListHref = `waitingListCard.html?patientUuid=${encodeURIComponent(patientUuid)}`;
  $: operationNoteHref = `operationNote.html?patientUuid=${encodeURIComponent(patientUuid)}`;
  $: outpatientOutcomeHref = `outpatientOutcome.html?patientUuid=${encodeURIComponent(patientUuid)}`;
  $: treatmentSummaryHref = `treatmentSummary.html?patientUuid=${encodeURIComponent(patientUuid)}`;
</script>

<main class="fb-home">
  <header class="fb-home-header">
    <h1>formBuilder2 Svelte</h1>
  </header>
  <section class="fb-home-main">
    <div class="fb-home-card">
      <a class="fb-home-link" href={waitingListHref}>Waiting list card</a>
      <a class="fb-home-link" href={operationNoteHref}>Operation note</a>
      <a class="fb-home-link" href={outpatientOutcomeHref}>Outpatient outcome</a>
      <a class="fb-home-link" href={treatmentSummaryHref}>Treatment summary</a>
      <a class="fb-home-link" href="patientRegistry.html">Patient registry</a>
      <a class="fb-home-link" href="patientSearch.html">Patient search</a>
      <a class="fb-home-link" href={`patientRecord.html?patientUuid=${encodeURIComponent(patientUuid)}`}>Patient record</a>
      <a class="fb-home-link" href="composer.html">Composer</a>
      <a class="fb-home-link" href="componentLibrary.html">Component library</a>
      <p>Right-click links to open in new tab/window</p>
    </div>
  </section>
  <footer class="fb-home-footer">
    <FbUserName bind:value={username} />
  </footer>
</main>

<style>
  .fb-home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .fb-home-header {
    background: white;
    border-bottom: 0.2rem solid var(--fb-blue);
    padding: 0.4rem 0.8rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 2.8rem;
  }

  h1 {
    margin: 1rem 0;
    font-size: 2rem;
    font-weight: 500;
    color: var(--fb-blue);
  }

  .fb-home-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: none;
    padding: 1rem;
    box-sizing: border-box;
  }

  .fb-home-card {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 1.5rem;
    border-radius: 0.8rem;
    box-shadow: 0 0.1rem 0.6rem rgb(0 0 0 / 6%);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .fb-home-link {
    display: block;
    width: 100%;
    padding: 1rem;
    border: none;
    background: var(--fb-blue);
    color: white;
    border-radius: 0.4rem;
    text-align: center;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .fb-home-link:hover,
  .fb-home-link:focus {
    background: rgb(21, 88, 156);
    color: white;
  }

  p {
    margin: 0.7rem 0 0 0;
    color: #666;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 300;
  }

  .fb-home-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0.4rem 0.8rem;
    background: white;
    border-top: 0.2rem solid var(--fb-blue);
    min-height: 2.8rem;
    box-sizing: border-box;
  }
</style>
