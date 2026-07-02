import type { DesignerComponentSpec, DesignerFormSpec, DesignerOption } from '$lib/data/treatmentSummarySpec';

export type FormState = Record<string, any>;

export const fieldTypes = new Set([
  'fbBloodPressure',
  'fbDropdown',
  'fbSmartDropdown',
  'fbDateExact',
  'fbMSISelector',
  'fbNumberInput',
  'fbNumberInputWithUnits',
  'fbDatePartial',
  'fbSCTDiagnosis',
  'fbSCTProcedure',
  'fbTextArea',
  'fbTextInput',
  'fbTime',
  'fbNotificationTypeGroup'
]);

export const cleanDesignerLabel = (label = '') => label.replace(/\*+$/g, '').trim();

export const asOptions = (options?: DesignerOption[]) => options && options.length > 0 ? options : [];

export const componentType = (component: DesignerComponentSpec) => {
  if (component.type === 'fbQuestionRow') return 'fbGridRow';
  if (component.type === 'fbQuestionRowCell') return 'fbGridCell';
  return component.type;
};

export const optionLookup = (component: DesignerComponentSpec) => {
  const lookup: Record<string, string> = {};
  asOptions(component.options).forEach((option) => {
    lookup[option.value] = option.label;
  });
  component.children?.forEach((child) => {
    lookup[child.id] = cleanDesignerLabel(child.label);
  });
  return lookup;
};

export const tableColumns = (component: DesignerComponentSpec) => {
  const rawColumns = component.tableColumns?.length ? component.tableColumns : [{ id: `${component.id}-col1`, label: 'Column 1' }];
  return rawColumns.map((column, index) => {
    if (typeof column === 'string') return { id: `${component.id}-col${index + 1}`, label: column || `Column ${index + 1}` };
    return { id: column.id || `${component.id}-col${index + 1}`, label: column.label || column.id || `Column ${index + 1}` };
  });
};

export const tableRows = (component: DesignerComponentSpec) => {
  if (Array.isArray(component.tableRows)) {
    return component.tableRows.length ? component.tableRows : [{ id: `${component.id}-row1` }];
  }
  const count = Math.max(1, Number(component.tableRows) || 3);
  return Array.from({ length: count }, (_, index) => ({ id: `${component.id}-row${index + 1}` }));
};

export const tableCellTemplates = (component: DesignerComponentSpec) => {
  const templates = [...(component.tableCellTemplates || [])];
  const columns = tableColumns(component);
  while (templates.length < columns.length) templates.push(null);
  return templates.slice(0, columns.length);
};

export const rowScopedComponent = (component: DesignerComponentSpec, rowScope: number | string): DesignerComponentSpec => ({
  ...component,
  id: `${component.id}-${rowScope}`,
  children: component.children?.map((child) => rowScopedComponent(child, rowScope))
});

export const tableRowScope = (row: { id?: string }, rowIndex: number) => row.id || `row${rowIndex + 1}`;

export const bmiKeys = (component: DesignerComponentSpec) => ({
  dateRecorded: `${component.id}-dateRecorded`,
  heightCm: `${component.id}-heightCm`,
  weightKg: `${component.id}-weightKg`
});

export function isFbReadOnlyEmptyValue(value: unknown, emptyValues: unknown[] = ['', 'select', 'Select side']) {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return emptyValues.includes(value);
}

export function requiredFieldIds(component: DesignerComponentSpec): string[] {
  const current = component.required && (fieldTypes.has(component.type) || component.type === 'fbGroup') ? [component.id] : [];
  return [...current, ...(component.children || []).flatMap(requiredFieldIds)];
}

export const designerSections = (spec: DesignerFormSpec) => spec.components
  .filter((component) => component.type === 'fbSection')
  .map((component) => ({ id: component.id, name: cleanDesignerLabel(component.label), requiredFields: requiredFieldIds(component) }));

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

export function hasRoVData(component: DesignerComponentSpec, formState: FormState): boolean {
  const type = componentType(component);
  if (type === 'fbSection' || type === 'fbGridRow' || type === 'fbGridCell') {
    return (component.children || []).some((child) => hasRoVData(child, formState));
  }
  if (type === 'fbTable') {
    return tableRows(component).some((row, rowIndex) => tableCellTemplates(component).some((template) => template ? hasRoVData(rowScopedComponent(template, tableRowScope(row, rowIndex)), formState) : false));
  }
  if (type === 'fbGroup') return !isFbReadOnlyEmptyValue(formState[component.id]);
  if (type === 'fbDateHeightWeightBMIRow') {
    const keys = bmiKeys(component);
    return [keys.dateRecorded, keys.heightCm, keys.weightKg].some((key) => !isFbReadOnlyEmptyValue(formState[key]));
  }
  if (type === 'fbReadOnly') return !isFbReadOnlyEmptyValue(component.defaultValue || formState[component.id]);
  if (component.type === 'fbBloodPressure') {
    const value = formState[component.id];
    const displayValue = value && typeof value === 'object'
      ? [value.systolic, value.diastolic].filter(Boolean).join('/')
      : value;
    return !isFbReadOnlyEmptyValue(displayValue);
  }
  if (fieldTypes.has(component.type)) return !isFbReadOnlyEmptyValue(formState[component.id]);
  return false;
}
