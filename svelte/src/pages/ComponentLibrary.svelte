<script lang="ts">
  import FbBoxedAlert from '../components/fbBoxedAlert.svelte';
  import FbBoxedInfo from '../components/fbBoxedInfo.svelte';
  import FbBoxedWarning from '../components/fbBoxedWarning.svelte';
  import FbBadgeDraft from '../components/fbBadgeDraft.svelte';
  import FbBadgeHighlySensitive from '../components/fbBadgeHighlySensitive.svelte';
  import FbBloodPressure from '../components/fbBloodPressure.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbCheck from '../components/fbCheck.svelte';
  import FbDateHeightWeightBMIRow from '../components/fbDateHeightWeightBMIRow.svelte';
  import FbDropdown from '../components/fbDropdown.svelte';
  import FbExactDate from '../components/fbDateExact.svelte';
  import FbGridCell from '../components/fbGridCell.svelte';
  import FbGridRow from '../components/fbGridRow.svelte';
  import FbGroup from '../components/fbGroup.svelte';
  import FbInverseSubq from '../components/fbInverseSubq.svelte';
  import FbMSISelector from '../components/fbMSISelector.svelte';
  import FbNotificationTypeGroup from '../components/fbNotificationTypeGroup.svelte';
  import FbNumberInput from '../components/fbNumberInput.svelte';
  import FbPartialDate from '../components/fbDatePartial.svelte';
  import FbQuestion from '../components/fbQuestion.svelte';
  import FbRadio from '../components/fbRadio.svelte';
  import FbRoVField from '../components/fbRoVField.svelte';
  import FbSCTDiagnosis from '../components/fbSCTDiagnosis.svelte';
  import FbSCTProcedure from '../components/fbSCTProcedure.svelte';
  import FbSection from '../components/fbSection.svelte';
  import FbSmartDropdown from '../components/fbSmartDropdown.svelte';
  import FbSubqForOption from '../components/fbSubqForOption.svelte';
  import FbTextArea from '../components/fbTextArea.svelte';
  import FbTextInput from '../components/fbTextInput.svelte';
  import FbTime from '../components/fbTime.svelte';
  import FbUserName from '../components/fbUserName.svelte';

  let readOnlyView = false;
  let username = 'demoUser';
  let text = 'Example text';
  let time = '09:30';
  let textarea = 'A longer form note can expand over multiple lines.';
  let dropdown = 'option-one';
  let number = '42';
  let numberWithUnits = '12';
  let partialDate = 'Jun-2026';
  let exactDate = '14-Jun-2026';
  let radio = 'yes';
  let check = true;
  let msi = 'Example clinician';
  let msiCoded = false;
  let diagnosis = 'Example diagnosis';
  let diagnosisCoded = false;
  let procedure = 'Example procedure';
  let procedureCoded = false;
  let bloodPressure = { systolic: '128', diastolic: '82' };
  let erroredBloodPressure = { systolic: '220', diastolic: '120' };
  let bmiDate = '14-Jun-2026';
  let heightCm = '172';
  let weightKg = '74';
  let inverseCheck = false;
  let notificationType = 'inpatient-ed-non-specialist';
  let smartDropdown = 'option-one';
  let subqDropdown = 'other';

  function goHome() {
    window.location.href = 'index.html';
  }

  const dropdownOptions = [
    { value: '', label: '' },
    { value: 'option-one', label: 'Option one' },
    { value: 'option-two', label: 'Option two' },
  ];
</script>

<div class="component-library-shell">
  <header>
    <h1>
      <button type="button" aria-label="Back to app home" onclick={goHome}>
        {readOnlyView ? 'Component library RoV' : 'Component library'}
      </button>
    </h1>
  </header>

  <main id="component-library-main" aria-label={readOnlyView ? 'Component library read-only view' : 'Component library edit view'}>
    {#if !readOnlyView}
      <FbSection id="component-library-questions" title="Question components">
        <FbGridRow cols={3}>
          <FbGridCell><FbTextInput label="Text input" bind:value={text} required placeholder="Enter text" /></FbGridCell>
          <FbGridCell><FbTime label="Time" bind:value={time} required /></FbGridCell>
          <FbGridCell><FbDropdown label="Dropdown" bind:value={dropdown} required options={dropdownOptions} /></FbGridCell>
        </FbGridRow>

        <FbGridRow cols={3}>
          <FbGridCell><FbNumberInput label="Number input" bind:value={number} /></FbGridCell>
          <FbGridCell><FbNumberInput label="Number input with units" bind:value={numberWithUnits} units="mg" /></FbGridCell>
          <FbGridCell>
            <FbBloodPressure
              label="Blood pressure"
              systolic={bloodPressure.systolic}
              diastolic={bloodPressure.diastolic}
              onChange={(value) => (bloodPressure = value)}
              required
            />
          </FbGridCell>
        </FbGridRow>

        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbTextArea label="Text area" bind:value={textarea} required fullWidth /></FbGridCell>
          <FbGridCell>
            <FbGroup label="Radio group">
              <FbRadio name="component-library-radio" value="yes" checked={radio === 'yes'} label="Yes" onChange={(value) => (radio = value)} />
              <FbRadio name="component-library-radio" value="no" checked={radio === 'no'} label="No" onChange={(value) => (radio = value)} />
            </FbGroup>
            <FbGroup label="Checkbox group">
              <FbCheck name="component-library-check" checked={check} label="Checkbox option" onChange={(value) => (check = value)} />
            </FbGroup>
          </FbGridCell>
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-dates-selectors" title="Dates and selectors">
        <FbGridRow cols={3}>
          <FbGridCell><FbQuestion label="Partial date" required><FbPartialDate name="component-library-partial-date" bind:value={partialDate} showRequiredMarkers={false} /></FbQuestion></FbGridCell>
          <FbGridCell><FbQuestion label="Exact date" required><FbExactDate name="component-library-exact-date" bind:value={exactDate} showRequiredMarkers={false} /></FbQuestion></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbMSISelector label="Staff selector" name="component-library-msi" bind:value={msi} coded={msiCoded} onChange={(value, coded) => { msi = value; msiCoded = coded; }} /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbSCTDiagnosis label="SNOMED CT diagnosis" name="component-library-diagnosis" bind:value={diagnosis} coded={diagnosisCoded} onChange={(value, coded) => { diagnosis = value; diagnosisCoded = coded; }} /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbSCTProcedure label="SNOMED CT procedure" name="component-library-procedure" bind:value={procedure} coded={procedureCoded} onChange={(value, coded) => { procedure = value; procedureCoded = coded; }} /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-errors" title="Value errors">
        <FbGridRow cols={3}>
          <FbGridCell><FbTextInput label="Text input with error" value="" required valueError="Enter a reference number." /></FbGridCell>
          <FbGridCell><FbDropdown label="Dropdown with error" value="" options={[{ value: '', label: '' }, { value: 'one', label: 'One' }]} valueError="Select one option." /></FbGridCell>
          <FbGridCell>
            <FbBloodPressure
              label="Blood pressure with error"
              systolic={erroredBloodPressure.systolic}
              diastolic={erroredBloodPressure.diastolic}
              valueError="Blood pressure is outside the expected range."
              onChange={(value) => (erroredBloodPressure = value)}
            />
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbTextArea label="Text area with error" value="" valueError="Explain the reason for referral." fullWidth /></FbGridCell>
          <FbGridCell>
            <FbGroup label="Group with error" valueError="Select at least one response.">
              <FbCheck name="component-library-error-check" checked={false} label="Unchecked option" />
            </FbGroup>
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbMSISelector label="Staff selector with error" name="component-library-msi-error" value="Unconfirmed clinician" coded={false} valueError="Select a coded staff member." /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbSCTDiagnosis label="SNOMED CT diagnosis with error" name="component-library-diagnosis-error" value="Unconfirmed diagnosis" coded={false} valueError="Select a coded diagnosis." /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbSCTProcedure label="SNOMED CT procedure with error" name="component-library-procedure-error" value="Unconfirmed procedure" coded={false} valueError="Select a coded procedure." /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-required-for-audit" title="Required for audit">
        <FbGridRow cols={3}>
          <FbGridCell><FbTextInput label="Text input audit" bind:value={text} requiredForAudit placeholder="Enter text" /></FbGridCell>
          <FbGridCell><FbTime label="Time audit" bind:value={time} requiredForAudit /></FbGridCell>
          <FbGridCell><FbDropdown label="Dropdown audit" bind:value={dropdown} requiredForAudit options={dropdownOptions} /></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell><FbNumberInput label="Number audit" bind:value={number} requiredForAudit /></FbGridCell>
          <FbGridCell><FbNumberInput label="Number with units audit" bind:value={numberWithUnits} units="mg" requiredForAudit /></FbGridCell>
          <FbGridCell>
            <FbBloodPressure
              label="Blood pressure audit"
              systolic={bloodPressure.systolic}
              diastolic={bloodPressure.diastolic}
              required
              requiredForAudit
              onChange={(value) => (bloodPressure = value)}
            />
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbTextArea label="Text area audit" bind:value={textarea} requiredForAudit fullWidth /></FbGridCell>
          <FbGridCell>
            <FbGroup label="Radio group audit" requiredForAudit>
              <FbRadio name="component-library-rfa-radio" value="yes" checked={radio === 'yes'} label="Yes" onChange={(value) => (radio = value)} />
              <FbRadio name="component-library-rfa-radio" value="no" checked={radio === 'no'} label="No" onChange={(value) => (radio = value)} />
            </FbGroup>
            <FbGroup label="Checkbox group audit" requiredForAudit>
              <FbCheck name="component-library-rfa-check" checked={check} label="Checkbox option" onChange={(value) => (check = value)} />
            </FbGroup>
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell><FbQuestion label="Partial date audit" requiredForAudit><FbPartialDate name="component-library-rfa-partial-date" bind:value={partialDate} showRequiredMarkers={false} /></FbQuestion></FbGridCell>
          <FbGridCell><FbQuestion label="Exact date audit" requiredForAudit><FbExactDate name="component-library-rfa-exact-date" bind:value={exactDate} showRequiredMarkers={false} /></FbQuestion></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbMSISelector label="Staff selector audit" name="component-library-rfa-msi" bind:value={msi} coded={msiCoded} requiredForAudit onChange={(value, coded) => { msi = value; msiCoded = coded; }} /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbSCTDiagnosis label="SNOMED CT diagnosis audit" name="component-library-rfa-diagnosis" bind:value={diagnosis} coded={diagnosisCoded} requiredForAudit onChange={(value, coded) => { diagnosis = value; diagnosisCoded = coded; }} /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbSCTProcedure label="SNOMED CT procedure audit" name="component-library-rfa-procedure" bind:value={procedure} coded={procedureCoded} requiredForAudit onChange={(value, coded) => { procedure = value; procedureCoded = coded; }} /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-boxed-messages" title="Boxed messages">
        <div class="stack">
          <FbBoxedWarning text="This is an fbBoxedWarning message for prominent non-blocking warnings." />
          <FbBoxedAlert text="This is an fbBoxedAlert message for high-priority alerts." />
          <FbBoxedInfo text="This is an fbBoxedInfo message for supporting information." />
        </div>
      </FbSection>

      <FbSection id="component-library-new-form-components" title="Form specification components">
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbGroup label="Badges">
              <div class="badge-row">
                <FbBadgeDraft />
                <FbBadgeHighlySensitive />
              </div>
            </FbGroup>
          </FbGridCell>
          <FbGridCell span={2}>
            <FbGroup label="fbDateHeightWeightBMIRow">
              <FbDateHeightWeightBMIRow dateRecorded={bmiDate} heightCm={heightCm} weightKg={weightKg} onDateRecordedChange={(value) => (bmiDate = value)} onHeightCmChange={(value) => (heightCm = value)} onWeightKgChange={(value) => (weightKg = value)} />
            </FbGroup>
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbGroup label="fbInverseSubq">
              <FbCheck name="component-library-inverse-check" checked={inverseCheck} label="Test required on ward" onChange={(value) => (inverseCheck = value)} />
              <FbInverseSubq open={!inverseCheck}>
                <FbGroup label="Transport" required subfield>
                  <FbRadio name="component-library-transport" value="walking" checked={radio === 'walking'} label="Walking" onChange={(value) => (radio = value)} />
                  <FbRadio name="component-library-transport" value="chair" checked={radio === 'chair'} label="Chair" onChange={(value) => (radio = value)} />
                </FbGroup>
              </FbInverseSubq>
            </FbGroup>
          </FbGridCell>
          <FbGridCell>
            <FbNotificationTypeGroup value={notificationType} onChange={(value) => (notificationType = value)} />
          </FbGridCell>
          <FbGridCell>
            <FbSmartDropdown label="fbSmartDropdown" value={smartDropdown} onChange={(value) => (smartDropdown = value)} options={dropdownOptions} />
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbDropdown label="fbSubqForOption" value={subqDropdown} onChange={(value) => (subqDropdown = value)} options={[{ value: '', label: '' }, { value: 'standard', label: 'Standard' }, { value: 'other', label: 'Other' }]}>
              <FbSubqForOption optionValue="other" selectedValue={subqDropdown}>
                <FbTextInput label="Other details" bind:value={text} required />
              </FbSubqForOption>
            </FbDropdown>
          </FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
      </FbSection>
    {:else}
      <FbSection id="component-library-rov-questions" title="Question components">
        <FbGridRow cols={3}>
          <FbGridCell><FbRoVField label="Text input" value={text} preserveGridSpace /></FbGridCell>
          <FbGridCell><FbRoVField label="Time" value={time} preserveGridSpace /></FbGridCell>
          <FbGridCell><FbRoVField label="Dropdown" value={dropdown === 'option-one' ? 'Option one' : 'Option two'} preserveGridSpace /></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell><FbRoVField label="Number input" value={number} preserveGridSpace /></FbGridCell>
          <FbGridCell><FbRoVField label="Number input with units" value={`${numberWithUnits} mg`} preserveGridSpace /></FbGridCell>
          <FbGridCell><FbRoVField label="Blood pressure" value={`${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg`} preserveGridSpace /></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="Text area" value={textarea} preserveGridSpace /></FbGridCell>
          <FbGridCell>
            <FbRoVField label="Radio group" value={radio === 'yes' ? 'Yes' : 'No'} preserveGridSpace />
            <FbRoVField label="Checkbox group" value={check ? 'Checkbox option' : ''} preserveGridSpace />
          </FbGridCell>
        </FbGridRow>
      </FbSection>
      <FbSection id="component-library-rov-dates-selectors" title="Dates and selectors">
        <FbGridRow cols={3}>
          <FbGridCell><FbRoVField label="Partial date" value={partialDate} preserveGridSpace /></FbGridCell>
          <FbGridCell><FbRoVField label="Exact date" value={exactDate} preserveGridSpace /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="Staff selector" value={msi} coded={msiCoded} preserveGridSpace /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="SNOMED CT diagnosis" value={diagnosis} coded={diagnosisCoded} preserveGridSpace /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="SNOMED CT procedure" value={procedure} coded={procedureCoded} preserveGridSpace /></FbGridCell>
          <FbGridCell><div aria-hidden="true"></div></FbGridCell>
        </FbGridRow>
      </FbSection>
      <FbSection id="component-library-rov-boxed-messages" title="Boxed messages">
        <div class="stack">
          <FbBoxedWarning text="This is an fbBoxedWarning message for prominent non-blocking warnings." />
          <FbBoxedAlert text="This is an fbBoxedAlert message for high-priority alerts." />
          <FbBoxedInfo text="This is an fbBoxedInfo message for supporting information." />
        </div>
      </FbSection>
    {/if}
  </main>

  <footer aria-label="Component library controls" class="bottom-control-bar">
    <FbButton type="button" onClick={() => (readOnlyView = !readOnlyView)}>{readOnlyView ? 'EV' : 'RoV'}</FbButton>
    <div class="spacer"></div>
    <FbUserName bind:value={username} />
    <FbButton type="button" onClick={goHome}>Back</FbButton>
  </footer>
</div>

<style>
  .component-library-shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  header {
    flex-shrink: 0;
    background: white;
    border-bottom: 0.2rem solid var(--fb-blue);
    padding: 0.4rem 0.8rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 0;
  }

  h1 button {
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
    margin: 0;
    line-height: 2.2rem;
    cursor: pointer;
  }

  main {
    flex: 1;
    min-height: 0;
    padding: 1.5rem;
    overflow-y: auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.4rem;
    background: white;
    border-top: 0.2rem solid var(--fb-blue);
    min-height: 2.8rem;
    box-sizing: border-box;
  }

  .spacer {
    flex: 1;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .badge-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
</style>
