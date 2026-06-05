import * as React from 'react';
import { fbDropdown as FbDropdown } from './components/fbDropdown';
import { fbGroup as FbGroup } from './components/fbGroup';
import { fbMSISelector as MSISelector } from './components/fbMSISelector';
import { fbQuestion as FbQuestion } from './components/fbQuestion';
import { fbQuestionRow as FbQuestionRow } from './components/fbQuestionRow';
import { fbQuestionRowCell as FbQuestionRowCell } from './components/fbQuestionRowCell';
import { fbRadio as FbRadio } from './components/fbRadio';
import { fbRoVField as FbRoVField, isFbRoVEmptyValue } from './components/fbRoVField';
import { fbSCTDiagnosis as SCTDiagnosis } from './components/fbSCTDiagnosis';
import { fbSection as FbSection } from './components/fbSection';
import { fbTextArea as FbTextArea } from './components/fbTextArea';
import { fbTextInput as FbTextInput } from './components/fbTextInput';
import { DesignerComponentSpec, DesignerFormSpec, DesignerOption } from './treatmentSummarySpec';

type FormState = Record<string, any>;

const fieldTypes = new Set(['fbDropdown', 'fbMSISelector', 'fbSCTDiagnosis', 'fbTextArea', 'fbTextInput']);

export const cleanDesignerLabel = (label = '') => label.replace(/\*+$/g, '').trim();

const asOptions = (options?: DesignerOption[]) => options && options.length > 0 ? options : [];

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

const groupLabel = (component: DesignerComponentSpec) => (
  <>
    <span style={{ fontWeight: 500 }}>{cleanDesignerLabel(component.label)}</span>
    {component.required && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}
  </>
);

interface EditProps {
  spec: DesignerFormSpec;
  formState: FormState;
  onChange: (fieldName: string, value: any, coded?: boolean) => void;
}

export const GeneratedEditForm: React.FC<EditProps> = ({ spec, formState, onChange }) => {
  const renderComponent = (component: DesignerComponentSpec): React.ReactNode => {
    const label = cleanDesignerLabel(component.label);

    if (component.type === 'fbSection') {
      return (
        <FbSection key={component.id} id={component.id} title={label}>
          {component.children?.map(renderComponent)}
        </FbSection>
      );
    }

    if (component.type === 'fbQuestionRow') {
      const children = component.children || [];
      const cols = Math.max(1, Math.min(6, children.reduce((sum, child) => sum + Math.max(1, Number(child.colSpan || 1)), 0))) as 1 | 2 | 3 | 4 | 5 | 6;
      return (
        <FbQuestionRow key={component.id} cols={cols}>
          {children.map(renderComponent)}
        </FbQuestionRow>
      );
    }

    if (component.type === 'fbQuestionRowCell') {
      return (
        <FbQuestionRowCell key={component.id} id={component.id} span={component.colSpan || 1}>
          {component.children?.map(renderComponent)}
        </FbQuestionRowCell>
      );
    }

    if (component.type === 'fbGroup') {
      return (
        <FbGroup key={component.id} label={groupLabel(component)}>
          {component.children?.map((child) => (
            <FbRadio
              key={child.id}
              id={child.id}
              name={component.id}
              value={child.id}
              checked={formState[component.id] === child.id}
              onChange={() => onChange(component.id, child.id)}
              label={cleanDesignerLabel(child.label)}
              required={component.required}
            />
          ))}
        </FbGroup>
      );
    }

    if (component.type === 'fbDropdown') {
      return (
        <FbDropdown
          key={component.id}
          id={component.id}
          label={label}
          value={formState[component.id] || ''}
          onChange={(value) => onChange(component.id, value)}
          options={asOptions(component.options)}
          required={component.required}
          placeholder=""
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
          placeholder={component.placeholder || ''}
          fullWidth={component.fullWidth}
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
          placeholder={component.placeholder || ''}
        />
      );
    }

    if (component.type === 'fbMSISelector') {
      return (
        <FbQuestion key={component.id} label={label} required={component.required}>
          <MSISelector
            name={component.id}
            value={formState[component.id] || ''}
            coded={!!formState[`${component.id}_coded`]}
            onChange={(value, coded) => onChange(component.id, value, coded)}
            required={component.required}
            hasLabel={false}
          />
        </FbQuestion>
      );
    }

    if (component.type === 'fbSCTDiagnosis') {
      return (
        <FbQuestion key={component.id} label={label} required={component.required}>
          <SCTDiagnosis
            name={component.id}
            value={formState[component.id] || ''}
            coded={!!formState[`${component.id}_coded`]}
            onChange={(value, coded) => onChange(component.id, value, coded)}
          />
        </FbQuestion>
      );
    }

    return null;
  };

  return <>{spec.components.map(renderComponent)}</>;
};

interface RoVProps {
  spec: DesignerFormSpec;
  formState: FormState;
}

export const GeneratedReadOnlyForm: React.FC<RoVProps> = ({ spec, formState }) => {
  const renderComponent = (component: DesignerComponentSpec): React.ReactNode => {
    const label = cleanDesignerLabel(component.label);

    if (component.type === 'fbSection') {
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

    if (component.type === 'fbQuestionRow') {
      const children = component.children || [];
      const cols = Math.max(1, Math.min(6, children.reduce((sum, child) => sum + Math.max(1, Number(child.colSpan || 1)), 0))) as 1 | 2 | 3 | 4 | 5 | 6;
      return (
        <FbQuestionRow key={component.id} cols={cols}>
          {children.map(renderComponent)}
        </FbQuestionRow>
      );
    }

    if (component.type === 'fbQuestionRowCell') {
      return (
        <FbQuestionRowCell key={component.id} id={component.id} span={component.colSpan || 1}>
          {component.children?.map(renderComponent)}
        </FbQuestionRowCell>
      );
    }

    if (component.type === 'fbGroup') {
      const lookup = optionLookup(component);
      return <FbRoVField key={component.id} label={label} value={formState[component.id]} lookupTable={lookup} preserveGridSpace />;
    }

    if (fieldTypes.has(component.type)) {
      const value = formState[component.id];
      const coded = component.type === 'fbMSISelector' || component.type === 'fbSCTDiagnosis'
        ? !!formState[`${component.id}_coded`]
        : undefined;
      return (
        <FbRoVField
          key={component.id}
          label={label}
          value={value}
          lookupTable={optionLookup(component)}
          coded={coded}
          preserveGridSpace
        />
      );
    }

    if (component.children?.length) return <React.Fragment key={component.id}>{component.children.map(renderComponent)}</React.Fragment>;
    return null;
  };

  const hasAnyValue = Object.values(formState).some((value) => !isFbRoVEmptyValue(value));
  if (!hasAnyValue) return <div style={{ color: '#666', fontStyle: 'italic' }}>No form values recorded.</div>;
  return <>{spec.components.map(renderComponent)}</>;
};
