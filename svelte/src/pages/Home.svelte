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
  <section class="fb-home-main">
    <div class="fb-home-title-tile">
      <div class="fb-home-kicker">NHS Wales</div>
      <h1>formBuilder2 Svelte</h1>
    </div>
    <fieldset class="fb-home-fieldset">
      <legend>Patient forms</legend>
      <div class="fb-home-tiles">
        <a class="fb-home-link blue-gradient dark-tile-text" href={waitingListHref}>Waiting list card</a>
        <a class="fb-home-link green-gradient dark-tile-text" href={operationNoteHref}>Operation note</a>
        <a class="fb-home-link red-gradient" href={outpatientOutcomeHref}>Outpatient outcome</a>
        <a class="fb-home-link orange-gradient" href={treatmentSummaryHref}>Treatment summary</a>
      </div>
    </fieldset>
    <fieldset class="fb-home-fieldset">
      <legend>System</legend>
      <div class="fb-home-tiles">
        <a class="fb-home-link light-green-gradient" href="patientRegistry.html">Patient registry</a>
        <a class="fb-home-link blue-green-gradient" href="patientSearch.html">Patient search</a>
        <a class="fb-home-link green-blue-gradient dark-tile-text" href={`patientRecord.html?patientUuid=${encodeURIComponent(patientUuid)}`}>Patient record</a>
        <a class="fb-home-link orange-gradient" href="composer.html">Composer</a>
        <a class="fb-home-link red-gradient" href="caseNoteTracker.html">Case note tracker</a>
        <a class="fb-home-link light-orange-gradient" href="componentLibrary.html">Component library</a>
      </div>
    </fieldset>
    <p>Right-click links to open in new tab/window</p>
  </section>
  <footer class="fb-home-footer">
    <FbUserName bind:value={username} />
  </footer>
</main>

<style>
  .fb-home {
    min-height: 100vh;
    width: 100vw;
    min-width: 100%;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .fb-home-main {
    flex: 1;
    width: 100%;
    max-width: none;
    padding: 1.5rem;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .fb-home-title-tile {
    width: 100%;
    box-sizing: border-box;
    background: #1b6ec2;
    color: white;
    border-radius: 0.4rem;
    padding: 1rem;
    margin-bottom: 0.8rem;
  }

  .fb-home-kicker {
    font-size: 1rem;
    font-weight: 300;
  }

  h1 {
    margin: 0;
    font-size: 2.1rem;
    font-weight: 500;
    color: white;
  }

  .fb-home-fieldset {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.8rem;
    margin: 0 0 0.8rem 0;
    background: white;
    box-sizing: border-box;
  }

  legend {
    padding: 0 0.35rem;
    font-size: 1rem;
    font-weight: 500;
  }

  .fb-home-tiles {
    width: 100%;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: 0.8rem;
  }

  .fb-home-link {
    width: 100%;
    min-height: 5.5rem;
    padding: 1.2rem;
    border: 0.1rem solid silver;
    color: white;
    border-radius: 0.4rem;
    display: flex;
    align-items: center;
    text-decoration: none;
    font-size: 1.35rem;
    font-weight: 500;
    text-align: left;
    box-shadow: 0 0.15rem 0.5rem rgba(0,0,0,0.14);
    transition: background-color 0.2s;
    box-sizing: border-box;
  }

  .fb-home-link.dark-tile-text {
    color: #111111;
  }

  .blue-gradient { background: linear-gradient(135deg, #1b6ec2, #8cd2e7); }
  .green-gradient { background: linear-gradient(135deg, #008000, #c5e1a5); }
  .red-gradient { background: linear-gradient(135deg, #d50000, #fd8a10); }
  .orange-gradient { background: linear-gradient(135deg, #fd8a10, #fee715); color: black; }
  .light-green-gradient { background: linear-gradient(135deg, #8cd2e7, #c5e1a5); color: black; }
  .blue-green-gradient { background: linear-gradient(135deg, #1b6ec2, #008000); }
  .green-blue-gradient { background: linear-gradient(135deg, #008000, #8cd2e7); }
  .light-orange-gradient { background: linear-gradient(135deg, #8cd2e7, #fee715); color: black; }

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
    border-top: 0.2rem solid #1b6ec2;
    min-height: 2.8rem;
    box-sizing: border-box;
  }
</style>
