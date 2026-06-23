<script lang="ts">
  export let setView: (view: string) => void = () => {};
  export let openPreferences: () => void = () => {};
  export let showOffline: () => void = () => {};
  export let simulateNhsNumberScan: () => void = () => {};
  export let simulateHospitalNumberScan: () => void = () => {};
  export let simulateVolumeNumberScan: () => void = () => {};
  export let simulateBatchNumberScan: () => void = () => {};
  export let userDisplayName = '';

  type HomeItem = {
    target?: string;
    label: string;
    subtext?: string;
    href?: string;
    background: string;
    onClick?: () => void;
  };

  const userItems: HomeItem[] = [
    { label: 'Patient search', href: '/formBuilder2/index.html#/patient-search', background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)' },
    { target: 'batch', label: 'Batches', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'requests', label: 'Outbox', background: 'linear-gradient(135deg, #d50000, #fd8a10)' },
    { target: 'inbox', label: 'Inbox', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'returnList', label: 'Return list', background: 'linear-gradient(135deg, #008000, #c5e1a5)' },
    { target: 'clinics', label: 'Picklist', background: 'linear-gradient(135deg, #1b6ec2, #7048e8)' },
    { target: 'myClinics', label: 'Clinics', background: 'linear-gradient(135deg, #fd8a10, #fee715)' },
    { target: 'locations', label: 'Libraries', background: 'linear-gradient(135deg, #008000, #8cd2e7)' },
    { label: 'Preferences', background: 'linear-gradient(135deg, #1b6ec2, #008000)', onClick: openPreferences },
  ];

  const systemItems: HomeItem[] = [
    { target: 'clinicSchedule', label: 'Clinic schedule', background: 'linear-gradient(135deg, #1b6ec2, #8cd2e7)' },
    { target: 'allClinics', label: 'All clinics', background: 'linear-gradient(135deg, #008000, #c5e1a5)' },
    { target: 'allLocations', label: 'Locations', background: 'linear-gradient(135deg, #7048e8, #8cd2e7)' },
    { target: 'admin', label: 'Admin', subtext: 'For records admins', background: 'linear-gradient(135deg, #333, #8cd2e7)' },
    { label: 'CNT specification', href: '/formBuilder2/docs/cnt-specification.html', background: 'linear-gradient(135deg, #fd8a10, #fee715)' },
  ];

  const scanButtons: Array<[string, () => void]> = [
    ['Simulate NHS number scan', simulateNhsNumberScan],
    ['Simulate hospital number scan', simulateHospitalNumberScan],
    ['Simulate volume number scan', simulateVolumeNumberScan],
    ['Simulate batch number scan', simulateBatchNumberScan],
  ];

  function openItem(item: HomeItem) {
    if (item.href) {
      window.location.href = item.href;
      return;
    }
    if (item.onClick) item.onClick();
    else if (item.target) setView(item.target);
  }
</script>

<section>
  <div class="scan-simulation-row">
    {#each scanButtons as [label, action]}
      <button type="button" class="scan-simulation-button" onclick={action}>{label}</button>
    {/each}
  </div>

  <fieldset class="home-fieldset">
    <legend>{userDisplayName}</legend>
    <div class="tile-grid">
      {#each userItems as item}
        <button
          type="button"
          class="home-button"
          class:dark-text={item.background.includes('#fee715')}
          style={`background: ${item.background}`}
          onclick={() => openItem(item)}
        >
          <span class="tile-label">{item.label}</span>
          {#if item.subtext}<span class="tile-subtext">{item.subtext}</span>{/if}
        </button>
      {/each}
    </div>
  </fieldset>

  <fieldset class="home-fieldset">
    <legend>System</legend>
    <div class="tile-grid">
      {#each systemItems as item}
        <button
          type="button"
          class="home-button"
          class:dark-text={item.background.includes('#fee715')}
          style={`background: ${item.background}`}
          onclick={() => openItem(item)}
        >
          <span class="tile-label">{item.label}</span>
          {#if item.subtext}<span class="tile-subtext">{item.subtext}</span>{/if}
        </button>
      {/each}
    </div>
    <button type="button" class="home-button offline-button" onclick={showOffline}>Show offline warning</button>
  </fieldset>
</section>

<style>
  .scan-simulation-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
  }

  .scan-simulation-button {
    border: 0.1rem solid #1b6ec2;
    border-radius: 0.4rem;
    background: white;
    color: #1b6ec2;
    padding: 0.35rem 0.7rem;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
  }

  .home-fieldset {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    margin: 0 0 1rem;
    padding: 0.8rem;
  }

  legend {
    padding: 0 0.4rem;
    font-weight: 500;
  }

  .tile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 0.7rem;
  }

  .home-button {
    min-height: 5rem;
    border: 0;
    border-radius: 0.4rem;
    padding: 0.75rem;
    color: white;
    text-align: left;
    font-family: 'Roboto', sans-serif;
    cursor: pointer;
  }

  .home-button.dark-text,
  .offline-button {
    color: black;
  }

  .offline-button {
    margin-top: 0.7rem;
    background: #fd8a10;
  }

  .tile-label {
    display: block;
    font-size: 1.35rem;
    font-weight: 500;
  }

  .tile-subtext {
    display: block;
    margin-top: 0.35rem;
    font-weight: 300;
  }
</style>
