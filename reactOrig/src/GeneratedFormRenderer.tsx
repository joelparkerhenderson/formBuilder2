import * as React from 'react';
import { fbBloodPressure as FbBloodPressure } from './components/fbBloodPressure';
import { fbBoxedAlert as FbBoxedAlert, fbBoxedInfo as FbBoxedInfo, fbBoxedWarning as FbBoxedWarning } from './components/fbBoxedMessage';
import { fbDropdown as FbDropdown } from './components/fbDropdown';
import { fbDateHeightWeightBMIRow as FbDateHeightWeightBMIRow } from './components/fbDateHeightWeightBMIRow';
import { fbGroup as FbGroup } from './components/fbGroup';
import { fbInverseSubq as FbInverseSubq } from './components/fbInverseSubq';
import { fbMSISelector as MSISelector } from './components/fbMSISelector';
import { fbNotificationTypeGroup as FbNotificationTypeGroup } from './components/fbNotificationTypeGroup';
import { fbDateExact as FbExactDate } from './components/fbDateExact';
import { fbDatePartial as FbPartialDate } from './components/fbDatePartial';
import { fbQuestion as FbQuestion } from './components/fbQuestion';
import { fbGridRow as FbGridRow } from './components/fbGridRow';
import { fbGridCell as FbGridCell } from './components/fbGridCell';
import { fbCheck as FbCheck } from './components/fbCheck';
import { fbRadio as FbRadio } from './components/fbRadio';
import { fbReadOnly as FbReadOnly, isFbReadOnlyEmptyValue } from './components/fbReadOnly';
import { fbSCTDiagnosis as SCTDiagnosis } from './components/fbSCTDiagnosis';
import { fbSCTProcedure as SCTProcedure } from './components/fbSCTProcedure';
import { fbSection as FbSection } from './components/fbSection';
import { fbSmartDropdown as FbSmartDropdown } from './components/fbSmartDropdown';
import { fbTextArea as FbTextArea } from './components/fbTextArea';
import { fbTextInput as FbTextInput } from './components/fbTextInput';
import { fbTime as FbTime } from './components/fbTime';
import { DesignerComponentSpec, DesignerFormSpec, DesignerOption } from './treatmentSummarySpec';
import { calculateBmi } from './utils/bmi';

type FormState = Record<string, any>;

const fieldTypes = new Set(['fbBloodPressure', 'fbDropdown', 'fbSmartDropdown', 'fbDateExact', 'fbMSISelector', 'fbNumberInput', 'fbNumberInputWithUnits', 'fbDatePartial', 'fbSCTDiagnosis', 'fbSCTProcedure', 'fbTextArea', 'fbTextInput', 'fbTime', 'fbNotificationTypeGroup']);

export const cleanDesignerLabel = (label = '') => label.replace(/\*+$/g, '').trim();

const asOptions = (options?: DesignerOption[]) => options && options.length > 0 ? options : [];

const componentType = (component: DesignerComponentSpec) => {
  if (component.type === 'fbQuestionRow') return 'fbGridRow';
  if (component.type === 'fbQuestionRowCell') return 'fbGridCell';
  return component.type;
};

const optionLookup = (component: DesignerComponentSpec) => {
  const lookup: Record<string, string> = {};
  asOptions(component.options).forEach((option) => {
    lookup[option.value] = option.label;
  });
  component.children?.forEach((child) => {
    lookup[child.id] = cleanDesignerLabel(child.label);
  });
  return lookup;
};

const bmiKeys = (component: DesignerComponentSpec) => ({
  dateRecorded: `${component.id}-dateRecorded`,
  heightCm: `${component.id}-heightCm`,
  weightKg: `${component.id}-weightKg`,
});

export const designerSections = (spec: DesignerFormSpec) => spec.components
  .filter((component) => component.type === 'fbSection')
  .map((component) => ({ id: component.id, name: cleanDesignerLabel(component.label), requiredFields: requiredFieldIds(component) }));

export function requiredFieldIds(component: DesignerComponentSpec): string[] {
  const current = (component.required && (fieldTypes.has(component.type) || component.type === 'fbGroup')) ? [component.id] : [];
  return [...current, ...(component.children || []).flatMap(requiredFieldIds)];
}

export function defaultFormState(spec: DesignerFormSpec): FormState {
  const defaults: FormState = {};
  const visit = (component: DesignerComponentSpec) => {
    if (fieldTypes.has(component.type) || component.type === 'fbGroup') {
      defaults[component.id] = typeof component.defaultValue === 'string' ? component.defaultValue : '';
    }
    component.children?.forEach(visit);
  };
  spec.components.forEach(visit);
  return defaults;
}

interface EditProps {
  spec: DesignerFormSpec;
  formState: FormState;
  onChange: (fieldName: string, value: any, coded?: boolean, nadexId?: string) => void;
}

export const GeneratedEditForm: React.FC<EditProps> = ({ spec, formState, onChange }) => {
  const renderComponent = (component: DesignerComponentSpec, subfield = false): React.ReactNode => {
    const label = cleanDesignerLabel(component.label);

    const type = componentType(component);

    if (type === 'fbSection') {
      return (
        <FbSection key={component.id} id={component.id} title={label}>
          {component.children?.map((child) => renderComponent(child, subfield))}
        </FbSection>
      );
    }

    if (type === 'fbGridRow') {
      const children = component.children || [];
      const cols = Math.max(1, Math.min(12, children.reduce((sum, child) => sum + Math.max(1, Number(child.colSpan || 1)), 0))) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
      return (
        <FbGridRow key={component.id} cols={cols}>
          {children.map((child) => renderComponent(child, subfield))}
        </FbGridRow>
      );
    }

    if (type === 'fbGridCell') {
      return (
        <FbGridCell key={component.id} id={component.id} span={component.colSpan || 1}>
          {component.children?.map((child) => renderComponent(child, subfield))}
        </FbGridCell>
      );
    }

    if (type === 'fbInverseSubq' || type === 'fbSubqForOption') {
      return <React.Fragment key={component.id}>{component.children?.map((child) => renderComponent(child, true))}</React.Fragment>;
    }

    if (type === 'fbGroup') {
      return (
        <FbGroup
          key={component.id}
          label={label}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          valueError={component.valueError}
          labelStyle={{ fontWeight: subfield ? 300 : 500 }}
        >
          {component.children?.map((child) => {
            const checked = child.type === 'fbCheck'
              ? formState[child.id] === 'checked'
              : formState[component.id] === child.id;
            const normalChildren = (child.children || []).filter((grandChild) => grandChild.type !== 'fbInverseSubq');
            const inverseChildren = (child.children || []).filter((grandChild) => grandChild.type === 'fbInverseSubq');
            const childContent = (
              <>
                {normalChildren.map((grandChild) => renderComponent(grandChild, true))}
                {inverseChildren.length > 0 && (
                  <FbInverseSubq open={!checked}>
                    {inverseChildren.map((grandChild) => renderComponent(grandChild, true))}
                  </FbInverseSubq>
                )}
              </>
            );
            if (child.type === 'fbCheck') {
              return (
                <FbCheck
                  key={child.id}
                  id={child.id}
                  name={child.id}
                  value={child.id}
                  checked={checked}
                  onChange={(event) => onChange(child.id, event.target.checked ? 'checked' : '')}
                  label={cleanDesignerLabel(child.label)}
                  required={component.required}
                  requiredForAudit={component.requiredForAudit}
                  showRequiredMarkers={false}
                >
                  {childContent}
                </FbCheck>
              );
            }
            return (
              <FbRadio
                key={child.id}
                id={child.id}
                name={component.id}
                value={child.id}
                checked={checked}
                onChange={() => onChange(component.id, child.id)}
                label={cleanDesignerLabel(child.label)}
                required={component.required}
                requiredForAudit={component.requiredForAudit}
                showRequiredMarkers={false}
              >
                {childContent}
              </FbRadio>
            );
          })}
        </FbGroup>
      );
    }

    if (component.type === 'fbBoxedWarning') {
      return <FbBoxedWarning key={component.id} text={label} />;
    }

    if (component.type === 'fbBoxedAlert') {
      return <FbBoxedAlert key={component.id} text={label} />;
    }

    if (component.type === 'fbBoxedInfo') {
      return <FbBoxedInfo key={component.id} text={label} />;
    }

    if (component.type === 'fbBloodPressure') {
      const value = formState[component.id] || {};
      return (
        <FbBloodPressure
          key={component.id}
          id={component.id}
          label={label}
          systolic={value.systolic || ''}
          diastolic={value.diastolic || ''}
          onChange={(nextValue) => onChange(component.id, nextValue)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          valueError={component.valueError}
        />
      );
    }

    if (component.type === 'fbDateHeightWeightBMIRow') {
      const keys = bmiKeys(component);
      return (
        <FbDateHeightWeightBMIRow
          key={component.id}
          dateRecorded={formState[keys.dateRecorded] || ''}
          heightCm={formState[keys.heightCm] || ''}
          weightKg={formState[keys.weightKg] || ''}
          onDateRecordedChange={(value) => onChange(keys.dateRecorded, value)}
          onHeightCmChange={(value) => onChange(keys.heightCm, value)}
          onWeightKgChange={(value) => onChange(keys.weightKg, value)}
        />
      );
    }

    if (component.type === 'fbNotificationTypeGroup') {
      return (
        <FbNotificationTypeGroup
          key={component.id}
          name={component.id}
          value={formState[component.id] || ''}
          onChange={(value) => onChange(component.id, value)}
          subfield={subfield}
        />
      );
    }

    if (component.type === 'fbDropdown') {
      const value = formState[component.id] || '';
      return (
        <FbDropdown
          key={component.id}
          id={component.id}
          label={label}
          value={value}
          onChange={(value) => onChange(component.id, value)}
          options={asOptions(component.options)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          valueError={component.valueError}
          placeholder=""
          fullWidth={component.fullWidth}
          noWidthConstraint={component.noWidthConstraint}
          subfield={subfield}
        >
          {component.children?.filter((child) => child.type !== 'fbSubqForOption' || child.optionValue === value).map((child) => renderComponent(child, true))}
        </FbDropdown>
      );
    }

    if (component.type === 'fbSmartDropdown') {
      const value = formState[component.id] || '';
      return (
        <FbSmartDropdown
          key={component.id}
          id={component.id}
          name={component.id}
          label={label}
          value={value}
          onChange={(nextValue) => onChange(component.id, nextValue)}
          options={asOptions(component.options)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          placeholder={component.placeholder || undefined}
          fullWidth={component.fullWidth}
          noWidthConstraint={component.noWidthConstraint}
          valueError={component.valueError}
          subfield={subfield}
        >
          {component.children?.filter((child) => child.type !== 'fbSubqForOption' || child.optionValue === value).map((child) => renderComponent(child, true))}
        </FbSmartDropdown>
      );
    }

    if (component.type === 'fbReadOnly') {
      return (
        <FbReadOnly
          key={component.id}
          label={label}
          value={component.defaultValue || formState[component.id] || ''}
          units={component.units}
          preserveGridSpace
          bigLabel={!!component.bigLabel}
          boldLabel={!!component.boldLabel}
        />
      );
    }

    if (component.type === 'fbTextArea') {
      return (
        <FbTextArea
          key={component.id}
          id={component.id}
          label={label}
          value={formState[component.id] || ''}
          onChange={(value) => onChange(component.id, value)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          placeholder={component.placeholder || ''}
          fullWidth={component.fullWidth}
          valueError={component.valueError}
          subfield={subfield}
        />
      );
    }

    if (component.type === 'fbTextInput') {
      return (
        <FbTextInput
          key={component.id}
          id={component.id}
          label={label}
          value={formState[component.id] || ''}
          onChange={(value) => onChange(component.id, value)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          placeholder={component.placeholder || ''}
          valueError={component.valueError}
          subfield={subfield}
        />
      );
    }

    if (component.type === 'fbNumberInput' || component.type === 'fbNumberInputWithUnits') {
      return (
        <FbQuestion key={component.id} label={label} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} labelStyle={subfield ? { fontWeight: 300 } : undefined}>
          <input
            id={component.id}
            type="number"
            value={formState[component.id] || ''}
            onChange={(event) => onChange(component.id, event.target.value)}
            required={component.required}
            placeholder={component.placeholder || ''}
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '1rem',
              fontWeight: 400,
              border: '0.1rem solid silver',
              borderRadius: '0.4rem',
              boxSizing: 'border-box',
              height: '2rem',
              maxWidth: component.type === 'fbNumberInputWithUnits' ? 'calc(10ch + 5rem)' : '10ch',
              padding: '0.2rem 0.4rem',
              backgroundColor: 'white',
            }}
          />
          {component.type === 'fbNumberInputWithUnits' && component.units && (
            <span style={{ marginLeft: '0.4rem', fontWeight: 300 }}>{component.units}</span>
          )}
        </FbQuestion>
      );
    }

    if (component.type === 'fbTime') {
      return (
        <FbTime
          key={component.id}
          id={component.id}
          label={label}
          value={formState[component.id] || ''}
          onChange={(value) => onChange(component.id, value)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          placeholder={component.placeholder || ''}
          valueError={component.valueError}
          subfield={subfield}
        />
      );
    }

    if (component.type === 'fbDatePartial') {
      return (
        <FbQuestion key={component.id} label={label} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} labelStyle={subfield ? { fontWeight: 300 } : undefined}>
          <FbPartialDate
            name={component.id}
            value={formState[component.id] || ''}
            onChange={(value) => onChange(component.id, value)}
            required={component.required}
            requiredForAudit={component.requiredForAudit}
            showRequiredMarkers={false}
            placeholder={component.placeholder || undefined}
          />
        </FbQuestion>
      );
    }

    if (component.type === 'fbDateExact') {
      return (
        <FbQuestion key={component.id} label={label} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} labelStyle={subfield ? { fontWeight: 300 } : undefined}>
          <FbExactDate
            name={component.id}
            value={formState[component.id] || ''}
            onChange={(value) => onChange(component.id, value)}
            required={component.required}
            requiredForAudit={component.requiredForAudit}
            showRequiredMarkers={false}
          />
        </FbQuestion>
      );
    }

    if (component.type === 'fbMSISelector') {
      return (
        <MSISelector
          key={component.id}
          label={label}
          name={component.id}
          value={formState[component.id] || ''}
          coded={!!formState[`${component.id}_coded`]}
          onChange={(value, coded, nadexId) => onChange(component.id, value, coded, nadexId)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          valueError={component.valueError}
          subfield={subfield}
        />
      );
    }

    if (component.type === 'fbSCTDiagnosis') {
      return (
        <SCTDiagnosis
          key={component.id}
          label={label}
          name={component.id}
          value={formState[component.id] || ''}
          coded={!!formState[`${component.id}_coded`]}
          onChange={(value, coded) => onChange(component.id, value, coded)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          valueError={component.valueError}
          subfield={subfield}
        />
      );
    }

    if (component.type === 'fbSCTProcedure') {
      return (
        <SCTProcedure
          key={component.id}
          label={label}
          name={component.id}
          value={formState[component.id] || ''}
          coded={!!formState[`${component.id}_coded`]}
          onChange={(value, coded) => onChange(component.id, value, coded)}
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          valueError={component.valueError}
          subfield={subfield}
        />
      );
    }

    return null;
  };

  return <>{spec.components.map((component) => renderComponent(component))}</>;
};

interface RoVProps {
  spec: DesignerFormSpec;
  formState: FormState;
}

export const GeneratedReadOnlyForm: React.FC<RoVProps> = ({ spec, formState }) => {
  const hasRoVData = (component: DesignerComponentSpec): boolean => {
    const type = componentType(component);
    if (type === 'fbSection' || type === 'fbGridRow' || type === 'fbGridCell') {
      return (component.children || []).some(hasRoVData);
    }
    if (type === 'fbGroup') {
      return !isFbReadOnlyEmptyValue(formState[component.id]);
    }
    if (type === 'fbDateHeightWeightBMIRow') {
      const keys = bmiKeys(component);
      return [keys.dateRecorded, keys.heightCm, keys.weightKg].some((key) => !isFbReadOnlyEmptyValue(formState[key]));
    }
    if (type === 'fbReadOnly') {
      return !isFbReadOnlyEmptyValue(component.defaultValue || formState[component.id]);
    }
    if (component.type === 'fbBloodPressure') {
      const value = formState[component.id];
      const displayValue = value && typeof value === 'object'
        ? [value.systolic, value.diastolic].filter(Boolean).join('/')
        : value;
      return !isFbReadOnlyEmptyValue(displayValue);
    }

    if (fieldTypes.has(component.type)) {
      return !isFbReadOnlyEmptyValue(formState[component.id]);
    }
    return false;
  };

  const renderComponent = (component: DesignerComponentSpec): React.ReactNode => {
    const label = cleanDesignerLabel(component.label);
    const type = componentType(component);

    if (type === 'fbSection') {
      if (!hasRoVData(component)) return null;
      return (
        <div key={component.id} id={component.id} style={{ marginBottom: '0.8rem' }}>
          <h3 className="font-bold text-white" style={{
            backgroundColor: 'rgb(27, 110, 194)',
            fontWeight: 500,
            padding: '0.2rem',
            paddingLeft: '0.4rem',
            margin: 0,
          }}>{label}</h3>
          <div style={{ marginTop: '0.4rem' }}>{component.children?.map(renderComponent)}</div>
        </div>
      );
    }

    if (type === 'fbGridRow') {
      const children = component.children || [];
      const cols = Math.max(1, Math.min(6, children.reduce((sum, child) => sum + Math.max(1, Number(child.colSpan || 1)), 0))) as 1 | 2 | 3 | 4 | 5 | 6;
      return (
        <FbGridRow key={component.id} cols={cols}>
          {children.map(renderComponent)}
        </FbGridRow>
      );
    }

    if (type === 'fbGridCell') {
      return (
        <FbGridCell key={component.id} id={component.id} span={component.colSpan || 1}>
          {component.children?.map(renderComponent)}
        </FbGridCell>
      );
    }

    if (type === 'fbInverseSubq' || type === 'fbSubqForOption') {
      return <React.Fragment key={component.id}>{component.children?.map(renderComponent)}</React.Fragment>;
    }

    if (type === 'fbGroup') {
      const lookup = optionLookup(component);
      return <FbReadOnly key={component.id} label={label} value={formState[component.id]} lookupTable={lookup} preserveGridSpace />;
    }

    if (component.type === 'fbBoxedWarning') {
      return <FbBoxedWarning key={component.id} text={label} />;
    }

    if (component.type === 'fbBoxedAlert') {
      return <FbBoxedAlert key={component.id} text={label} />;
    }

    if (component.type === 'fbBoxedInfo') {
      return <FbBoxedInfo key={component.id} text={label} />;
    }

    if (component.type === 'fbBloodPressure') {
      const value = formState[component.id];
      const displayValue = value && typeof value === 'object'
        ? [value.systolic, value.diastolic].filter(Boolean).join('/') + (value.systolic || value.diastolic ? ' mmHg' : '')
        : value;
      return <FbReadOnly key={component.id} label={label} value={displayValue} preserveGridSpace />;
    }

    if (component.type === 'fbDateHeightWeightBMIRow') {
      const keys = bmiKeys(component);
      const bmi = calculateBmi(formState[keys.heightCm] || '', formState[keys.weightKg] || '');
      return (
        <FbGridRow key={component.id} cols={4}>
          <FbGridCell>
            <FbReadOnly label="Date recorded" value={formState[keys.dateRecorded]} preserveGridSpace />
          </FbGridCell>
          <FbGridCell>
            <FbReadOnly label="Height" value={formState[keys.heightCm]} units="cm" preserveGridSpace />
          </FbGridCell>
          <FbGridCell>
            <FbReadOnly label="Weight" value={formState[keys.weightKg]} units="kg" preserveGridSpace />
          </FbGridCell>
          <FbGridCell>
            <FbReadOnly label="Uncertified calculated BMI (kg/m2)" value={bmi === null ? '' : String(bmi)} preserveGridSpace bigLabel />
          </FbGridCell>
        </FbGridRow>
      );
    }

    if (component.type === 'fbReadOnly') {
      return (
        <FbReadOnly
          key={component.id}
          label={label}
          value={component.defaultValue || formState[component.id] || ''}
          units={component.units}
          preserveGridSpace
          bigLabel={!!component.bigLabel}
          boldLabel={!!component.boldLabel}
        />
      );
    }

    if (fieldTypes.has(component.type)) {
      const value = formState[component.id];
      const coded = component.type === 'fbMSISelector' || component.type === 'fbSCTDiagnosis' || component.type === 'fbSCTProcedure'
        ? !!formState[`${component.id}_coded`]
        : undefined;
      return (
        <FbReadOnly
          key={component.id}
          label={label}
          value={value}
          lookupTable={optionLookup(component)}
          units={component.type === 'fbNumberInputWithUnits' ? component.units : undefined}
          coded={coded}
          bigLabel={!!component.bigLabel}
          boldLabel={!!component.boldLabel}
          preserveGridSpace
        />
      );
    }

    if (component.children?.length) return <React.Fragment key={component.id}>{component.children.map(renderComponent)}</React.Fragment>;
    return null;
  };

  const hasAnyValue = Object.values(formState).some((value) => !isFbReadOnlyEmptyValue(value)) || spec.components.some(hasRoVData);
  if (!hasAnyValue) return <div style={{ color: '#666', fontStyle: 'italic' }}>No form values recorded.</div>;
  return <>{spec.components.map(renderComponent)}</>;
};
