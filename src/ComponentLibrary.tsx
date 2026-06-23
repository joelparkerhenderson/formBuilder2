import * as React from 'react';
import { useNavigate } from 'react-router';
import { fbBloodPressure as FbBloodPressure } from './components/fbBloodPressure';
import { fbBoxedAlert as FbBoxedAlert, fbBoxedInfo as FbBoxedInfo, fbBoxedWarning as FbBoxedWarning } from './components/fbBoxedMessage';
import { fbButton as FbButton } from './components/fbButton';
import { fbCheck as FbCheck } from './components/fbCheck';
import { fbDropdown as FbDropdown } from './components/fbDropdown';
import { fbDateExact as FbExactDate } from './components/fbDateExact';
import { fbGridCell as FbGridCell } from './components/fbGridCell';
import { fbGridRow as FbGridRow } from './components/fbGridRow';
import { fbGroup as FbGroup } from './components/fbGroup';
import { fbMSISelector as FbMSISelector } from './components/fbMSISelector';
import { fbNumberInput as FbNumberInput } from './components/fbNumberInput';
import { fbDatePartial as FbPartialDate } from './components/fbDatePartial';
import { fbQuestion as FbQuestion } from './components/fbQuestion';
import { fbRadio as FbRadio } from './components/fbRadio';
import { fbRoVField as FbRoVField } from './components/fbRoVField';
import { fbSCTDiagnosis as FbSCTDiagnosis } from './components/fbSCTDiagnosis';
import { fbSCTProcedure as FbSCTProcedure } from './components/fbSCTProcedure';
import { fbSection as FbSection } from './components/fbSection';
import { fbTextArea as FbTextArea } from './components/fbTextArea';
import { fbTextInput as FbTextInput } from './components/fbTextInput';
import { fbTime as FbTime } from './components/fbTime';
import { fbUserName as FbUserName } from './components/fbUserName';

const EmptyCell = () => <FbGridCell><div aria-hidden="true" /></FbGridCell>;

export default function ComponentLibrary() {
  const navigate = useNavigate();
  const [readOnlyView, setReadOnlyView] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>('demoUser');
  const [text, setText] = React.useState<string>('Example text');
  const [time, setTime] = React.useState<string>('09:30');
  const [textarea, setTextarea] = React.useState<string>('A longer form note can expand over multiple lines.');
  const [dropdown, setDropdown] = React.useState<string>('option-one');
  const [number, setNumber] = React.useState<string>('42');
  const [numberWithUnits, setNumberWithUnits] = React.useState<string>('12');
  const [partialDate, setPartialDate] = React.useState<string>('Jun-2026');
  const [exactDate, setExactDate] = React.useState<string>('14-Jun-2026');
  const [radio, setRadio] = React.useState<string>('yes');
  const [check, setCheck] = React.useState<boolean>(true);
  const [msi, setMsi] = React.useState<string>('Example clinician');
  const [msiCoded, setMsiCoded] = React.useState<boolean>(false);
  const [diagnosis, setDiagnosis] = React.useState<string>('Example diagnosis');
  const [diagnosisCoded, setDiagnosisCoded] = React.useState<boolean>(false);
  const [procedure, setProcedure] = React.useState<string>('Example procedure');
  const [procedureCoded, setProcedureCoded] = React.useState<boolean>(false);
  const [bloodPressure, setBloodPressure] = React.useState({ systolic: '128', diastolic: '82' });
  const [erroredBloodPressure, setErroredBloodPressure] = React.useState({ systolic: '220', diastolic: '120' });

  React.useEffect(() => {
    sessionStorage.setItem('fb_prev_main_page', '/components.html');
    document.title = 'Component library';
    document.body.classList.toggle('read-only-view', readOnlyView);
    return () => document.body.classList.remove('read-only-view');
  }, [readOnlyView]);

  const toggleReadOnlyView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setReadOnlyView((current) => !current);
    event.currentTarget.blur();
  };

  const goHome = () => navigate('/');

  const groupLabelStyle = { fontWeight: 500 };
  const dropdownOptions = [
    { value: '', label: '' },
    { value: 'option-one', label: 'Option one' },
    { value: 'option-two', label: 'Option two' },
  ];

  const renderEditContent = () => (
    <>
      <FbSection id="component-library-questions" title="Question components">
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbTextInput label="Text input" value={text} onChange={setText} required placeholder="Enter text" />
          </FbGridCell>
          <FbGridCell>
            <FbTime label="Time" value={time} onChange={setTime} required />
          </FbGridCell>
          <FbGridCell>
            <FbDropdown
              label="Dropdown"
              value={dropdown}
              onChange={setDropdown}
              required
              options={[
                { value: '', label: '' },
                { value: 'option-one', label: 'Option one' },
                { value: 'option-two', label: 'Option two' },
              ]}
            />
          </FbGridCell>
        </FbGridRow>

        <FbGridRow cols={3}>
          <FbGridCell>
            <FbNumberInput label="Number input" value={number} onChange={setNumber} required />
          </FbGridCell>
          <FbGridCell>
            <FbNumberInput label="Number input with units" value={numberWithUnits} onChange={setNumberWithUnits} units="mg" required />
          </FbGridCell>
          <FbGridCell>
            <FbBloodPressure label="Blood pressure" systolic={bloodPressure.systolic} diastolic={bloodPressure.diastolic} onChange={setBloodPressure} required />
          </FbGridCell>
        </FbGridRow>

        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbTextArea label="Text area" value={textarea} onChange={setTextarea} required fullWidth />
          </FbGridCell>
          <FbGridCell>
            <FbGroup label="Radio group" labelStyle={groupLabelStyle}>
              <FbRadio name="component-library-radio" value="yes" checked={radio === 'yes'} onChange={() => setRadio('yes')} label="Yes" />
              <FbRadio name="component-library-radio" value="no" checked={radio === 'no'} onChange={() => setRadio('no')} label="No" />
            </FbGroup>
            <FbGroup label="Checkbox group" labelStyle={groupLabelStyle}>
              <FbCheck name="component-library-check" checked={check} onChange={(event) => setCheck(event.target.checked)} label="Checkbox option" />
            </FbGroup>
          </FbGridCell>
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-dates-selectors" title="Dates and selectors">
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbQuestion label="Partial date" required>
              <FbPartialDate name="component-library-partial-date" value={partialDate} onChange={setPartialDate} showRequiredMarkers={false} />
            </FbQuestion>
          </FbGridCell>
          <FbGridCell>
            <FbQuestion label="Exact date" required>
              <FbExactDate name="component-library-exact-date" value={exactDate} onChange={setExactDate} showRequiredMarkers={false} />
            </FbQuestion>
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbMSISelector label="Staff selector" name="component-library-msi" value={msi} coded={msiCoded} onChange={(value, coded) => { setMsi(value); setMsiCoded(coded); }} />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbSCTDiagnosis label="SNOMED CT diagnosis" name="component-library-diagnosis" value={diagnosis} coded={diagnosisCoded} onChange={(value, coded) => { setDiagnosis(value); setDiagnosisCoded(coded); }} />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbSCTProcedure label="SNOMED CT procedure" name="component-library-procedure" value={procedure} coded={procedureCoded} onChange={(value, coded) => { setProcedure(value); setProcedureCoded(coded); }} />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-errors" title="Value errors">
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbTextInput label="Text input with error" value="" onChange={() => undefined} required valueError="Enter a reference number." />
          </FbGridCell>
          <FbGridCell>
            <FbDropdown label="Dropdown with error" value="" onChange={() => undefined} options={[{ value: '', label: '' }, { value: 'one', label: 'One' }]} valueError="Select one option." />
          </FbGridCell>
          <FbGridCell>
            <FbBloodPressure label="Blood pressure with error" systolic={erroredBloodPressure.systolic} diastolic={erroredBloodPressure.diastolic} onChange={setErroredBloodPressure} valueError="Blood pressure is outside the expected range." />
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbTextArea label="Text area with error" value="" onChange={() => undefined} valueError="Explain the reason for referral." fullWidth />
          </FbGridCell>
          <FbGridCell>
            <FbGroup label="Group with error" labelStyle={groupLabelStyle} valueError="Select at least one response.">
              <FbCheck name="component-library-error-check" checked={false} onChange={() => undefined} label="Unchecked option" />
            </FbGroup>
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbMSISelector label="Staff selector with error" name="component-library-msi-error" value="Unconfirmed clinician" coded={false} onChange={() => undefined} valueError="Select a coded staff member." />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbSCTDiagnosis label="SNOMED CT diagnosis with error" name="component-library-diagnosis-error" value="Unconfirmed diagnosis" coded={false} onChange={() => undefined} valueError="Select a coded diagnosis." />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbSCTProcedure label="SNOMED CT procedure with error" name="component-library-procedure-error" value="Unconfirmed procedure" coded={false} onChange={() => undefined} valueError="Select a coded procedure." />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-required-for-audit" title="Required for audit">
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbTextInput label="Text input audit" value={text} onChange={setText} requiredForAudit placeholder="Enter text" />
          </FbGridCell>
          <FbGridCell>
            <FbTime label="Time audit" value={time} onChange={setTime} requiredForAudit />
          </FbGridCell>
          <FbGridCell>
            <FbDropdown label="Dropdown audit" value={dropdown} onChange={setDropdown} requiredForAudit options={dropdownOptions} />
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbNumberInput label="Number audit" value={number} onChange={setNumber} requiredForAudit />
          </FbGridCell>
          <FbGridCell>
            <FbNumberInput label="Number with units audit" value={numberWithUnits} onChange={setNumberWithUnits} units="mg" requiredForAudit />
          </FbGridCell>
          <FbGridCell>
            <FbBloodPressure label="Blood pressure audit" systolic={bloodPressure.systolic} diastolic={bloodPressure.diastolic} onChange={setBloodPressure} requiredForAudit />
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbTextArea label="Text area audit" value={textarea} onChange={setTextarea} requiredForAudit fullWidth />
          </FbGridCell>
          <FbGridCell>
            <FbGroup label="Radio group audit" labelStyle={groupLabelStyle} requiredForAudit>
              <FbRadio name="component-library-rfa-radio" value="yes" checked={radio === 'yes'} onChange={() => setRadio('yes')} label="Yes" />
              <FbRadio name="component-library-rfa-radio" value="no" checked={radio === 'no'} onChange={() => setRadio('no')} label="No" />
            </FbGroup>
            <FbGroup label="Checkbox group audit" labelStyle={groupLabelStyle} requiredForAudit>
              <FbCheck name="component-library-rfa-check" checked={check} onChange={(event) => setCheck(event.target.checked)} label="Checkbox option" />
            </FbGroup>
          </FbGridCell>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell>
            <FbQuestion label="Partial date audit" requiredForAudit>
              <FbPartialDate name="component-library-rfa-partial-date" value={partialDate} onChange={setPartialDate} showRequiredMarkers={false} />
            </FbQuestion>
          </FbGridCell>
          <FbGridCell>
            <FbQuestion label="Exact date audit" requiredForAudit>
              <FbExactDate name="component-library-rfa-exact-date" value={exactDate} onChange={setExactDate} showRequiredMarkers={false} />
            </FbQuestion>
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbMSISelector label="Staff selector audit" name="component-library-rfa-msi" value={msi} coded={msiCoded} requiredForAudit onChange={(value, coded) => { setMsi(value); setMsiCoded(coded); }} />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbSCTDiagnosis label="SNOMED CT diagnosis audit" name="component-library-rfa-diagnosis" value={diagnosis} coded={diagnosisCoded} requiredForAudit onChange={(value, coded) => { setDiagnosis(value); setDiagnosisCoded(coded); }} />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}>
            <FbSCTProcedure label="SNOMED CT procedure audit" name="component-library-rfa-procedure" value={procedure} coded={procedureCoded} requiredForAudit onChange={(value, coded) => { setProcedure(value); setProcedureCoded(coded); }} />
          </FbGridCell>
          <EmptyCell />
        </FbGridRow>
      </FbSection>

      <FbSection id="component-library-boxed-messages" title="Boxed messages">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <FbBoxedWarning text="This is an fbBoxedWarning message for prominent non-blocking warnings." />
          <FbBoxedAlert text="This is an fbBoxedAlert message for high-priority alerts." />
          <FbBoxedInfo text="This is an fbBoxedInfo message for supporting information." />
        </div>
      </FbSection>
    </>
  );

  const renderReadOnlyContent = () => (
    <>
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
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="Staff selector" value={msi} coded={msiCoded} preserveGridSpace /></FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="SNOMED CT diagnosis" value={diagnosis} coded={diagnosisCoded} preserveGridSpace /></FbGridCell>
          <EmptyCell />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="SNOMED CT procedure" value={procedure} coded={procedureCoded} preserveGridSpace /></FbGridCell>
          <EmptyCell />
        </FbGridRow>
      </FbSection>
      <FbSection id="component-library-rov-boxed-messages" title="Boxed messages">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <FbBoxedWarning text="This is an fbBoxedWarning message for prominent non-blocking warnings." />
          <FbBoxedAlert text="This is an fbBoxedAlert message for high-priority alerts." />
          <FbBoxedInfo text="This is an fbBoxedInfo message for supporting information." />
        </div>
      </FbSection>
    </>
  );

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: 'white',
      }}
    >
      <header
        className="flex-shrink-0"
        style={{
          backgroundColor: 'white',
          borderBottom: '0.2rem solid rgb(27, 110, 194)',
          padding: '0.4rem 0.8rem',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1
          style={{
            margin: 0,
          }}
        >
          <button
            type="button"
            onClick={goHome}
            aria-label="Back to app home"
            style={{
              appearance: 'none',
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: "'Roboto', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#333',
              margin: 0,
              lineHeight: '2.2rem',
              cursor: 'pointer',
            }}
          >
            {readOnlyView ? 'Component library RoV' : 'Component library'}
          </button>
        </h1>
      </header>

      <main id="component-library-main" aria-label={readOnlyView ? 'Component library read-only view' : 'Component library edit view'} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {readOnlyView ? renderReadOnlyContent() : renderEditContent()}
      </main>

      <footer
        aria-label="Component library controls"
        className="bottom-control-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.4rem',
          backgroundColor: 'white',
          borderTop: '0.2rem solid rgb(27, 110, 194)',
          minHeight: '2.8rem',
          boxSizing: 'border-box',
        }}
      >
        <FbButton type="button" variant="primary" onClick={toggleReadOnlyView} style={{ marginLeft: '0.2rem', padding: '0 0.5rem' }}>
          {readOnlyView ? 'EV' : 'RoV'}
        </FbButton>
        <div style={{ flex: 1 }} />
        <FbUserName value={username} onChange={setUsername} />
        <FbButton variant="primary" onClick={() => navigate('/')}>
          Back
        </FbButton>
      </footer>
    </div>
  );
}
