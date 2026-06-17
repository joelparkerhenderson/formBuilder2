<script lang="ts">
  import { onMount } from 'svelte';
  import FbAddressograph from '../components/fbAddressograph.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbUserName from '../components/fbUserName.svelte';
  import PatientRecord from './PatientRecord.svelte';
  import { getPatients } from '../lib/api';
  import type { Patient } from '../lib/types';

  let patients: Patient[] = [];
  let loading = true;
  let activePatientUuid: string | null = null;
  let username = 'demoUser';

  onMount(() => {
    sessionStorage.setItem('fb_prev_main_page', '/patient-registry');
    void fetchPatients();
  });

  async function fetchPatients() {
    loading = true;
    try {
      patients = await getPatients();
    } catch (error) {
      console.error('Error fetching patients:', error);
      patients = [];
    } finally {
      loading = false;
    }
  }
</script>

{#if activePatientUuid}
  <PatientRecord inline patientUuid={activePatientUuid} bind:username onClose={() => (activePatientUuid = null)} />
{:else}
  <main class="patient-list-page">
    <header class="patient-list-header">
      <button type="button" class="patient-list-title" onclick={() => (window.location.href = 'index.html')}>Patient registry</button>
    </header>
    <section class="patient-list-main" aria-label="Patient registry">
      {#if loading}
        <div class="patient-list-muted">Loading patients...</div>
      {:else if patients.length === 0}
        <div class="patient-list-muted italic">No patients found.</div>
      {:else}
        <table class="patient-list-table">
          <tbody>
            {#each patients as patient (patient.uuid)}
              <tr>
                <td>
                  <div class="patient-list-row">
                    <button type="button" class="patient-addressograph-button" onclick={() => (activePatientUuid = patient.uuid)}>
                      <FbAddressograph
                        nhsNumber={patient.nhs_number || ''}
                        surname={patient.surname || ''}
                        forenames={patient.forenames || ''}
                        title={patient.title || ''}
                        addressLine1={patient.address_line1 || ''}
                        addressLine2={patient.address_line2 || ''}
                        addressLine3={patient.address_line3 || ''}
                        addressLine4={patient.address_line4 || ''}
                        crn={patient.crn || ''}
                        dateOfBirth={patient.date_of_birth || ''}
                        sex={patient.sex || ''}
                      />
                    </button>
                    <div class="patient-list-open"><FbButton type="button" onClick={() => (activePatientUuid = patient.uuid)}>Open record</FbButton></div>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>
    <footer class="patient-list-footer">
      <FbUserName bind:value={username} />
      <FbButton type="button" onClick={() => (window.location.href = 'index.html')}>Back</FbButton>
    </footer>
  </main>
{/if}

<style>
  .patient-list-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .patient-list-header {
    padding: 0.4rem 0.8rem;
    border-bottom: 0.2rem solid var(--fb-blue);
    background: white;
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
  }

  .patient-list-main {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .patient-list-muted {
    color: #666;
    font-size: 1.1rem;
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
  }

  .patient-addressograph-button {
    display: inline-block;
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

  .patient-list-open {
    padding-right: 1rem;
  }

  .patient-list-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
    min-height: 2.8rem;
    padding: 0.4rem 0.8rem;
    border-top: 0.2rem solid var(--fb-blue);
    background: white;
    box-sizing: border-box;
  }
</style>
