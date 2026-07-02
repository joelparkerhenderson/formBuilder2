<script lang="ts">
  import { base } from '$app/paths';
  import { createApiClient } from '$lib/api/client';
  import FbAddressograph from '$lib/components/fb/fbAddressograph.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbSearchInput from '$lib/components/fb/fbSearchInput.svelte';
  import FbUserName from '$lib/components/fb/fbUserName.svelte';
  import type { Patient } from '$lib/types';
  import { openHrefWithReturn, returnByHref } from '$lib/utils/fbHrefNavigation';

  let patients = $state<Patient[]>([]);
  let loading = $state(false);
  let searchQuery = $state('');
  let username = $state('demoUser');
  let querySerial = 0;
  let searchError = $state('');

  const api = createApiClient();

  $effect(() => {
    sessionStorage.setItem('fb_prev_main_page', `${base}/patient-search`);
  });

  async function runSearch(nextQuery: string) {
    searchQuery = nextQuery;
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      patients = [];
      loading = false;
      searchError = '';
      querySerial += 1;
      return;
    }

    const currentQuery = ++querySerial;
    patients = [];
    loading = true;
    searchError = '';

    try {
      const data = await api.post<Patient[]>('/patients/search', { searchQuery: trimmed });
      if (currentQuery === querySerial) patients = data || [];
    } catch (error) {
      if (currentQuery === querySerial) {
        patients = [];
        searchError = error instanceof Error ? error.message : 'Patient search failed.';
      }
    } finally {
      if (currentQuery === querySerial) loading = false;
    }
  }

  function openRecord(patientUuid: string) {
    openHrefWithReturn(`${base}/patient-record/${encodeURIComponent(patientUuid)}?username=${encodeURIComponent(username)}`);
  }

  function openCaseNotes(patient: Patient) {
    sessionStorage.setItem('fbcntUserUuid', 'bbbbbbbb-0005-4000-8000-000000000005');
    sessionStorage.setItem('fbcntInitialPatient', JSON.stringify(toCntPatient(patient)));
    openHrefWithReturn(`${base}/cnt?patientUuid=${encodeURIComponent(patient.uuid)}&loginAs=bbbbbbbb-0005-4000-8000-000000000005`);
  }

  function toCntPatient(patient: Patient) {
    return {
      uuid: patient.uuid,
      nhsNumber: patient.nhs_number || '',
      hospitalNumber: patient.hospital_number || patient.uuid.slice(0, 8),
      name: `${patient.forenames || ''} ${patient.surname || ''}`.trim(),
      title: patient.title || '',
      surname: patient.surname || '',
      forenames: patient.forenames || '',
      addressLine1: patient.address_line1 || '',
      addressLine2: patient.address_line2 || '',
      addressLine3: patient.address_line3 || '',
      addressLine4: patient.address_line4 || '',
      dateOfBirth: patient.date_of_birth || '',
      sex: patient.sex || '',
    };
  }
</script>

<main class="patient-list-page">
  <header class="patient-search-header">
    <a class="patient-list-title" href={`${base}/`}>Patient search</a>
    <FbSearchInput
      id="patient-search-query-input"
      label="Search for"
      bind:value={searchQuery}
      placeholder="Type to search patient index"
      autoFocus
      onChange={runSearch}
    />
  </header>

  <section class="patient-list-main" aria-label="Patient search results">
    {#if searchError}
      <div class="patient-list-muted" role="alert">{searchError}</div>
    {:else if loading}
      <div class="patient-list-muted">Querying patient registry...</div>
    {:else if patients.length === 0}
      <div class="patient-list-muted italic">No matches found</div>
    {:else}
      <table class="patient-list-table">
        <tbody>
          {#each patients as patient (patient.uuid)}
            <tr>
              <td>
                <div class="patient-list-row">
                  <button type="button" class="patient-addressograph-button" onclick={() => openRecord(patient.uuid)}>
                    <FbAddressograph
                      {patient}
                      nhsNumber={patient.nhs_number || ''}
                      surname={patient.surname || ''}
                      forenames={patient.forenames || ''}
                      title={patient.title || ''}
                      hospitalNumber={patient.hospital_number || ''}
                      dateOfBirth={patient.date_of_birth || ''}
                      sex={patient.sex || ''}
                    />
                  </button>
                  <div class="patient-list-actions">
                    <FbButton variant="primary" onclick={() => openRecord(patient.uuid)}>Open record</FbButton>
                    <FbButton variant="primary" onclick={() => openCaseNotes(patient)}>Case notes</FbButton>
                  </div>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <footer class="patient-list-footer bottom-control-bar">
    <FbUserName bind:value={username} />
    <FbButton variant="primary" onclick={() => returnByHref(`${base}/`)}>Back</FbButton>
  </footer>
</main>

<style>
  .patient-list-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .patient-search-header {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 0.8rem;
    border-bottom: 0.2rem solid #1b6ec2;
    background: white;
    box-sizing: border-box;
  }

  .patient-list-title {
    border: 0;
    background: transparent;
    color: #333;
    cursor: pointer;
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 2.2rem;
    margin: 0;
    padding: 0;
    text-align: left;
    text-decoration: none;
  }

  .patient-list-main {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .patient-list-muted {
    color: #666;
    font-size: 1rem;
    font-weight: 300;
  }

  .italic {
    font-style: italic;
  }

  .patient-list-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
  }

  td {
    padding: 0.8rem 0;
    border-bottom: 0.1rem solid #e2e8f0;
    vertical-align: top;
  }

  .patient-list-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

  .patient-addressograph-button {
    display: inline-block;
    flex: 0 0 auto;
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0;
  }

  .patient-addressograph-button:hover :global(.fb-addressograph-card),
  .patient-addressograph-button:focus :global(.fb-addressograph-card) {
    box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 8%);
    transform: scale(1.01);
  }

  .patient-list-actions {
    padding-right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    justify-content: flex-end;
    align-items: stretch;
  }

  @media (max-width: 48rem) {
    .patient-list-main {
      padding: 1rem 0.5rem;
    }

    .patient-list-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.5rem;
    }

    .patient-list-actions {
      justify-content: flex-start;
      padding-right: 0;
      padding-left: 0.1rem;
    }
  }

  .patient-list-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
    min-height: 2.8rem;
    padding: 0.4rem 0.8rem;
    border-top: 0.2rem solid #1b6ec2;
    background: white;
    box-sizing: border-box;
  }
</style>
