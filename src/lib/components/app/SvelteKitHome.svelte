<script lang="ts">
  import { base } from '$app/paths';
  import FbUserName from '$lib/components/fb/fbUserName.svelte';
  import { handleHrefNavigationClick } from '$lib/utils/fbHrefNavigation';

  const donaldDuckPatientUuid = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

  type HomeTile = {
    label: string;
    href: string;
    background: string;
    color?: string;
  };

  let username = $state('demoUser');

  const patientFormTiles = $derived<HomeTile[]>([
    { label: 'Waiting list card', href: `${base}/waiting-list-card?patientUuid=${donaldDuckPatientUuid}&username=${encodeURIComponent(username)}`, background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)' },
    { label: 'Operation note', href: `${base}/operation-note?patientUuid=${donaldDuckPatientUuid}&username=${encodeURIComponent(username)}`, background: 'linear-gradient(135deg, #008000, #c5e1a5)' },
    { label: 'Outpatient outcome', href: `${base}/outpatient-outcome?patientUuid=${donaldDuckPatientUuid}&username=${encodeURIComponent(username)}`, background: 'linear-gradient(135deg, #d50000, #fd8a10)' },
    { label: 'Treatment summary', href: `${base}/treatment-summary?patientUuid=${donaldDuckPatientUuid}&username=${encodeURIComponent(username)}`, background: 'linear-gradient(135deg, #fd8a10, #fee715)', color: 'black' },
    { label: 'Cardiology test request', href: `${base}/cardiology-test-request?patientUuid=${donaldDuckPatientUuid}&username=${encodeURIComponent(username)}`, background: 'linear-gradient(135deg, #1b6ec2, #c5e1a5)' }
  ]);

  const systemTiles = $derived<HomeTile[]>([
    { label: 'Patient registry', href: `${base}/patient-registry`, background: 'linear-gradient(135deg, #8cd2e7, #c5e1a5)', color: 'black' },
    { label: 'Patient search', href: `${base}/patient-search`, background: 'linear-gradient(135deg, #1b6ec2, #008000)' },
    { label: 'Patient record', href: `${base}/patient-record/${donaldDuckPatientUuid}?username=${encodeURIComponent(username)}`, background: 'linear-gradient(135deg, #008000, #8cd2e7)', color: 'black' },
    { label: 'Implant registry', href: `${base}/system/implant-registry`, background: 'linear-gradient(135deg, #1b6ec2, #c5e1a5)', color: 'black' },
    { label: 'Outpatient outcomes', href: `${base}/system/outpatient-outcomes`, background: 'linear-gradient(135deg, #8cd2e7, #1b6ec2)' },
    { label: 'Case note tracker', href: `${base}/cnt`, background: 'linear-gradient(135deg, #d50000, #fd8a10)' },
    { label: 'Composer', href: `${base}/composer`, background: 'linear-gradient(135deg, #fd8a10, #fee715)', color: 'black' },
    { label: 'Component library', href: `${base}/component-library`, background: 'linear-gradient(135deg, #8cd2e7, #fee715)', color: 'black' },
    { label: 'Design system specification', href: '/formBuilder2/docs/wcp-eForms-designSystem-specification.html', background: 'linear-gradient(135deg, #1b6ec2, #7048e8)' },
    { label: 'Form specification examples', href: '/formBuilder2/docs/wcp-eForms-designSystem-examples.html', background: 'linear-gradient(135deg, #7048e8, #fee715)', color: 'black' }
  ]);

  $effect(() => {
    const path = window.location.pathname.endsWith('/index.html') ? `${base}/index.html` : `${base}/`;
    sessionStorage.setItem('fb_prev_main_page', path);
  });
</script>

<div class="fb-home">
  <main class="fb-home-main">
    <div class="fb-home-title-tile">
      <div class="fb-home-kicker">NHS Wales</div>
      <h1>formBuilder2</h1>
    </div>

    <fieldset class="fb-home-fieldset">
      <legend>Patient forms</legend>
      <div class="fb-home-tiles">
        {#each patientFormTiles as tile}
          <a class="fb-home-link" href={tile.href} onclick={(event) => handleHrefNavigationClick(event, tile.href)} style={`background: ${tile.background}; color: ${tile.color || 'white'};`}>{tile.label}</a>
        {/each}
      </div>
    </fieldset>

    <fieldset class="fb-home-fieldset">
      <legend>System</legend>
      <div class="fb-home-tiles">
        {#each systemTiles as tile}
          <a class="fb-home-link" href={tile.href} onclick={(event) => handleHrefNavigationClick(event, tile.href)} style={`background: ${tile.background}; color: ${tile.color || 'white'};`}>{tile.label}</a>
        {/each}
      </div>
    </fieldset>

    <p class="fb-home-note">Right-click links to open in new tab/window</p>
  </main>

  <footer class="bottom-control-bar fb-home-footer">
    <FbUserName bind:value={username} />
  </footer>
</div>

<style>
  .fb-home {
    width: 100vw;
    min-width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
    font-family: 'Roboto', sans-serif;
  }

  .fb-home-main {
    flex: 1;
    width: 100%;
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
    display: flex;
    align-items: center;
    min-height: 5.5rem;
    padding: 1.2rem;
    text-decoration: none;
    border-radius: 0.4rem;
    border: 0.1rem solid silver;
    box-shadow: 0 0.15rem 0.5rem rgba(0, 0, 0, 0.14);
    font-size: 1.35rem;
    font-weight: 500;
    box-sizing: border-box;
    text-align: left;
  }

  .fb-home-note {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #666;
    text-align: center;
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
