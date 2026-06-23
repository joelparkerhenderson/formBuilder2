import * as React from 'react';
import { useParams } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbAddButton as FbAddButton } from './components/fbAddButton';
import { fbBloodPressure as FbBloodPressure } from './components/fbBloodPressure';
import { fbBoxedAlert as FbBoxedAlert, fbBoxedInfo as FbBoxedInfo, fbBoxedWarning as FbBoxedWarning } from './components/fbBoxedMessage';
import { fbButton as FbButton } from './components/fbButton';
import { fbDropdown as FbDropdown } from './components/fbDropdown';
import { fbDateExact as FbExactDate } from './components/fbDateExact';
import { fbMSISelector as FbMSISelector } from './components/fbMSISelector';
import { fbNumberInput as FbNumberInput } from './components/fbNumberInput';
import { fbDatePartial as FbPartialDate } from './components/fbDatePartial';
import { fbRequiredForAudit as FbRequiredForAudit } from './components/fbRequiredForAudit';
import { fbGridRow as FbGridRow } from './components/fbGridRow';
import { fbGridCell as FbGridCell } from './components/fbGridCell';
import { fbLayoutNav as FbLayoutNav } from './components/fbLayoutNav';
import { fbSCTDiagnosis as FbSCTDiagnosis } from './components/fbSCTDiagnosis';
import { fbSCTProcedure as FbSCTProcedure } from './components/fbSCTProcedure';
import { fbSection as FbSection } from './components/fbSection';
import { fbGroup as FbGroup } from './components/fbGroup';
import { fbValueError as FbValueError } from './components/fbValueError';
import {
  fbcAction,
  fbcActions,
  fbcBreadcrumbs,
  fbcFooter,
  fbcHeader,
  fbcOptions,
  fbcPanel,
  fbcProperties,
  fbcpCheck,
  fbcpDropdown,
  fbcpName,
  fbcpTextInput,
  fbcpTextarea,
  fbcpVal,
} from './components/fbcComposerComponents';
import {
  fbTable as FbTable,
  fbTableBody as FbTableBody,
  fbTableHeader as FbTableHeader,
  fbTableHeaderCell as FbTableHeaderCell,
  fbTableRow as FbTableRow,
} from './components/fbTable';
import { fbTableCell as FbTableCell } from './components/fbTableCell';
import { fbTextArea as FbTextArea } from './components/fbTextArea';
import { fbTextInput as FbTextInput } from './components/fbTextInput';
import { fbTime as FbTime } from './components/fbTime';
import { fbRoVCodedIcon as FbRoVCodedIcon } from './components/fbRoVField';
import { useFbTooltips } from './utils/useFbTooltips';
import { useEditFormLabelEqualization } from './utils/formLayoutEffects';

type DesignerComponentType =
  | 'fbSection'
  | 'fbGridRow'
  | 'fbGridCell'
  | 'fbTable'
  | 'fbBoxedWarning'
  | 'fbBoxedAlert'
  | 'fbBoxedInfo'
  | 'fbGroup'
  | 'fbTextInput'
  | 'fbTime'
  | 'fbTextArea'
  | 'fbDropdown'
  | 'fbNumberInput'
  | 'fbNumberInputWithUnits'
  | 'fbBloodPressure'
  | 'fbCheck'
  | 'fbRadio'
  | 'fbDatePartial'
  | 'fbDateExact'
  | 'fbMSISelector'
  | 'fbSCTDiagnosis'
  | 'fbSCTProcedure';

interface DesignerOption {
  value: string;
  label: string;
}

interface DesignerComponentSpec {
  id: string;
  key?: string;
  type: DesignerComponentType;
  label: string;
  required?: boolean;
  requiredForAudit?: boolean;
  tooltip?: string;
  databaseColumn?: string;
  placeholder?: string;
  defaultValue?: string;
  valueError?: string;
  units?: string;
  colSpan?: number;
  fullWidth?: boolean;
  boldOverride?: boolean;
  plainOverride?: boolean;
  showInRoVIfEmpty?: boolean;
  acceptUncodedValues?: boolean;
  useFullWidth?: boolean;
  includeDragHandles?: boolean;
  includeRowDeleteButtons?: boolean;
  tableColumns?: Array<string | { id?: string; label?: string }>;
  tableRows?: number | Array<{ id?: string }>;
  requireAtLeastOneRow?: boolean;
  requireAtLeastOneRowText?: string;
  includeAddButton?: boolean;
  addButtonLabel?: string;
  tableCellTemplates?: Array<DesignerComponentSpec | null>;
  options?: DesignerOption[];
  children?: DesignerComponentSpec[];
  notes?: string;
}

interface DesignerSpec {
  id: string;
  publicId: string;
  title: string;
  patientUuid: string;
  components: DesignerComponentSpec[];
  savedAt?: string;
  notes?: string;
}

interface AddMenuState {
  parentId: string;
  rect: DOMRect;
  action?: AddAction;
  label?: string;
}

type SeparatorTarget = {
  id: string;
  parentId: string;
  index: number;
  orientation: 'wide' | 'tall' | 'tallForSingle';
  fullSize?: boolean;
};

type AuthMode = 'login' | 'register';
type RegistrationStep = 'form' | 'code' | 'expired' | 'incorrect';
type AddAction =
  | 'append'
  | 'afterSelected'
  | 'rowEnd'
  | 'singleBelowRow'
  | 'rowBelow'
  | 'cellRight'
  | 'cellBelow'
  | 'componentRight'
  | 'componentBelow'
  | 'groupOption'
  | 'questionBelow'
  | 'subquestion'
  | 'separatorInsert';

type TableSelectionTarget =
  | { kind: 'header'; tableId: string; columnIndex: number }
  | { kind: 'row'; tableId: string; rowIndex: number }
  | { kind: 'cell'; tableId: string; columnIndex: number; rowIndex: number }
  | { kind: 'separator'; tableId: string; separatorIndex: number };

type SelectionChromeOptions = {
  compact?: boolean;
};

type DesignerSessionResponse = {
  success?: boolean;
  sessionToken?: string;
  expiresAt?: string;
  email?: string;
  prefs?: DesignerPrefs;
};

type DesignerPrefs = {
  activeDesignId?: string | null;
  showRowsAndCellsInBreadcrumbs?: boolean;
  showPurpleBoxes?: boolean;
  showAllPurpleBoxes?: boolean;
  showGreenBoxes?: boolean;
  leftScrollTop?: number;
  rightScrollTop?: number;
};

const DONALD_DUCK_PATIENT_UUID = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
const purple = 'purple';
const fbSeparatorColor = '#C5E1A5';
const fbSeparatorThickness = '1rem';
const dragDropProblemText = 'Components can only be dropped into the light green drop targets. Grid rows can only be dropped onto forms or sections. Grid cells can only be dropped into Grid rows.';

const questionTypes: DesignerComponentType[] = [
  'fbTextInput',
  'fbTime',
  'fbTextArea',
  'fbDropdown',
  'fbNumberInput',
  'fbNumberInputWithUnits',
  'fbBloodPressure',
  'fbCheck',
  'fbRadio',
  'fbGroup',
  'fbDatePartial',
  'fbDateExact',
  'fbMSISelector',
  'fbSCTDiagnosis',
  'fbSCTProcedure',
];

const messageTypes: DesignerComponentType[] = ['fbBoxedWarning', 'fbBoxedAlert', 'fbBoxedInfo'];
const formOrSectionComponentTypes: DesignerComponentType[] = ['fbTable', ...messageTypes, ...questionTypes];

const typeLabels: Record<DesignerComponentType, string> = {
  fbSection: 'Section',
  fbGridRow: 'Grid row',
  fbGridCell: 'Grid cell',
  fbTable: 'Table',
  fbBoxedWarning: 'Boxed warning',
  fbBoxedAlert: 'Boxed alert',
  fbBoxedInfo: 'Boxed info',
  fbGroup: 'Group',
  fbTextInput: 'Text input',
  fbTime: 'Time',
  fbTextArea: 'Text area',
  fbDropdown: 'Dropdown',
  fbNumberInput: 'Number input',
  fbNumberInputWithUnits: 'Number input with units',
  fbBloodPressure: 'Blood pressure',
  fbCheck: 'Checkbox',
  fbRadio: 'Radio button',
  fbDatePartial: 'Partial date',
  fbDateExact: 'Exact date',
  fbMSISelector: 'Staff selector',
  fbSCTDiagnosis: 'SNOMED CT diagnosis',
  fbSCTProcedure: 'SNOMED CT procedure',
};

const randomHex = () => Math.random().toString(16).slice(2, 10);
const randomUuid = () => crypto.randomUUID ? crypto.randomUUID() : `${randomHex()}-${randomHex()}-${randomHex()}`;
const randomDesignerKey = () => `composer-key-${randomHex()}-${randomHex()}`;

const apiBase = window.location.pathname.startsWith('/formBuilder2') ? '/formBuilder2/api' : '/api';
const composerSessionCookieName = 'formBuilder2ComposerSession';
const legacyControllerSessionCookieName = 'formBuilder2ControllerSession';
const transientSessionMs = 10 * 60 * 1000;

const normaliseDesignerEmail = (email: string) => email.trim().toLowerCase();

const getCookieValue = (name: string) => {
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length) || '';
};

const clearComposerSessionCookie = () => {
  document.cookie = `${encodeURIComponent(composerSessionCookieName)}=; max-age=0; path=/; samesite=lax`;
  document.cookie = `${encodeURIComponent(legacyControllerSessionCookieName)}=; max-age=0; path=/; samesite=lax`;
};

const rememberComposerSession = (sessionToken: string, expiresAt?: string) => {
  const parsedExpiresAtMs = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const expiresAtMs = Number.isFinite(parsedExpiresAtMs) ? parsedExpiresAtMs : Date.now() + transientSessionMs;
  const maxAge = Math.max(1, Math.floor((expiresAtMs - Date.now()) / 1000));
  document.cookie = `${encodeURIComponent(composerSessionCookieName)}=${sessionToken}; max-age=${maxAge}; path=/; samesite=lax`;
  localStorage.setItem(composerSessionCookieName, sessionToken);
  localStorage.removeItem(legacyControllerSessionCookieName);
  localStorage.removeItem('formBuilder2DesignerSession');
};

const composerAuthFetch = async (path: string, init: RequestInit) => {
  const response = await fetch(`${apiBase}/composer-auth/${path}`, init);
  if (response.status !== 404 && response.status !== 405) return response;
  const legacyControllerResponse = await fetch(`${apiBase}/controller-auth/${path}`, init);
  if (legacyControllerResponse.status !== 404 && legacyControllerResponse.status !== 405) return legacyControllerResponse;
  return fetch(`${apiBase}/designer-auth/${path}`, init);
};

const designerAuthRequest = async (mode: 'login' | 'register' | 'register-start' | 'register-resend', designerEmail: string, password: string, remember = false): Promise<DesignerSessionResponse> => {
  const response = await composerAuthFetch(mode, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normaliseDesignerEmail(designerEmail), password, remember }),
  });
  if (!response.ok) throw new Error(mode === 'login' ? 'Login failed' : 'Registration failed');
  return response.json().catch(() => ({}));
};

const verifyDesignerRegistration = async (designerEmail: string, password: string, code: string) => {
  const response = await composerAuthFetch('register-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normaliseDesignerEmail(designerEmail), password, code }),
  });
  if (response.ok) return;
  const error = await response.json().catch(() => ({}));
  const nested = typeof error?.error === 'string' && error.error.trim().startsWith('{')
    ? JSON.parse(error.error)
    : error;
  throw new Error(nested?.code === 'expired' ? 'expired' : nested?.code === 'incorrect' ? 'incorrect' : 'Registration failed');
};

const loadDbDesigns = async (designerEmail: string, password: string): Promise<DesignerSpec[]> => {
  const response = await fetch(`${apiBase}/designs/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normaliseDesignerEmail(designerEmail), password }),
  });
  if (!response.ok) throw new Error('Could not load designs');
  const rows = await response.json();
  return (Array.isArray(rows) ? rows : []).map((row) => row?.json_spec || row).filter(Boolean).map(ensureDesignerSpecKeys);
};

const loadDbDesignsForSession = async (sessionToken: string): Promise<DesignerSpec[]> => {
  const response = await fetch(`${apiBase}/designs/session/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken }),
  });
  if (!response.ok) throw new Error('Could not load session designs');
  const rows = await response.json();
  return (Array.isArray(rows) ? rows : []).map((row) => row?.json_spec || row).filter(Boolean).map(ensureDesignerSpecKeys);
};

const loadDbPublicDesign = async (publicId: string): Promise<DesignerSpec | null> => {
  const response = await fetch(`${apiBase}/designs/public/${encodeURIComponent(publicId)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Could not load public design');
  return response.json().then(ensureDesignerSpecKeys);
};

const saveDbDesign = async (designerEmail: string, password: string, design: DesignerSpec, sessionToken?: string) => {
  const response = await fetch(`${apiBase}/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normaliseDesignerEmail(designerEmail), password, sessionToken, design }),
  });
  if (!response.ok) throw new Error('Could not save design');
};

const deleteDbDesign = async (designerEmail: string, password: string, design: DesignerSpec, sessionToken?: string) => {
  const response = await fetch(`${apiBase}/designs/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: normaliseDesignerEmail(designerEmail),
      password,
      sessionToken,
      designId: design.id,
      publicId: design.publicId,
    }),
  });
  if (!response.ok) throw new Error('Could not delete design');
};

const resumeDesignerSession = async (sessionToken: string): Promise<DesignerSessionResponse> => {
  const response = await composerAuthFetch('session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken }),
  });
  if (!response.ok) throw new Error('Session expired');
  return response.json();
};

const logoutDesignerSession = async (sessionToken: string) => {
  await composerAuthFetch('logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken }),
  }).catch(() => {});
};

const saveDesignerPrefs = async (sessionToken: string, prefs: DesignerPrefs) => {
  await composerAuthFetch('prefs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, prefs }),
  });
};

const designerButtonStyle: React.CSSProperties = {
  height: 'auto',
  lineHeight: 'normal',
  padding: '0.25rem 0.45rem',
  border: '0.1rem solid black',
  borderRadius: 0,
  backgroundColor: 'white',
  color: 'black',
  fontFamily: "'Roboto', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 300,
  cursor: 'pointer',
};

const composerSaveButtonStyle = (state: 'saved' | 'saving' | 'dirty'): React.CSSProperties => ({
  ...designerButtonStyle,
  backgroundColor: state === 'saved' ? '#008000' : state === 'saving' ? '#fd8a10' : '#d50000',
  color: 'black',
  opacity: 1,
  cursor: state === 'dirty' ? 'pointer' : 'not-allowed',
});

const designerDangerButtonStyle: React.CSSProperties = {
  ...designerButtonStyle,
  borderColor: '#d50000',
  color: '#d50000',
};

const designerInputStyle: React.CSSProperties = {
  width: '100%',
  border: '0.1rem solid black',
  borderRadius: 0,
  padding: '0.2rem',
  fontWeight: 300,
};

const propertyInputStyle: React.CSSProperties = {
  ...designerInputStyle,
  border: 'none',
  padding: 0,
};

const PropertyTextInput = fbcpTextInput;
const PropertyDropdown = fbcpDropdown;

type PropertyTextareaProps = {
  value?: string;
  defaultValue?: string;
  minRows?: number;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  style?: React.CSSProperties;
};

const PropertyTextarea: React.FC<PropertyTextareaProps> = ({ value, defaultValue, minRows = 1, onChange, onBlur, style }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const resize = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, minRows * 20)}px`;
  }, [minRows]);

  React.useEffect(() => {
    resize();
  }, [resize, value, defaultValue]);

  return React.createElement(fbcpTextarea, {
    ref: textareaRef,
    rows: minRows,
    value,
    defaultValue,
    onInput: (event: React.FormEvent<HTMLTextAreaElement>) => {
      resize();
      onChange?.(event.currentTarget.value);
    },
    onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => onBlur?.(event.currentTarget.value),
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => event.stopPropagation(),
    style: {
      ...propertyInputStyle,
      minHeight: `${minRows * 1.35}rem`,
      overflow: 'hidden',
      resize: 'none',
      whiteSpace: 'pre-wrap',
      ...style,
    },
  });
};

const designerLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontStyle: 'italic',
  fontWeight: 300,
  marginBottom: '0.15rem',
};

const propertyGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '8rem minmax(0, 1fr)',
  alignItems: 'center',
  borderTop: '0.1rem solid silver',
  borderLeft: '0.1rem solid silver',
};

const propertyCellStyle: React.CSSProperties = {
  minHeight: '2rem',
  padding: '0.25rem',
  borderRight: '0.1rem solid silver',
  borderBottom: '0.1rem solid silver',
  boxSizing: 'border-box',
};

const propertyValueStyle: React.CSSProperties = {
  ...propertyCellStyle,
  display: 'flex',
  alignItems: 'center',
};

const passwordRevealButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '0.2rem',
  top: '50%',
  transform: 'translateY(-50%)',
  border: 'none',
  background: 'transparent',
  padding: 0,
  width: '1.4rem',
  height: '1.4rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const addButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 300,
  border: `0.1rem solid ${purple}`,
  backgroundColor: purple,
  width: '1rem',
  height: '1rem',
  lineHeight: 'normal',
  padding: 0,
  cursor: 'pointer',
};

const breadcrumbButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  padding: 0,
  color: '#1b6ec2',
  textDecoration: 'underline',
  fontFamily: "'Roboto', sans-serif",
  fontSize: '0.9rem',
  fontWeight: 300,
  cursor: 'pointer',
};

const allComponents = (components: DesignerComponentSpec[]): DesignerComponentSpec[] =>
  components.flatMap((component) => [component, ...allComponents(component.children || [])]);

const clampColSpan = (value: unknown) => Math.max(1, Math.min(12, Number(value) || 1));

const normaliseDesignerComponentType = (type: string): DesignerComponentType => {
  if (type === 'fbQuestionRow') return 'fbGridRow';
  if (type === 'fbQuestionRowCell') return 'fbGridCell';
  if (type === 'fbFieldWithUnits') return 'fbNumberInputWithUnits';
  return type as DesignerComponentType;
};

const idPrefixForType = (type: DesignerComponentType) =>
  type === 'fbSection' ? 'section' : type === 'fbGridRow' ? 'row' : type === 'fbGridCell' ? 'cell' : type === 'fbGroup' ? 'group' : type === 'fbTable' ? 'table' : 'field';

const nextUniqueComponentId = (type: DesignerComponentType, existing: DesignerComponentSpec[]) => {
  const prefix = idPrefixForType(type);
  const used = new Set(existing.map((component) => component.id));
  let index = 1;
  while (used.has(`${prefix}${index}`)) index += 1;
  return `${prefix}${index}`;
};

const cleanEditedLabel = (value: string, required?: boolean, requiredForAudit?: boolean) => {
  let label = value.replace(/\s+/g, ' ').trim();
  if (requiredForAudit) label = label.replace(/\s*RfA\s*$/g, '').trim();
  return required ? label.replace(/\s*\*+\s*$/g, '').trim() : label;
};

const cleanDisplayLabel = (value: string) => value.replace(/\s*\*+\s*$/g, '').trim();

const ensureDesignerComponentKeys = (components: DesignerComponentSpec[], usedKeys = new Set<string>(), usedIds = new Set<string>()): DesignerComponentSpec[] =>
  components.map((component) => {
    const type = normaliseDesignerComponentType(component.type);
    let key = component.key || randomDesignerKey();
    while (usedKeys.has(key)) key = randomDesignerKey();
    usedKeys.add(key);
    let id = component.id?.trim() || nextUniqueComponentId(type, Array.from(usedIds).map((usedId) => ({ id: usedId, type, label: '' } as DesignerComponentSpec)));
    if (usedIds.has(id)) id = nextUniqueComponentId(type, Array.from(usedIds).map((usedId) => ({ id: usedId, type, label: '' } as DesignerComponentSpec)));
    usedIds.add(id);
    return {
      ...component,
      type,
      id,
      key,
      colSpan: type === 'fbGridCell' ? clampColSpan(component.colSpan) : component.colSpan,
      children: component.children ? ensureDesignerComponentKeys(component.children, usedKeys, usedIds) : component.children,
    };
  });

const ensureDesignerSpecKeys = (design: DesignerSpec): DesignerSpec => ({
  ...design,
  components: ensureDesignerComponentKeys(design.components || []),
});

const designSignature = (design: DesignerSpec) => JSON.stringify(design);

const tableColumnLabel = (column: string | { id?: string; label?: string }, index: number) =>
  typeof column === 'string' ? column : column.label || column.id || `Column ${index + 1}`;

const normaliseTableColumns = (table: DesignerComponentSpec): string[] => {
  const columns = table.tableColumns && table.tableColumns.length > 0 ? table.tableColumns : ['Column 1'];
  return columns.map(tableColumnLabel);
};

const normaliseTableRowCount = (table?: DesignerComponentSpec | null): number => {
  if (!table) return 3;
  if (Array.isArray(table.tableRows)) return Math.max(1, table.tableRows.length);
  return Math.max(1, Number(table.tableRows) || 3);
};

const findComponentPath = (
  components: DesignerComponentSpec[],
  id: string,
  trail: DesignerComponentSpec[] = [],
): DesignerComponentSpec[] | null => {
  for (const component of components) {
    const nextTrail = [...trail, component];
    if (component.id === id) return nextTrail;
    const childPath = findComponentPath(component.children || [], id, nextTrail);
    if (childPath) return childPath;
  }
  return null;
};

const childrenForParent = (components: DesignerComponentSpec[], parentId: string): DesignerComponentSpec[] => {
  if (parentId === 'form') return components;
  const parent = allComponents(components).find((component) => component.id === parentId);
  return parent?.children || [];
};

const mapComponents = (
  components: DesignerComponentSpec[],
  mapper: (component: DesignerComponentSpec) => DesignerComponentSpec | null,
): DesignerComponentSpec[] => {
  const mapped: DesignerComponentSpec[] = [];
  components.forEach((component) => {
    const next = mapper({
      ...component,
      children: component.children ? mapComponents(component.children, mapper) : component.children,
    });
    if (next) mapped.push(next);
  });
  return mapped;
};

const insertIntoParent = (
  components: DesignerComponentSpec[],
  parentId: string,
  component: DesignerComponentSpec,
): DesignerComponentSpec[] => {
  if (parentId === 'form') return [...components, component];
  return components.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...(item.children || []), component] };
    }
    return { ...item, children: item.children ? insertIntoParent(item.children, parentId, component) : item.children };
  });
};

const insertIntoParentAt = (
  components: DesignerComponentSpec[],
  parentId: string,
  index: number,
  component: DesignerComponentSpec,
): DesignerComponentSpec[] => {
  if (parentId === 'form') {
    const next = [...components];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, component);
    return next;
  }
  return components.map((item) => {
    if (item.id === parentId) {
      const nextChildren = [...(item.children || [])];
      nextChildren.splice(Math.max(0, Math.min(index, nextChildren.length)), 0, component);
      return { ...item, children: nextChildren };
    }
    return { ...item, children: item.children ? insertIntoParentAt(item.children, parentId, index, component) : item.children };
  });
};

const replaceChildAtWithRow = (
  components: DesignerComponentSpec[],
  parentId: string,
  index: number,
  row: DesignerComponentSpec,
): DesignerComponentSpec[] => {
  if (parentId === 'form') {
    const next = [...components];
    if (index >= 0 && index < next.length) next.splice(index, 1, row);
    return next;
  }
  return components.map((item) => {
    if (item.id === parentId) {
      const nextChildren = [...(item.children || [])];
      if (index >= 0 && index < nextChildren.length) nextChildren.splice(index, 1, row);
      return { ...item, children: nextChildren };
    }
    return { ...item, children: item.children ? replaceChildAtWithRow(item.children, parentId, index, row) : item.children };
  });
};

const extractComponent = (
  components: DesignerComponentSpec[],
  id: string,
): { components: DesignerComponentSpec[]; extracted: DesignerComponentSpec | null } => {
  let extracted: DesignerComponentSpec | null = null;
  const nextComponents: DesignerComponentSpec[] = [];
  components.forEach((component) => {
    if (component.id === id) {
      extracted = component;
      return;
    }
    const childResult = extractComponent(component.children || [], id);
    if (childResult.extracted) extracted = childResult.extracted;
    nextComponents.push({
      ...component,
      children: component.children ? childResult.components : component.children,
    });
  });
  return { components: nextComponents, extracted };
};

const insertBeforeComponent = (
  components: DesignerComponentSpec[],
  targetId: string,
  componentToInsert: DesignerComponentSpec,
): DesignerComponentSpec[] => {
  const nextComponents: DesignerComponentSpec[] = [];
  components.forEach((component) => {
    if (component.id === targetId) nextComponents.push(componentToInsert);
    nextComponents.push({
      ...component,
      children: component.children ? insertBeforeComponent(component.children, targetId, componentToInsert) : component.children,
    });
  });
  return nextComponents;
};

const insertAfterComponent = (
  components: DesignerComponentSpec[],
  targetId: string,
  componentToInsert: DesignerComponentSpec,
): DesignerComponentSpec[] => {
  const nextComponents: DesignerComponentSpec[] = [];
  components.forEach((component) => {
    nextComponents.push({
      ...component,
      children: component.children ? insertAfterComponent(component.children, targetId, componentToInsert) : component.children,
    });
    if (component.id === targetId) nextComponents.push(componentToInsert);
  });
  return nextComponents;
};

const insertChildAfter = (
  components: DesignerComponentSpec[],
  parentId: string,
  afterChildId: string,
  componentToInsert: DesignerComponentSpec,
): DesignerComponentSpec[] => components.map((component) => {
  if (component.id === parentId) {
    const nextChildren: DesignerComponentSpec[] = [];
    (component.children || []).forEach((child) => {
      nextChildren.push(child);
      if (child.id === afterChildId) nextChildren.push(componentToInsert);
    });
    return { ...component, children: nextChildren };
  }
  return { ...component, children: component.children ? insertChildAfter(component.children, parentId, afterChildId, componentToInsert) : component.children };
});

const moveComponentBefore = (
  components: DesignerComponentSpec[],
  draggedId: string,
  targetId: string,
): DesignerComponentSpec[] => {
  if (draggedId === targetId) return components;
  const targetPath = findComponentPath(components, targetId) || [];
  if (targetPath.some((component) => component.id === draggedId)) return components;
  const { components: withoutDragged, extracted } = extractComponent(components, draggedId);
  if (!extracted) return components;
  return insertBeforeComponent(withoutDragged, targetId, extracted);
};

const moveComponentIntoNewCellAfter = (
  components: DesignerComponentSpec[],
  draggedId: string,
  rowId: string,
  afterCellId: string,
  existing: DesignerComponentSpec[],
): DesignerComponentSpec[] => {
  const { components: withoutDragged, extracted } = extractComponent(components, draggedId);
  if (!extracted) return components;
  const newCell = { ...makeComponent('fbGridCell', existing), children: [extracted] };
  return insertChildAfter(withoutDragged, rowId, afterCellId, newCell);
};

const nearestRowInPath = (path: DesignerComponentSpec[]) => {
  for (let i = path.length - 1; i >= 0; i--) {
    if (path[i].type === 'fbGridRow') return path[i];
  }
  return null;
};

const nextFormTitle = (designs: DesignerSpec[]) => {
  const used = new Set(designs.map((design) => design.title.trim()));
  let index = 1;
  while (used.has(`Form ${index}`)) index += 1;
  return `Form ${index}`;
};

const nextSectionLabel = (existing: DesignerComponentSpec[]) => {
  const used = new Set(existing.filter((component) => component.type === 'fbSection').map((component) => component.label.trim()));
  let index = 1;
  while (used.has(`Section ${index}`)) index += 1;
  return `Section ${index}`;
};

const makeComponent = (type: DesignerComponentType, existing: DesignerComponentSpec[]): DesignerComponentSpec => {
  const sameTypeCount = existing.filter((component) => component.type === type).length + 1;
  const label =
    type === 'fbSection' ? nextSectionLabel(existing) :
    type === 'fbGridRow' ? `Grid row ${sameTypeCount}` :
    type === 'fbGridCell' ? `Grid cell ${sameTypeCount}` :
    type === 'fbTable' ? `Table ${sameTypeCount}` :
    type === 'fbBoxedWarning' ? `Warning ${sameTypeCount}` :
    type === 'fbBoxedAlert' ? `Alert ${sameTypeCount}` :
    type === 'fbBoxedInfo' ? `Information ${sameTypeCount}` :
    type === 'fbGroup' ? `Group ${sameTypeCount}` :
    type === 'fbCheck' ? `Check ${sameTypeCount}` :
    type === 'fbRadio' ? `Radio ${sameTypeCount}` :
    `Question ${sameTypeCount}`;

  return {
    id: nextUniqueComponentId(type, existing),
    key: randomDesignerKey(),
    type,
    label,
    required: false,
    requiredForAudit: false,
    placeholder: ['fbTextInput', 'fbTime', 'fbTextArea'].includes(type) ? '' : undefined,
    options: ['fbDropdown', 'fbRadio', 'fbCheck'].includes(type)
      ? [{ value: 'option1', label: 'Option 1' }]
      : undefined,
    tableColumns: type === 'fbTable' ? ['Column 1'] : undefined,
    tableRows: type === 'fbTable' ? 3 : undefined,
    includeDragHandles: type === 'fbTable' ? false : undefined,
    includeRowDeleteButtons: type === 'fbTable' ? false : undefined,
    requireAtLeastOneRow: type === 'fbTable' ? false : undefined,
    requireAtLeastOneRowText: type === 'fbTable' ? 'Enter at least one row' : undefined,
    includeAddButton: type === 'fbTable' ? false : undefined,
    addButtonLabel: type === 'fbTable' ? 'Add row' : undefined,
    tableCellTemplates: type === 'fbTable' ? [makeComponent('fbTextInput', existing)] : undefined,
    colSpan: type === 'fbGridCell' ? 1 : undefined,
    fullWidth: type === 'fbTextArea' ? false : undefined,
    units: type === 'fbNumberInputWithUnits' ? 'units' : undefined,
    children: ['fbSection', 'fbGridRow', 'fbGridCell', 'fbGroup'].includes(type) ? [] : undefined,
  };
};

const getAllowedAddTypes = (parentType?: DesignerComponentType): DesignerComponentType[] => {
  if (parentType === 'fbGridRow') return questionTypes;
  if (parentType === 'fbGridCell') return questionTypes;
  if (parentType === 'fbGroup') return ['fbRadio', 'fbCheck'];
  if (parentType && questionTypes.includes(parentType)) return questionTypes;
  return ['fbSection', 'fbGridRow', 'fbTable', ...questionTypes];
};

export default function Composer() {
  const { publicId: routePublicId } = useParams();
  const hashPublicId = window.location.pathname.endsWith('/userForm.html')
    ? window.location.hash.replace(/^#\/?/, '').trim()
    : '';
  const publicId = routePublicId || hashPublicId;
  const [email, setEmail] = React.useState<string | null>(null);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [registerEmail, setRegisterEmail] = React.useState('');
  const [registerPassword, setRegisterPassword] = React.useState('');
  const [repeatPassword, setRepeatPassword] = React.useState('');
  const [registrationStep, setRegistrationStep] = React.useState<RegistrationStep>('form');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [designs, setDesigns] = React.useState<DesignerSpec[]>([]);
  const [savedDesignSignatures, setSavedDesignSignatures] = React.useState<Record<string, string>>({});
  const [savingDesign, setSavingDesign] = React.useState(false);
  const [activeDesignId, setActiveDesignId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string>('form');
  const [selectedTableTarget, setSelectedTableTarget] = React.useState<TableSelectionTarget | null>(null);
  const [addMenu, setAddMenu] = React.useState<AddMenuState | null>(null);
  const [showJson, setShowJson] = React.useState(false);
  const [jsonDraft, setJsonDraft] = React.useState('');
  const [loginMessage, setLoginMessage] = React.useState('');
  const [registrationMessage, setRegistrationMessage] = React.useState('');
  const [readOnlyPreview, setReadOnlyPreview] = React.useState(false);
  const [showRowsAndCellsInBreadcrumbs, setShowRowsAndCellsInBreadcrumbs] = React.useState(false);
  const [showPurpleBoxes, setShowPurpleBoxes] = React.useState(true);
  const [showAllPurpleBoxes, setShowAllPurpleBoxes] = React.useState(false);
  const [showGreenBoxes, setShowGreenBoxes] = React.useState(false);
  const [selectedSeparator, setSelectedSeparator] = React.useState<SeparatorTarget | null>(null);
  const [previewValues, setPreviewValues] = React.useState<Record<string, any>>({});
  const [previewCoded, setPreviewCoded] = React.useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragDropProblemVisible, setDragDropProblemVisible] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [highlySensitive, setHighlySensitive] = React.useState(false);
  const [finalChecked, setFinalChecked] = React.useState(false);
  const [footerUsername, setFooterUsername] = React.useState('');
  const [footerPassword, setFooterPassword] = React.useState('');
  const passwordTimeoutRef = React.useRef<number | null>(null);
  const [authMode, setAuthMode] = React.useState<AuthMode>('login');
  const [dbPublicDesign, setDbPublicDesign] = React.useState<DesignerSpec | null>(null);
  const [designerPassword, setDesignerPassword] = React.useState<string | null>(null);
  const [sessionToken, setSessionToken] = React.useState<string | null>(() => getCookieValue(composerSessionCookieName) || localStorage.getItem(composerSessionCookieName) || getCookieValue(legacyControllerSessionCookieName) || localStorage.getItem(legacyControllerSessionCookieName) || localStorage.getItem('formBuilder2DesignerSession') || null);
  const leftPanelRef = React.useRef<HTMLElement | null>(null);
  const rightPanelScrollRef = React.useRef<HTMLDivElement | null>(null);
  const prefsRestoredRef = React.useRef(false);
  const prefsSaveTimeoutRef = React.useRef<number | null>(null);
  const dragDropProblemTimeoutRef = React.useRef<number | null>(null);
  const previewDesignIdRef = React.useRef<string | null>(null);
  const { showDirectTooltip, showDirectTooltipForControl, hideTooltip, renderTooltips } = useFbTooltips();

  const activeDesign = designs.find((design) => design.id === activeDesignId) || null;
  const activeDesignDirty = !!activeDesign && savedDesignSignatures[activeDesign.id] !== designSignature(activeDesign);
  const saveButtonState: 'saved' | 'saving' | 'dirty' = savingDesign ? 'saving' : activeDesignDirty ? 'dirty' : 'saved';
  const saveButtonLabel = saveButtonState === 'saved' ? 'Saved' : saveButtonState === 'saving' ? 'Saving...' : 'Save';
  const publicDesign = publicId ? dbPublicDesign : null;
  const displayedDesign = publicId ? publicDesign : activeDesign;
  const selectedPath = displayedDesign && selectedId !== 'form' ? findComponentPath(displayedDesign.components, selectedId) || [] : [];
  const selectedComponent = selectedPath[selectedPath.length - 1] || null;
  const selectedParent = selectedPath.length > 1 ? selectedPath[selectedPath.length - 2] : null;
  const publicUrl = displayedDesign ? `${window.location.origin}/formBuilder2/userForm.html#${displayedDesign.publicId}` : '';
  const sectionComponents = displayedDesign ? allComponents(displayedDesign.components).filter((component) => component.type === 'fbSection') : [];
  const greenBoxesVisible = !publicId && !readOnlyPreview && showGreenBoxes;

  useEditFormLabelEqualization(!displayedDesign, [displayedDesign?.id, displayedDesign?.components, readOnlyPreview, greenBoxesVisible]);

  const collectDefaultPreviewValues = React.useCallback((components: DesignerComponentSpec[], parent?: DesignerComponentSpec) => {
    const defaults: Record<string, string> = {};
    components.forEach((component) => {
      const defaultValue = component.defaultValue || '';
      if (component.type === 'fbRadio' && defaultValue) {
        defaults[parent?.type === 'fbGroup' ? parent.id : component.id] = component.id;
      } else if (component.type === 'fbCheck' && defaultValue) {
        defaults[component.id] = 'checked';
      } else if (defaultValue && !['fbSection', 'fbGridRow', 'fbGridCell', 'fbGroup', 'fbTable'].includes(component.type)) {
        defaults[component.id] = defaultValue;
      }
      Object.assign(defaults, collectDefaultPreviewValues(component.children || [], component));
    });
    return defaults;
  }, []);

  const applyDesignerPrefs = React.useCallback((prefs: DesignerPrefs | undefined) => {
    if (!prefs) return;
    if (typeof prefs.showRowsAndCellsInBreadcrumbs === 'boolean') setShowRowsAndCellsInBreadcrumbs(prefs.showRowsAndCellsInBreadcrumbs);
    if (typeof prefs.showPurpleBoxes === 'boolean') setShowPurpleBoxes(prefs.showPurpleBoxes);
    if (typeof prefs.showAllPurpleBoxes === 'boolean') setShowAllPurpleBoxes(prefs.showAllPurpleBoxes);
    if (typeof prefs.showGreenBoxes === 'boolean') setShowGreenBoxes(prefs.showGreenBoxes);
    if (prefs.activeDesignId) setActiveDesignId(prefs.activeDesignId);
    window.setTimeout(() => {
      if (typeof prefs.leftScrollTop === 'number' && leftPanelRef.current) leftPanelRef.current.scrollTop = prefs.leftScrollTop;
      if (typeof prefs.rightScrollTop === 'number' && rightPanelScrollRef.current) rightPanelScrollRef.current.scrollTop = prefs.rightScrollTop;
    }, 0);
  }, []);

  const currentDesignerPrefs = React.useCallback((): DesignerPrefs => ({
    activeDesignId,
    showRowsAndCellsInBreadcrumbs,
    showPurpleBoxes,
    showAllPurpleBoxes,
    showGreenBoxes,
    leftScrollTop: leftPanelRef.current?.scrollTop || 0,
    rightScrollTop: rightPanelScrollRef.current?.scrollTop || 0,
  }), [activeDesignId, showRowsAndCellsInBreadcrumbs, showPurpleBoxes, showAllPurpleBoxes, showGreenBoxes]);

  React.useEffect(() => {
    if (publicDesign) {
      setActiveDesignId(publicDesign.id);
      setReadOnlyPreview(false);
      setSelectedId('form');
    }
  }, [publicDesign?.id]);

  React.useEffect(() => {
    if (!displayedDesign) return;
    const defaults = collectDefaultPreviewValues(displayedDesign.components);
    if (previewDesignIdRef.current !== displayedDesign.id) {
      previewDesignIdRef.current = displayedDesign.id;
      setPreviewValues(defaults);
      return;
    }
    if (Object.keys(defaults).length === 0) return;
    setPreviewValues((current) => {
      let changed = false;
      const next = { ...current };
      Object.entries(defaults).forEach(([id, value]) => {
        if (next[id] === undefined) {
          next[id] = value;
          changed = true;
        }
      });
      return changed ? next : current;
    });
  }, [collectDefaultPreviewValues, displayedDesign?.id, displayedDesign?.components]);

  React.useEffect(() => {
    if (selectedSeparator && selectedId !== selectedSeparator.id) setSelectedSeparator(null);
  }, [selectedId, selectedSeparator]);

  React.useEffect(() => {
    if (publicId || email || !sessionToken) return;
    resumeDesignerSession(sessionToken)
      .then((session) => {
        if (!session.email) return;
        setEmail(normaliseDesignerEmail(session.email));
        rememberComposerSession(sessionToken, session.expiresAt);
        loadDbDesignsForSession(sessionToken)
          .then((dbDesigns) => {
            if (dbDesigns.length > 0) persist(dbDesigns, true);
          })
          .catch(() => {});
        applyDesignerPrefs(session.prefs);
        prefsRestoredRef.current = true;
      })
      .catch(() => {
        localStorage.removeItem(composerSessionCookieName);
        localStorage.removeItem(legacyControllerSessionCookieName);
        localStorage.removeItem('formBuilder2DesignerSession');
        clearComposerSessionCookie();
        setSessionToken(null);
      });
  }, [applyDesignerPrefs, email, publicId, sessionToken]);

  React.useEffect(() => {
    if (!email || publicId) return;
    if (!designerPassword) return;
    loadDbDesigns(email, designerPassword)
      .then((dbDesigns) => {
        if (dbDesigns.length > 0) persist(dbDesigns, true);
      })
      .catch(() => {});
  }, [email, designerPassword, publicId]);

  React.useEffect(() => {
    if (!sessionToken || publicId || !email || !prefsRestoredRef.current) return;
    if (prefsSaveTimeoutRef.current) window.clearTimeout(prefsSaveTimeoutRef.current);
    prefsSaveTimeoutRef.current = window.setTimeout(() => {
      saveDesignerPrefs(sessionToken, currentDesignerPrefs()).catch(() => {});
    }, 1000);
    return () => {
      if (prefsSaveTimeoutRef.current) window.clearTimeout(prefsSaveTimeoutRef.current);
    };
  }, [activeDesignId, currentDesignerPrefs, email, publicId, sessionToken, showAllPurpleBoxes, showGreenBoxes, showPurpleBoxes, showRowsAndCellsInBreadcrumbs]);

  React.useEffect(() => () => {
    if (dragDropProblemTimeoutRef.current) window.clearTimeout(dragDropProblemTimeoutRef.current);
  }, []);

  React.useEffect(() => {
    if (!publicId) return;
    loadDbPublicDesign(publicId)
      .then((design) => setDbPublicDesign(design))
      .catch(() => {});
  }, [publicId]);

  const markDesignsSaved = (savedDesigns: DesignerSpec[]) => {
    setSavedDesignSignatures((current) => {
      const next = { ...current };
      savedDesigns.forEach((design) => {
        next[design.id] = designSignature(design);
      });
      return next;
    });
  };

  const persist = (nextDesigns: DesignerSpec[], markSaved = false) => {
    setDesigns(nextDesigns);
    if (markSaved) markDesignsSaved(nextDesigns);
  };

  const persistAndSave = (nextDesigns: DesignerSpec[], designToSave?: DesignerSpec) => {
    persist(nextDesigns);
    const target = designToSave || nextDesigns.find((design) => design.id === activeDesignId);
    if (email && target && (designerPassword || sessionToken)) saveDbDesign(email, designerPassword || '', target, sessionToken || undefined).catch(() => {});
  };

  const clearAuthFormInputs = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRepeatPassword('');
    setVerificationCode('');
  };

  const updateActiveDesign = (updater: (design: DesignerSpec) => DesignerSpec) => {
    if (!activeDesignId || publicId) return;
    const nextDesigns = designs.map((design) => design.id === activeDesignId ? updater(design) : design);
    persistAndSave(nextDesigns, nextDesigns.find((design) => design.id === activeDesignId));
  };

  const saveActiveDesign = async () => {
    if (!activeDesign || publicId || savingDesign || !activeDesignDirty) return;
    const savedDesign = { ...activeDesign, savedAt: new Date().toISOString() };
    const nextDesigns = designs.map((design) => design.id === savedDesign.id ? savedDesign : design);
    setSavingDesign(true);
    persist(nextDesigns);
    try {
      if (email && (designerPassword || sessionToken)) {
        await saveDbDesign(email, designerPassword || '', savedDesign, sessionToken || undefined);
      }
      markDesignsSaved([savedDesign]);
    } catch {
      alert('Design may not have been saved');
    } finally {
      setSavingDesign(false);
    }
  };

  const applyJsonDraft = () => {
    if (!activeDesign) return;
    try {
      const parsed = ensureDesignerSpecKeys(JSON.parse(jsonDraft));
      const replacement: DesignerSpec = {
        ...activeDesign,
        ...parsed,
        id: parsed.id || activeDesign.id,
        publicId: parsed.publicId || activeDesign.publicId,
        patientUuid: parsed.patientUuid || activeDesign.patientUuid,
        title: parsed.title || activeDesign.title,
        components: parsed.components || [],
      };
      const nextDesigns = designs.map((design) => design.id === activeDesign.id ? replacement : design);
      persistAndSave(nextDesigns, replacement);
      setActiveDesignId(replacement.id);
      setSelectedId('form');
      setShowJson(false);
    } catch {
      alert('Invalid JSON');
    }
  };

  const login = async () => {
    const cleanEmail = normaliseDesignerEmail(loginEmail);
    if (!cleanEmail.endsWith('@wales.nhs.uk')) {
      setLoginMessage('Email address must end with @wales.nhs.uk');
      return;
    }
    if (!loginPassword) {
      setLoginMessage('Password is required');
      return;
    }
    try {
      const session = await designerAuthRequest('login', cleanEmail, loginPassword, rememberMe);
      setDesignerPassword(loginPassword);
      setEmail(cleanEmail);
      if (session.sessionToken) {
        setSessionToken(session.sessionToken);
        rememberComposerSession(session.sessionToken, session.expiresAt);
      }
      applyDesignerPrefs(session.prefs);
      prefsRestoredRef.current = true;
      clearAuthFormInputs();
      setLoginMessage('');
    } catch {
      setLoginMessage('Login failed');
    }
  };

  const validateRegistrationInputs = () => {
    const cleanEmail = normaliseDesignerEmail(registerEmail);
    if (!cleanEmail.endsWith('@wales.nhs.uk')) {
      setRegistrationMessage('Email address must end with @wales.nhs.uk');
      return false;
    }
    if (registerPassword.length < 12) {
      setRegistrationMessage('Password must be at least 12 characters');
      return false;
    }
    if (registerPassword !== repeatPassword) {
      setRegistrationMessage('Passwords do not match');
      return false;
    }
    return true;
  };

  const startRegistration = async () => {
    if (!validateRegistrationInputs()) return;
    try {
      await designerAuthRequest('register-start', normaliseDesignerEmail(registerEmail), registerPassword);
      setRegistrationStep('code');
      setVerificationCode('');
      setRegistrationMessage('');
    } catch {
      setRegistrationMessage('Registration failed');
    }
  };

  const resendRegistrationCode = async () => {
    if (!validateRegistrationInputs()) return;
    try {
      await designerAuthRequest('register-resend', normaliseDesignerEmail(registerEmail), registerPassword);
      setRegistrationStep('code');
      setVerificationCode('');
      setRegistrationMessage('');
    } catch {
      setRegistrationMessage('Registration failed');
    }
  };

  const verifyRegistration = async () => {
    try {
      const cleanEmail = normaliseDesignerEmail(registerEmail);
      await verifyDesignerRegistration(cleanEmail, registerPassword, verificationCode);
      const session = await designerAuthRequest('login', cleanEmail, registerPassword, rememberMe);
      setDesignerPassword(registerPassword);
      setEmail(cleanEmail);
      if (session.sessionToken) {
        setSessionToken(session.sessionToken);
        rememberComposerSession(session.sessionToken, session.expiresAt);
      }
      applyDesignerPrefs(session.prefs);
      prefsRestoredRef.current = true;
      clearAuthFormInputs();
      setRegistrationMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '';
      setRegistrationStep(reason === 'expired' ? 'expired' : reason === 'incorrect' ? 'incorrect' : 'form');
      setRegistrationMessage(reason === 'expired'
        ? 'The verification code is no longer valid'
        : reason === 'incorrect'
          ? 'The verification code is incorrect'
          : 'Registration failed');
    }
  };

  const newDesign = () => {
    const design: DesignerSpec = {
      id: randomUuid(),
      publicId: randomHex(),
      title: nextFormTitle(designs),
      patientUuid: DONALD_DUCK_PATIENT_UUID,
      components: [],
      savedAt: new Date().toISOString(),
    };
    persistAndSave([design, ...designs], design);
    setActiveDesignId(design.id);
    setSelectedId('form');
  };

  const addComponent = (parentId: string, type: DesignerComponentType, action: AddAction = 'append') => {
    if (!displayedDesign || publicId) return;
    const existing = allComponents(displayedDesign.components);
    const parent = parentId === 'form' ? null : existing.find((component) => component.id === parentId) || null;
    const selected = selectedId === 'form' ? null : existing.find((component) => component.id === selectedId) || null;
    const selectedPathNow = selectedId === 'form' ? [] : findComponentPath(displayedDesign.components, selectedId) || [];
    const selectedParentNow = selectedPathNow.length > 1 ? selectedPathNow[selectedPathNow.length - 2] : null;
    const actionCell = parent?.type === 'fbGridCell' ? parent : selected?.type === 'fbGridCell' ? selected : null;
    const actionCellParent = actionCell ? (findComponentPath(displayedDesign.components, actionCell.id) || []).slice(-2, -1)[0] || null : null;
    let component = makeComponent(type, existing);
    let nextSelectedId = component.id;

    updateActiveDesign((design) => {
      let components = design.components;
      if (action === 'separatorInsert' && selectedSeparator) {
        if (selectedSeparator.orientation === 'tallForSingle') {
          const originalIndex = selectedSeparator.id.includes('single-right')
            ? selectedSeparator.index - 1
            : selectedSeparator.index;
          const original = childrenForParent(design.components, selectedSeparator.parentId)[originalIndex];
          if (original && questionTypes.includes(type)) {
            const insertedComponent = component;
            const firstChild = selectedSeparator.id.includes('single-right') ? original : insertedComponent;
            const secondChild = selectedSeparator.id.includes('single-right') ? insertedComponent : original;
            const firstCell = { ...makeComponent('fbGridCell', existing), children: [firstChild] };
            const secondCell = { ...makeComponent('fbGridCell', [...existing, firstCell]), children: [secondChild] };
            component = { ...makeComponent('fbGridRow', [...existing, firstCell, secondCell]), children: [firstCell, secondCell] };
            nextSelectedId = insertedComponent.id;
            components = replaceChildAtWithRow(components, selectedSeparator.parentId, originalIndex, component);
          } else {
            components = insertIntoParentAt(components, selectedSeparator.parentId, selectedSeparator.index, component);
          }
        } else if (parent?.type === 'fbGridRow' && questionTypes.includes(type)) {
          component = { ...makeComponent('fbGridCell', existing), children: [component] };
          nextSelectedId = component.id;
          components = insertIntoParentAt(components, selectedSeparator.parentId, selectedSeparator.index, component);
        } else {
          components = insertIntoParentAt(components, selectedSeparator.parentId, selectedSeparator.index, component);
        }
      } else if (action === 'componentRight' && selected) {
        if (selectedParentNow?.type === 'fbGridCell') {
          const row = (findComponentPath(design.components, selectedParentNow.id) || []).slice(-2, -1)[0] || null;
          if (row?.type === 'fbGridRow') {
            const cell = { ...makeComponent('fbGridCell', existing), children: [component] };
            components = insertChildAfter(components, row.id, selectedParentNow.id, cell);
          }
        } else {
          const parentIdForSelected = selectedParentNow?.id || 'form';
          const selectedIndex = childrenForParent(design.components, parentIdForSelected).findIndex((child) => child.id === selected.id);
          if (selectedIndex >= 0 && questionTypes.includes(type)) {
            const firstCell = { ...makeComponent('fbGridCell', existing), children: [selected] };
            const secondCell = { ...makeComponent('fbGridCell', [...existing, firstCell]), children: [component] };
            const row = { ...makeComponent('fbGridRow', [...existing, firstCell, secondCell]), children: [firstCell, secondCell] };
            components = replaceChildAtWithRow(components, parentIdForSelected, selectedIndex, row);
          }
        }
      } else if (action === 'componentBelow' && selected) {
        components = insertAfterComponent(components, selected.id, component);
      } else if (action === 'rowEnd' && parent?.type === 'fbGridRow') {
        const insertedComponent = component;
        component = { ...makeComponent('fbGridCell', existing), children: [insertedComponent] };
        nextSelectedId = insertedComponent.id;
        components = insertIntoParent(components, parentId, component);
      } else if (action === 'afterSelected' && selected) {
        components = insertAfterComponent(components, selected.id, component);
      } else if (action === 'singleBelowRow' && selected?.type === 'fbGridRow') {
        components = insertAfterComponent(components, selected.id, component);
      } else if (action === 'rowBelow' && selected?.type === 'fbGridRow') {
        component = type === 'fbGridRow'
          ? makeComponent('fbGridRow', existing)
          : { ...makeComponent('fbGridRow', existing), children: [{ ...makeComponent('fbGridCell', existing), children: [component] }] };
        nextSelectedId = component.id;
        components = insertAfterComponent(components, selected.id, component);
      } else if (action === 'cellRight' && actionCell?.type === 'fbGridCell' && actionCellParent?.type === 'fbGridRow') {
        const cell = { ...makeComponent('fbGridCell', existing), children: [component] };
        nextSelectedId = cell.id;
        components = insertChildAfter(components, actionCellParent.id, actionCell.id, cell);
      } else if (action === 'cellBelow' && actionCell?.type === 'fbGridCell') {
        components = insertIntoParent(components, actionCell.id, component);
      } else if (action === 'groupOption' && selected?.type === 'fbGroup') {
        components = insertIntoParent(components, selected.id, component);
      } else if (action === 'questionBelow' && selected) {
        components = insertAfterComponent(components, selected.id, component);
      } else if (action === 'subquestion' && selected) {
        components = insertIntoParent(components, selected.id, component);
      } else if (parent?.type === 'fbGridRow') {
        const insertedComponent = component;
        component = { ...makeComponent('fbGridCell', existing), children: [insertedComponent] };
        nextSelectedId = insertedComponent.id;
        components = insertIntoParent(components, parentId, component);
      } else {
        components = insertIntoParent(components, parentId, component);
      }
      return { ...design, components };
    });
    setSelectedId(nextSelectedId);
    setSelectedTableTarget(null);
    if (action === 'subquestion' && selected) {
      setPreviewValues((current) => {
        if (selected.type === 'fbCheck') return { ...current, [selected.id]: 'checked' };
        if (selected.type === 'fbRadio' && selectedParentNow?.type === 'fbGroup') return { ...current, [selectedParentNow.id]: selected.id };
        if (selected.type === 'fbRadio') return { ...current, [selected.id]: selected.id };
        return current;
      });
    }
    setSelectedSeparator(null);
    setAddMenu(null);
  };

  const updateComponent = (id: string, patch: Partial<DesignerComponentSpec>) => {
    updateActiveDesign((design) => ({
      ...design,
      components: mapComponents(design.components, (component) => component.id === id ? { ...component, ...patch } : component),
    }));
  };

  const normaliseTableTemplates = (table: DesignerComponentSpec) => {
    const columns = normaliseTableColumns(table);
    const templates = [...(table.tableCellTemplates || [])];
    while (templates.length < columns.length) templates.push(null);
    return templates.slice(0, columns.length);
  };

  const updateTable = (tableId: string, updater: (table: DesignerComponentSpec) => DesignerComponentSpec) => {
    updateActiveDesign((design) => ({
      ...design,
      components: mapComponents(design.components, (component) => component.id === tableId ? updater(component) : component),
    }));
  };

  const selectTableHeader = (tableId: string, columnIndex: number) => {
    setSelectedId(tableId);
    setSelectedTableTarget({ kind: 'header', tableId, columnIndex });
    setSelectedSeparator(null);
  };

  const selectTableRow = (tableId: string, rowIndex: number) => {
    setSelectedId(tableId);
    setSelectedTableTarget({ kind: 'row', tableId, rowIndex });
    setSelectedSeparator(null);
  };

  const selectTableCell = (tableId: string, rowIndex: number, columnIndex: number) => {
    setSelectedId(tableId);
    setSelectedTableTarget({ kind: 'cell', tableId, rowIndex, columnIndex });
    setSelectedSeparator(null);
  };

  const selectTableSeparator = (tableId: string, separatorIndex: number) => {
    setSelectedId(tableId);
    setSelectedTableTarget({ kind: 'separator', tableId, separatorIndex });
    setSelectedSeparator(null);
  };

  const updateTableColumnLabel = (tableId: string, columnIndex: number, label: string) => {
    updateTable(tableId, (table) => {
      const columns = normaliseTableColumns(table);
      columns[columnIndex] = label || `Column ${columnIndex + 1}`;
      return { ...table, tableColumns: columns };
    });
  };

  const addTableColumnRight = () => {
    if (!selectedTableTarget || selectedTableTarget.kind !== 'header') return;
    updateTable(selectedTableTarget.tableId, (table) => {
      const columns = normaliseTableColumns(table);
      const templates = normaliseTableTemplates(table);
      columns.splice(selectedTableTarget.columnIndex + 1, 0, `Column ${columns.length + 1}`);
      templates.splice(selectedTableTarget.columnIndex + 1, 0, null);
      return { ...table, tableColumns: columns, tableCellTemplates: templates };
    });
    setSelectedTableTarget({ ...selectedTableTarget, columnIndex: selectedTableTarget.columnIndex + 1 });
  };

  const deleteTableColumn = () => {
    if (!selectedTableTarget || selectedTableTarget.kind !== 'header') return;
    updateTable(selectedTableTarget.tableId, (table) => {
      const columns = normaliseTableColumns(table);
      if (columns.length <= 1) return table;
      const templates = normaliseTableTemplates(table);
      columns.splice(selectedTableTarget.columnIndex, 1);
      templates.splice(selectedTableTarget.columnIndex, 1);
      return { ...table, tableColumns: columns, tableCellTemplates: templates };
    });
    setSelectedTableTarget({ ...selectedTableTarget, columnIndex: Math.max(0, selectedTableTarget.columnIndex - 1) });
  };

  const deleteTableRow = () => {
    if (!selectedTableTarget || selectedTableTarget.kind !== 'row') return;
    updateTable(selectedTableTarget.tableId, (table) => {
      const rowCount = normaliseTableRowCount(table);
      if (rowCount <= 1) return table;
      return { ...table, tableRows: rowCount - 1 };
    });
    setSelectedTableTarget({ ...selectedTableTarget, rowIndex: Math.max(0, selectedTableTarget.rowIndex - 1) });
  };

  const addTableColumnAtSeparator = () => {
    if (!selectedTableTarget || selectedTableTarget.kind !== 'separator') return;
    updateTable(selectedTableTarget.tableId, (table) => {
      const columns = normaliseTableColumns(table);
      const templates = normaliseTableTemplates(table);
      const insertIndex = Math.max(0, Math.min(columns.length, selectedTableTarget.separatorIndex));
      columns.splice(insertIndex, 0, `Column ${columns.length + 1}`);
      templates.splice(insertIndex, 0, null);
      return { ...table, tableColumns: columns, tableCellTemplates: templates };
    });
    setSelectedTableTarget({ kind: 'header', tableId: selectedTableTarget.tableId, columnIndex: selectedTableTarget.separatorIndex });
  };

  const moveTableColumn = (tableId: string, fromIndex: number, toIndex: number) => {
    updateTable(tableId, (table) => {
      const columns = normaliseTableColumns(table);
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= columns.length || toIndex >= columns.length) return table;
      const templates = normaliseTableTemplates(table);
      const [column] = columns.splice(fromIndex, 1);
      const [template] = templates.splice(fromIndex, 1);
      columns.splice(toIndex, 0, column);
      templates.splice(toIndex, 0, template);
      return { ...table, tableColumns: columns, tableCellTemplates: templates };
    });
    setSelectedTableTarget({ kind: 'header', tableId, columnIndex: toIndex });
  };

  const moveTableColumnToSeparator = (tableId: string, fromIndex: number, separatorIndex: number) => {
    let movedToIndex = fromIndex;
    updateTable(tableId, (table) => {
      const columns = normaliseTableColumns(table);
      if (
        fromIndex < 0 ||
        fromIndex >= columns.length ||
        separatorIndex < 0 ||
        separatorIndex > columns.length
      ) return table;
      const toIndex = fromIndex < separatorIndex ? separatorIndex - 1 : separatorIndex;
      if (fromIndex === toIndex) return table;
      const templates = normaliseTableTemplates(table);
      const [column] = columns.splice(fromIndex, 1);
      const [template] = templates.splice(fromIndex, 1);
      columns.splice(toIndex, 0, column);
      templates.splice(toIndex, 0, template);
      movedToIndex = toIndex;
      return { ...table, tableColumns: columns, tableCellTemplates: templates };
    });
    setSelectedTableTarget({ kind: 'header', tableId, columnIndex: movedToIndex });
  };

  const addComponentToSelectedTableCell = (type: DesignerComponentType) => {
    if (!selectedTableTarget || selectedTableTarget.kind !== 'cell' || !displayedDesign) return;
    const existing = allComponents(displayedDesign.components);
    const component = makeComponent(type, existing);
    updateTable(selectedTableTarget.tableId, (table) => {
      const templates = normaliseTableTemplates(table);
      templates[selectedTableTarget.columnIndex] = component;
      return { ...table, tableCellTemplates: templates };
    });
  };

  const updateSelectedTableCellTemplate = (patch: Partial<DesignerComponentSpec>) => {
    if (!selectedTableTarget || selectedTableTarget.kind !== 'cell') return;
    updateTable(selectedTableTarget.tableId, (table) => {
      const templates = normaliseTableTemplates(table);
      const current = templates[selectedTableTarget.columnIndex];
      if (!current) return table;
      templates[selectedTableTarget.columnIndex] = { ...current, ...patch };
      return { ...table, tableCellTemplates: templates };
    });
  };

  const setPreviewValue = (id: string, value: any) => {
    setPreviewValues((current) => ({ ...current, [id]: value }));
  };

  const setPreviewValueWithCoding = (id: string, value: string, coded?: boolean) => {
    setPreviewValue(id, value);
    if (coded !== undefined) setPreviewCoded((current) => ({ ...current, [id]: coded }));
  };

  const moveDraggedInto = (targetId: string) => {
    if (!draggedId || !displayedDesign || publicId) return;
    const existing = allComponents(displayedDesign.components);
    const dragged = existing.find((component) => component.id === draggedId);
    const target = targetId === 'form' ? null : existing.find((component) => component.id === targetId) || null;
    if (!dragged) return;
    if (targetId === draggedId) return;
    if (target && findComponentPath(displayedDesign.components, target.id)?.some((component) => component.id === draggedId)) return;
    updateActiveDesign((design) => {
      const { components: withoutDragged, extracted } = extractComponent(design.components, draggedId);
      if (!extracted) return design;
      if (targetId === 'form') return { ...design, components: [...withoutDragged, extracted] };
      if (target?.type === 'fbGridRow' && questionTypes.includes(extracted.type)) {
        const cell = { ...makeComponent('fbGridCell', existing), children: [extracted] };
        return { ...design, components: insertIntoParent(withoutDragged, target.id, cell) };
      }
      return { ...design, components: insertIntoParent(withoutDragged, targetId, extracted) };
    });
    setSelectedId(draggedId);
    setDraggedId(null);
  };

  const moveDraggedToSeparator = (target: SeparatorTarget) => {
    if (!draggedId || !displayedDesign || publicId) return;
    const existing = allComponents(displayedDesign.components);
    const dragged = existing.find((component) => component.id === draggedId);
    if (!dragged) return;
    const parent = target.parentId === 'form' ? null : existing.find((component) => component.id === target.parentId) || null;
    updateActiveDesign((design) => {
      if (target.orientation === 'tallForSingle') {
        const originalIndex = target.id.includes('single-right') ? target.index - 1 : target.index;
        const original = childrenForParent(design.components, target.parentId)[originalIndex];
        if (!original || original.id === draggedId || !questionTypes.includes(dragged.type)) return design;
        const draggedPath = findComponentPath(design.components, draggedId) || [];
        const draggedParent = draggedPath.length > 1 ? draggedPath[draggedPath.length - 2] : null;
        const draggedSiblings = childrenForParent(design.components, draggedParent?.id || 'form');
        const draggedSiblingIndex = draggedSiblings.findIndex((child) => child.id === draggedId);
        const adjustedOriginalIndex = draggedParent?.id === target.parentId || (!draggedParent && target.parentId === 'form')
          ? originalIndex - (draggedSiblingIndex >= 0 && draggedSiblingIndex < originalIndex ? 1 : 0)
          : originalIndex;
        const { components: withoutDragged, extracted } = extractComponent(design.components, draggedId);
        if (!extracted) return design;
        const firstChild = target.id.includes('single-right') ? original : extracted;
        const secondChild = target.id.includes('single-right') ? extracted : original;
        const firstCell = { ...makeComponent('fbGridCell', existing), children: [firstChild] };
        const secondCell = { ...makeComponent('fbGridCell', [...existing, firstCell]), children: [secondChild] };
        const row = { ...makeComponent('fbGridRow', [...existing, firstCell, secondCell]), children: [firstCell, secondCell] };
        return { ...design, components: replaceChildAtWithRow(withoutDragged, target.parentId, adjustedOriginalIndex, row) };
      }
      const { components: withoutDragged, extracted } = extractComponent(design.components, draggedId);
      if (!extracted) return design;
      const componentToInsert = parent?.type === 'fbGridRow' && questionTypes.includes(extracted.type)
        ? { ...makeComponent('fbGridCell', existing), children: [extracted] }
        : extracted;
      return { ...design, components: insertIntoParentAt(withoutDragged, target.parentId, target.index, componentToInsert) };
    });
    setSelectedId(draggedId);
    setSelectedSeparator(null);
    setDraggedId(null);
  };

  const moveDraggedBefore = (targetId: string) => {
    if (!draggedId || !displayedDesign || publicId) return;
    const existing = allComponents(displayedDesign.components);
    const targetPath = findComponentPath(displayedDesign.components, targetId) || [];
    const targetParent = targetPath.length > 1 ? targetPath[targetPath.length - 2] : null;
    const targetGrandparent = targetPath.length > 2 ? targetPath[targetPath.length - 3] : null;
    const dragged = existing.find((component) => component.id === draggedId);
    const targetRow = nearestRowInPath(targetPath);
    if (dragged?.type === 'fbGridRow' && targetRow?.id === dragged.id) {
      setDraggedId(null);
      return;
    }
    if (dragged?.type === 'fbGridRow' && targetRow) {
      updateActiveDesign((design) => ({
        ...design,
        components: moveComponentBefore(design.components, dragged.id, targetRow.id),
      }));
      setSelectedId(dragged.id);
      setDraggedId(null);
      return;
    }
    if (
      dragged &&
      questionTypes.includes(dragged.type) &&
      targetParent?.type === 'fbGridCell' &&
      targetGrandparent?.type === 'fbGridRow' &&
      draggedId !== targetParent.id
    ) {
      updateActiveDesign((design) => ({
        ...design,
        components: moveComponentIntoNewCellAfter(design.components, draggedId, targetGrandparent.id, targetParent.id, existing),
      }));
      setSelectedId(draggedId);
      setDraggedId(null);
      return;
    }
    updateActiveDesign((design) => ({
      ...design,
      components: moveComponentBefore(design.components, draggedId, targetId),
    }));
    setSelectedId(draggedId);
    setDraggedId(null);
  };

  const componentTextWeight = (component: DesignerComponentSpec, defaultWeight: React.CSSProperties['fontWeight'] = 500) =>
    component.boldOverride ? 500 : component.plainOverride ? 300 : defaultWeight;

  const renderEditableLabel = (component: DesignerComponentSpec) => {
    const hasLabel = Boolean(component.label.trim());
    if (!hasLabel) return null;
    const labelWeight = componentTextWeight(component, 500);
    const renderMarkers = (
      <>
        {component.requiredForAudit && <FbRequiredForAudit />}
        {component.required && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}
      </>
    );
    return (
      <label
        {...labelTooltipProps(component)}
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: labelWeight,
          color: 'black',
          margin: 0,
          display: 'block',
        }}
      >
        <span
          contentEditable={!publicId && !readOnlyPreview}
          suppressContentEditableWarning
          onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
          style={{ outline: 'none' }}
        >
          {component.label}
        </span>
        {renderMarkers}
      </label>
    );
  };

  const deleteSelected = () => {
    if (!displayedDesign || selectedId === 'form') return;
    updateActiveDesign((design) => ({
      ...design,
      components: mapComponents(design.components, (component) => component.id === selectedId ? null : component),
    }));
    setSelectedId('form');
  };

  const selectedSeparatorEmptyParent = () => {
    if (!selectedSeparator || !displayedDesign || selectedSeparator.parentId === 'form') return null;
    const parent = allComponents(displayedDesign.components).find((component) => component.id === selectedSeparator.parentId) || null;
    if (!parent || !['fbSection', 'fbGridRow', 'fbGridCell'].includes(parent.type)) return null;
    return (parent.children || []).length === 0 ? parent : null;
  };

  const deleteSelectedSeparatorParent = () => {
    const parent = selectedSeparatorEmptyParent();
    if (!parent) return;
    updateActiveDesign((design) => ({
      ...design,
      components: mapComponents(design.components, (component) => component.id === parent.id ? null : component),
    }));
    setSelectedSeparator(null);
    setSelectedId('form');
  };

  const selectedDirectCell = selectedParent?.type === 'fbGridCell' ? selectedParent : null;
  const selectedDirectCellRow = selectedDirectCell
    ? (selectedPath.length > 2 ? selectedPath[selectedPath.length - 3] : null)
    : null;
  const canRemoveEnclosingRowAndCell = Boolean(
    selectedComponent &&
    selectedDirectCell &&
    selectedDirectCellRow?.type === 'fbGridRow' &&
    (selectedDirectCell.children || []).length === 1 &&
    (selectedDirectCellRow.children || []).length === 1
  );

  const removeEnclosingRowAndCell = () => {
    if (!displayedDesign || !selectedComponent || !selectedDirectCellRow || !canRemoveEnclosingRowAndCell) return;
    const selected = selectedComponent;
    const row = selectedDirectCellRow;
    updateActiveDesign((design) => {
      const replaceRow = (components: DesignerComponentSpec[]): DesignerComponentSpec[] => components.flatMap((component) => {
        if (component.id === row.id) return [selected];
        return [{ ...component, children: component.children ? replaceRow(component.children) : component.children }];
      });
      return { ...design, components: replaceRow(design.components) };
    });
    setSelectedId(selected.id);
  };

  const deleteActiveDesign = () => {
    if (!activeDesign) return;
    const deletedDesign = activeDesign;
    persist(designs.filter((design) => design.id !== deletedDesign.id));
    setActiveDesignId(null);
    if (email && (designerPassword || sessionToken)) {
      deleteDbDesign(email, designerPassword || '', deletedDesign, sessionToken || undefined).catch(() => {});
    }
  };

  const openAddMenu = (event: React.MouseEvent<HTMLButtonElement>, parentId: string, action: AddAction = 'append', label?: string) => {
    event.stopPropagation();
    if (publicId) return;
    setAddMenu({ parentId, rect: event.currentTarget.getBoundingClientRect(), action, label });
  };

  const labelTooltipProps = (component: DesignerComponentSpec) => component.tooltip ? {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => showDirectTooltip(component.tooltip || '', event.currentTarget),
    onMouseLeave: hideTooltip,
  } : {};

  const controlTooltipProps = (component: DesignerComponentSpec, belowLabel = false) => component.tooltip && !component.label.trim() ? {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => showDirectTooltipForControl(component.tooltip || '', event.currentTarget, belowLabel),
    onMouseLeave: hideTooltip,
    onFocus: (event: React.FocusEvent<HTMLElement>) => showDirectTooltipForControl(component.tooltip || '', event.currentTarget, belowLabel),
    onBlur: hideTooltip,
  } : {};

  const componentValue = (component: DesignerComponentSpec) => previewValues[component.id] ?? '';

  const componentStringValue = (component: DesignerComponentSpec) => {
    const value = componentValue(component);
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '';
  };

  const isQuestionDataVisibleInRoV = (component: DesignerComponentSpec) => {
    if (component.showInRoVIfEmpty) return true;
    const value = componentValue(component);
    const stringValue = componentStringValue(component);
    if (component.type === 'fbBloodPressure' && value && typeof value === 'object') {
      return Boolean(String(value.systolic || '').trim() || String(value.diastolic || '').trim());
    }
    if (component.type === 'fbCheck') return stringValue.split('|').filter(Boolean).length > 0 || stringValue === 'checked';
    if (component.type === 'fbRadio') return Boolean(stringValue);
    return Boolean(stringValue.trim());
  };

  const componentHasRoVData = (component: DesignerComponentSpec): boolean => {
    if (component.showInRoVIfEmpty) return true;
    if (component.type === 'fbTable') return true;
    if (['fbSection', 'fbGridRow', 'fbGridCell', 'fbGroup'].includes(component.type)) {
      return (component.children || []).some(componentHasRoVData);
    }
    return isQuestionDataVisibleInRoV(component) || (component.children || []).some(componentHasRoVData);
  };

  const copyPublicUrl = () => {
    if (publicUrl) navigator.clipboard?.writeText(publicUrl);
  };

  const showDragDropProblem = () => {
    setDragDropProblemVisible(true);
    if (dragDropProblemTimeoutRef.current) window.clearTimeout(dragDropProblemTimeoutRef.current);
    dragDropProblemTimeoutRef.current = window.setTimeout(() => {
      setDragDropProblemVisible(false);
      dragDropProblemTimeoutRef.current = null;
    }, 600);
  };

  const handleInvalidDrop = (event: React.DragEvent<HTMLElement>) => {
    if (!draggedId) return;
    event.preventDefault();
    event.stopPropagation();
    setDraggedId(null);
    showDragDropProblem();
  };

  const canDropOnSeparator = (target: SeparatorTarget) => {
    if (!draggedId || !displayedDesign || publicId) return false;
    const existing = allComponents(displayedDesign.components);
    const dragged = existing.find((component) => component.id === draggedId);
    const parent = target.parentId === 'form' ? null : existing.find((component) => component.id === target.parentId) || null;
    if (!dragged || dragged.id === target.parentId) return false;
    const parentPath = target.parentId === 'form' ? [] : findComponentPath(displayedDesign.components, target.parentId) || [];
    if (parentPath.some((component) => component.id === dragged.id)) return false;
    if (target.orientation === 'tallForSingle') {
      return questionTypes.includes(dragged.type) && (target.parentId === 'form' || parent?.type === 'fbSection');
    }
    if (dragged.type === 'fbGridRow') return target.parentId === 'form' || parent?.type === 'fbSection';
    if (dragged.type === 'fbGridCell') return parent?.type === 'fbGridRow';
    if (parent?.type === 'fbGridRow') return questionTypes.includes(dragged.type);
    if (parent?.type === 'fbGroup') return dragged.type === 'fbRadio' || dragged.type === 'fbCheck';
    return true;
  };

  const scrollDesignerSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    const scrollContainer = sectionElement?.closest('[data-designer-scroll-container="true"]') as HTMLElement | null;
    if (!sectionElement || !scrollContainer) return;
    const sectionRect = sectionElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    scrollContainer.scrollTo({
      top: Math.max(0, scrollContainer.scrollTop + sectionRect.top - containerRect.top),
      behavior: 'smooth',
    });
  };

  const renderSelectionChrome = (component: DesignerComponentSpec, children: React.ReactNode, options: SelectionChromeOptions = {}) => {
    const selected = selectedId === component.id && !publicId;
    const tableSubSelectionActive = component.type === 'fbTable' && selectedTableTarget?.tableId === component.id;
    const showSelectedComponentChrome = selected && showPurpleBoxes && !tableSubSelectionActive;
    const showSelectedHandle = greenBoxesVisible && !publicId && (showSelectedComponentChrome || showAllPurpleBoxes);
    return (
      <div
        key={component.key || component.id}
        data-designer-component-id={component.id}
        onDragOver={(event) => {
          if (draggedId) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'none';
          }
        }}
        onDrop={handleInvalidDrop}
        style={{
          position: 'relative',
          border: (showSelectedComponentChrome || showAllPurpleBoxes) ? `0.1rem solid ${purple}` : '0.1rem solid transparent',
          borderRadius: 0,
          padding: (showSelectedComponentChrome || showAllPurpleBoxes) && (component.type === 'fbSection' || component.type === 'fbGridRow' || component.type === 'fbGridCell') ? '0.4rem' : 0,
          marginBottom: options.compact ? 0 : '0.35rem',
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (!publicId) {
            setSelectedId(component.id);
            setSelectedTableTarget(null);
          }
        }}
      >
        {showSelectedHandle && (
          <div
            draggable
            onDragStart={(event) => {
              event.stopPropagation();
              setDraggedId(component.id);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', component.id);
            }}
            onDragEnd={() => setDraggedId(null)}
            style={{ position: 'absolute', top: '-0.1rem', left: '-0.1rem', width: '1rem', height: '1rem', backgroundColor: purple, zIndex: 2, cursor: 'grab' }}
          />
        )}
        {children}
      </div>
    );
  };

  const renderQuestion = (
    component: DesignerComponentSpec,
    patchComponent: (id: string, patch: Partial<DesignerComponentSpec>) => void = updateComponent,
  ) => {
    const value = previewValues[component.id] ?? '';
    const stringValue = typeof value === 'string' ? value : '';
    const hasLabel = Boolean(component.label.trim());
    const inputRequired = hasLabel ? false : component.required;
    if (readOnlyPreview) {
      if (!isQuestionDataVisibleInRoV(component)) return null;
      const optionLabels = (component.options || [])
        .filter((option) => component.type === 'fbCheck'
          ? stringValue.split('|').includes(option.value)
          : option.value === stringValue)
        .map((option) => option.label);
      const displayValue = optionLabels.length > 0
        ? optionLabels.join(', ')
        : component.type === 'fbBloodPressure' && value && typeof value === 'object'
          ? [value.systolic, value.diastolic].filter(Boolean).join('/') + (value.systolic || value.diastolic ? ' mmHg' : '')
        : (component.type === 'fbRadio' || component.type === 'fbCheck') && stringValue
          ? component.label
        : component.type === 'fbNumberInputWithUnits' && stringValue
          ? `${stringValue} ${component.units || 'units'}`
          : stringValue;
      const coded = ['fbMSISelector', 'fbSCTDiagnosis', 'fbSCTProcedure'].includes(component.type)
        ? (previewCoded[component.id] ?? true)
        : undefined;
      return (
        <div className="fb-question-container" style={{ marginBottom: '0.4rem' }}>
          {hasLabel && <label {...labelTooltipProps(component)} style={{ fontWeight: componentTextWeight(component, 300), fontSize: '0.8rem' }}>{component.label}{component.requiredForAudit && <FbRequiredForAudit />}{component.required && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}</label>}
          <div
            className={coded !== undefined ? 'fb-rov-field-value-inline' : undefined}
            style={{ fontWeight: componentTextWeight(component, 500), minHeight: '1.4rem', marginLeft: '0.4rem', whiteSpace: 'pre-line' }}
            {...controlTooltipProps(component)}
          >
            <span>{displayValue}</span>
            {coded !== undefined && <FbRoVCodedIcon coded={coded} />}
          </div>
        </div>
      );
    }
    if (component.type === 'fbTextInput') {
      return <div className="fb-question-container">{renderEditableLabel(component)}<FbTextInput id={component.id} name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} showRequiredMarkers={!hasLabel} value={value} placeholder={component.placeholder || ''} onChange={(nextValue) => setPreviewValue(component.id, nextValue)} {...controlTooltipProps(component)} /></div>;
    }
    if (component.type === 'fbTime') {
      return <div className="fb-question-container">{renderEditableLabel(component)}<FbTime id={component.id} name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} value={value} placeholder={component.placeholder || ''} onChange={(nextValue) => setPreviewValue(component.id, nextValue)} {...controlTooltipProps(component)} /></div>;
    }
    if (component.type === 'fbTextArea') {
      return <div className="fb-question-container">{renderEditableLabel(component)}<FbTextArea id={component.id} name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} value={value} placeholder={component.placeholder || ''} fullWidth={!!component.fullWidth} onChange={(nextValue) => setPreviewValue(component.id, nextValue)} {...controlTooltipProps(component)} /></div>;
    }
    if (component.type === 'fbDropdown') return <div className="fb-question-container">{renderEditableLabel(component)}<FbDropdown id={component.id} name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} value={value} onChange={(nextValue) => setPreviewValue(component.id, nextValue)} options={component.options || []} {...controlTooltipProps(component)} /></div>;
    if (component.type === 'fbNumberInput') return <div className="fb-question-container">{renderEditableLabel(component)}<FbNumberInput id={component.id} name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} value={value} placeholder={component.placeholder || ''} onChange={(nextValue) => setPreviewValue(component.id, nextValue)} {...controlTooltipProps(component)} /></div>;
    if (component.type === 'fbNumberInputWithUnits') {
      return (
        <div className="fb-question-container">
          {renderEditableLabel(component)}
          <FbNumberInput
            id={component.id}
            name={component.id}
            required={inputRequired}
            requiredForAudit={!hasLabel && component.requiredForAudit}
            value={value}
            onChange={(nextValue) => setPreviewValue(component.id, nextValue)}
            units={component.units || 'units'}
            placeholder={component.placeholder || ''}
            unitLabelProps={{
              className: 'fb-composer-editable-units',
              contentEditable: !publicId && !readOnlyPreview,
              suppressContentEditableWarning: true,
              onClick: (event) => event.stopPropagation(),
              onFocus: () => {
                if (!publicId) setSelectedId(component.id);
              },
              onBlur: (event) => patchComponent(component.id, { units: event.currentTarget.textContent?.trim() || 'units' }),
              style: { userSelect: 'text', outline: 'none', cursor: 'text' },
            }}
            {...controlTooltipProps(component)}
          />
        </div>
      );
    }
    if (component.type === 'fbBloodPressure') {
      const bpValue = typeof value === 'object' && value ? value : { systolic: '', diastolic: '' };
      return (
        <div className="fb-question-container">
          {renderEditableLabel(component)}
          <FbBloodPressure
            id={component.id}
            name={component.id}
            required={inputRequired}
            requiredForAudit={!hasLabel && component.requiredForAudit}
            systolic={bpValue.systolic || ''}
            diastolic={bpValue.diastolic || ''}
            onChange={(nextValue) => setPreviewValue(component.id, nextValue)}
          />
        </div>
      );
    }
    if (component.type === 'fbBoxedWarning') {
      return (
        <FbBoxedWarning text={(
          <span
            contentEditable={!publicId && !readOnlyPreview}
            suppressContentEditableWarning
            onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
            style={{ outline: 'none' }}
          >
            {cleanDisplayLabel(component.label)}
          </span>
        )} />
      );
    }
    if (component.type === 'fbBoxedAlert') {
      return (
        <FbBoxedAlert text={(
          <span
            contentEditable={!publicId && !readOnlyPreview}
            suppressContentEditableWarning
            onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
            style={{ outline: 'none' }}
          >
            {cleanDisplayLabel(component.label)}
          </span>
        )} />
      );
    }
    if (component.type === 'fbBoxedInfo') {
      return (
        <FbBoxedInfo text={(
          <span
            contentEditable={!publicId && !readOnlyPreview}
            suppressContentEditableWarning
            onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
            style={{ outline: 'none' }}
          >
            {cleanDisplayLabel(component.label)}
          </span>
        )} />
      );
    }
    if (component.type === 'fbDatePartial') {
      return <div className="fb-question-container">{renderEditableLabel(component)}<FbPartialDate name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} showRequiredMarkers={!hasLabel} value={value} placeholder={component.placeholder || undefined} onChange={(nextValue) => setPreviewValue(component.id, nextValue)} {...controlTooltipProps(component)} /></div>;
    }
    if (component.type === 'fbDateExact') {
      return <div className="fb-question-container">{renderEditableLabel(component)}<FbExactDate name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} showRequiredMarkers={!hasLabel} value={value} onChange={(nextValue) => setPreviewValue(component.id, nextValue)} {...controlTooltipProps(component)} /></div>;
    }
    if (component.type === 'fbRadio' || component.type === 'fbCheck') {
      const checked = component.type === 'fbRadio'
        ? value === component.id
        : value === 'checked';
      const children = (component.children || []);
      return (
        <div className="fb-question-container">
          <div className="fb-subquestion-wrapper">
            <label
              className="fb-radio-checkbox-item"
              style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.5rem', width: '100%', fontWeight: 300, cursor: 'pointer' }}
              onClick={(event) => {
                event.stopPropagation();
                if (!publicId) setSelectedId(component.id);
              }}
            >
              <input
                id={component.id}
                type={component.type === 'fbRadio' ? 'radio' : 'checkbox'}
                name={component.id}
                value={component.id}
                checked={checked}
                required={inputRequired}
                onChange={(event) => {
                  if (component.type === 'fbRadio') {
                    setPreviewValue(component.id, component.id);
                  } else {
                    setPreviewValue(component.id, event.target.checked ? 'checked' : '');
                  }
                }}
                style={{ flexShrink: 0, cursor: 'pointer' }}
                {...controlTooltipProps(component, true)}
              />
              <span
                contentEditable={!publicId && !readOnlyPreview}
                suppressContentEditableWarning
                onClick={(event) => event.stopPropagation()}
                onFocus={() => {
                  if (!publicId) setSelectedId(component.id);
                }}
                onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
                style={{ fontWeight: componentTextWeight(component, 300), outline: 'none' }}
              >
                {component.label}
                {component.requiredForAudit && <FbRequiredForAudit />}
                {component.required && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}
              </span>
            </label>
            {checked && children.length > 0 && (
              <div className="pl-6 pb-1">
                {children.map((child) => renderDesignedComponent(child))}
              </div>
            )}
          </div>
        </div>
      );
    }
    if (component.type === 'fbMSISelector') {
      return <div className="fb-question-container">{component.valueError && <FbValueError message={component.valueError} />}{renderEditableLabel(component)}<FbMSISelector name={component.id} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} value={value} placeholder={component.placeholder || undefined} onChange={(nextValue, coded) => setPreviewValueWithCoding(component.id, nextValue, coded)} coded={previewCoded[component.id]} hasLabel={hasLabel} {...controlTooltipProps(component)} /></div>;
    }
    if (component.type === 'fbSCTDiagnosis') {
      return <div className="fb-question-container">{component.valueError && <FbValueError message={component.valueError} />}{renderEditableLabel(component)}<FbSCTDiagnosis name={component.id} value={value} placeholder={component.placeholder || undefined} onChange={(nextValue, coded) => setPreviewValueWithCoding(component.id, nextValue, coded)} coded={previewCoded[component.id]} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} {...controlTooltipProps(component)} /></div>;
    }
    if (component.type === 'fbSCTProcedure') {
      return <div className="fb-question-container">{component.valueError && <FbValueError message={component.valueError} />}{renderEditableLabel(component)}<FbSCTProcedure name={component.id} value={value} placeholder={component.placeholder || undefined} onChange={(nextValue, coded) => setPreviewValueWithCoding(component.id, nextValue, coded)} coded={previewCoded[component.id]} required={inputRequired} requiredForAudit={!hasLabel && component.requiredForAudit} {...controlTooltipProps(component)} /></div>;
    }
    return (
      <div className="fb-question-container">
        {renderEditableLabel(component)}
        <input required={inputRequired} value={value} onChange={(event) => setPreviewValue(component.id, event.target.value)} placeholder={component.placeholder || component.type} style={{ width: '100%' }} {...controlTooltipProps(component)} />
        {component.requiredForAudit && <FbRequiredForAudit />}
        {inputRequired && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}
      </div>
    );
  };

  const renderSeparator = (target: SeparatorTarget) => {
    const selected = selectedSeparator?.id === target.id;
    const isTall = target.orientation === 'tall' || target.orientation === 'tallForSingle';
    const isFullSize = Boolean(target.fullSize);
    return (
      <div
        key={target.id}
        className={isTall ? 'fb-designer-row-separator' : undefined}
        data-designer-separator-id={target.id}
        data-designer-drop-zone-id={target.parentId}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedId(target.id);
          setSelectedSeparator(target);
        }}
        onDragOver={(event) => {
          if (draggedId) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = canDropOnSeparator(target) ? 'move' : 'none';
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (canDropOnSeparator(target)) {
            moveDraggedToSeparator(target);
          } else {
            setDraggedId(null);
            showDragDropProblem();
          }
        }}
        style={{
          width: isFullSize ? '100%' : isTall ? fbSeparatorThickness : '100%',
          minWidth: isTall && !isFullSize ? fbSeparatorThickness : undefined,
          height: isFullSize ? fbSeparatorThickness : isTall ? '100%' : fbSeparatorThickness,
          minHeight: isFullSize ? fbSeparatorThickness : isTall ? '2rem' : fbSeparatorThickness,
          border: 'none',
          backgroundColor: fbSeparatorColor,
          borderRadius: 0,
          boxSizing: 'border-box',
          outline: selected ? `0.1rem solid ${purple}` : 'none',
          cursor: 'pointer',
        }}
      />
    );
  };

  const isSingleQuestionChild = (component: DesignerComponentSpec) =>
    questionTypes.includes(component.type);

  const renderSingleQuestionWithTallSeparators = (parentId: string, child: DesignerComponentSpec, index: number) => (
    <div
      key={`${child.key || child.id}-single-with-separators`}
      style={{
        display: 'grid',
        gridTemplateColumns: `${fbSeparatorThickness} minmax(0, 1fr) ${fbSeparatorThickness}`,
        columnGap: '0.4rem',
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      {renderSeparator({ id: `${parentId}-single-left-${child.id}`, parentId, index, orientation: 'tallForSingle' })}
      {renderDesignedComponent(child)}
      {renderSeparator({ id: `${parentId}-single-right-${child.id}`, parentId, index: index + 1, orientation: 'tallForSingle' })}
    </div>
  );

  const renderStackedChildren = (parentId: string, children: DesignerComponentSpec[]) => {
    if (!greenBoxesVisible) return children.map((child) => renderDesignedComponent(child));
    const parent = parentId === 'form' ? null : allComponents(displayedDesign?.components || []).find((component) => component.id === parentId) || null;
    const parentIsRowCell = parent?.type === 'fbGridCell';
    if (children.length === 0) {
      return renderSeparator({ id: `${parentId}-separator-0`, parentId, index: 0, orientation: 'wide', fullSize: true });
    }
    const nodes: React.ReactNode[] = [];
    children.forEach((child, index) => {
      nodes.push(renderSeparator({ id: `${parentId}-separator-${index}`, parentId, index, orientation: 'wide' }));
      nodes.push(isSingleQuestionChild(child) && !parentIsRowCell
        ? renderSingleQuestionWithTallSeparators(parentId, child, index)
        : renderDesignedComponent(child));
    });
    nodes.push(renderSeparator({ id: `${parentId}-separator-${children.length}`, parentId, index: children.length, orientation: 'wide' }));
    return nodes;
  };

  const renderGroupChildren = (group: DesignerComponentSpec, children: DesignerComponentSpec[]) => {
    const renderChild = (child: DesignerComponentSpec) => (
      child.type === 'fbRadio' || child.type === 'fbCheck'
        ? renderGroupOption(child, group)
        : renderDesignedComponent(child)
    );
    if (!greenBoxesVisible) return children.map(renderChild);
    const nodes: React.ReactNode[] = [];
    children.forEach((child, index) => {
      nodes.push(renderSeparator({ id: `${group.id}-separator-${index}`, parentId: group.id, index, orientation: 'wide' }));
      nodes.push(renderChild(child));
    });
    nodes.push(renderSeparator({ id: `${group.id}-separator-${children.length}`, parentId: group.id, index: children.length, orientation: 'wide' }));
    return nodes;
  };

  const rowCellChromeStyle = (child: DesignerComponentSpec, rowChildren: DesignerComponentSpec[], separatorCount: number): React.CSSProperties | undefined => {
    if (child.type !== 'fbGridCell') return undefined;
    const totalSpan = rowChildren
      .filter((rowChild) => rowChild.type === 'fbGridCell')
      .reduce((sum, cell) => sum + clampColSpan(cell.colSpan), 0) || 1;
    const span = clampColSpan(child.colSpan);
    const itemCount = rowChildren.length + separatorCount;
    const gapCount = Math.max(0, itemCount - 1);
    const separatorRem = Number.parseFloat(fbSeparatorThickness) || 1;
    const fixedRem = separatorCount * separatorRem + gapCount;
    const percent = (span / totalSpan) * 100;
    const remShare = (fixedRem * span) / totalSpan;
    return {
      flex: `0 1 calc(${percent}% - ${remShare}rem)`,
      minWidth: 0,
    };
  };

  const renderRowCellChild = (child: DesignerComponentSpec, rowChildren: DesignerComponentSpec[], separatorCount: number) => (
    <div key={`${child.key || child.id}-row-layout-item`} style={rowCellChromeStyle(child, rowChildren, separatorCount)}>
      {renderDesignedComponent(child)}
    </div>
  );

  const renderRowChildren = (rowId: string, children: DesignerComponentSpec[]) => {
    if (!greenBoxesVisible) return children.length === 0 ? <div /> : children.map((child) => renderRowCellChild(child, children, 0));
    if (children.length === 0) {
      return renderSeparator({ id: `${rowId}-separator-0`, parentId: rowId, index: 0, orientation: 'wide', fullSize: true });
    }
    const nodes: React.ReactNode[] = [];
    children.forEach((child, index) => {
      nodes.push(renderSeparator({ id: `${rowId}-separator-${index}`, parentId: rowId, index, orientation: 'tall' }));
      nodes.push(renderRowCellChild(child, children, children.length + 1));
    });
    nodes.push(renderSeparator({ id: `${rowId}-separator-${children.length}`, parentId: rowId, index: children.length, orientation: 'tall' }));
    return nodes;
  };

  const renderGroupOption = (component: DesignerComponentSpec, group: DesignerComponentSpec) => {
    const isRadio = component.type === 'fbRadio';
    const checked = isRadio
      ? previewValues[group.id] === component.id
      : (previewValues[component.id] || '') === 'checked';
    if (readOnlyPreview && !checked && !component.showInRoVIfEmpty) return null;
    if (readOnlyPreview) {
      return renderSelectionChrome(component, (
        <div className="fb-question-container" style={{ marginBottom: '0.2rem' }}>
          <div
            style={{ fontWeight: componentTextWeight(component, 500), marginLeft: '0.4rem', whiteSpace: 'pre-line' }}
            {...controlTooltipProps(component, true)}
          >
            {component.label}
          </div>
          {(component.children || []).filter(componentHasRoVData).length > 0 && (
            <div className="pl-6 pb-1">
              {(component.children || []).filter(componentHasRoVData).map((child) => renderDesignedComponent(child))}
            </div>
          )}
        </div>
      ), { compact: true });
    }
    return renderSelectionChrome(component, (
      <div className="fb-subquestion-wrapper">
        <label
          className="fb-radio-checkbox-item"
          style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.5rem', width: '100%', fontWeight: 300, cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
            if (!publicId) setSelectedId(component.id);
          }}
        >
          <input
            id={component.id}
            type={isRadio ? 'radio' : 'checkbox'}
            name={isRadio ? group.id : component.id}
            checked={checked}
            onChange={(event) => {
              if (isRadio) {
                setPreviewValue(group.id, component.id);
              } else {
                setPreviewValue(component.id, event.target.checked ? 'checked' : '');
              }
            }}
            style={{ flexShrink: 0, cursor: 'pointer' }}
            {...controlTooltipProps(component, true)}
          />
          <span
            contentEditable={!publicId && !readOnlyPreview}
            suppressContentEditableWarning
            onClick={(event) => {
              event.stopPropagation();
              if (!publicId) setSelectedId(component.id);
            }}
            onFocus={() => {
              if (!publicId) setSelectedId(component.id);
            }}
            onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
            style={{ fontWeight: componentTextWeight(component, 300), outline: 'none' }}
          >
            {component.label}
          </span>
        </label>
        {checked && (component.children || []).length > 0 && (
          <div className="pl-6 pb-1">
            {(component.children || []).map((child) => renderDesignedComponent(child))}
          </div>
        )}
      </div>
    ), { compact: true });
  };

  const renderDesignedComponent = (component: DesignerComponentSpec): React.ReactNode => {
    if (readOnlyPreview && !componentHasRoVData(component)) return null;
    if (component.type === 'fbSection') {
      const children = readOnlyPreview
        ? (component.children || []).filter(componentHasRoVData)
        : (component.children || []);
      return renderSelectionChrome(component, (
        <div id={component.id} className="fb-section-block" style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.8rem' }}>
          <h3
            {...labelTooltipProps(component)}
            contentEditable={!publicId && !readOnlyPreview}
            suppressContentEditableWarning
            onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
            style={{
              backgroundColor: 'rgb(27, 110, 194)',
              color: 'white',
              fontFamily: "'Roboto', sans-serif",
              fontSize: '1rem',
              fontWeight: componentTextWeight(component, 500),
              lineHeight: '1.2rem',
              padding: '0.2rem 0.2rem 0.2rem 0.4rem',
              margin: 0,
              borderRadius: '0.2rem 0.2rem 0 0',
            }}
          >
            {component.label}
            {component.required && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}
          </h3>
          <div className="bg-white" style={{ padding: '0.4rem 0rem', marginTop: '0.4rem', marginBottom: '0.6rem', minHeight: '1.4rem' }}>
          {renderStackedChildren(component.id, children)}
          </div>
        </div>
      ));
    }
    if (component.type === 'fbGridRow') {
      const children = readOnlyPreview
        ? (component.children || []).filter(componentHasRoVData)
        : (component.children || []);
      return renderSelectionChrome(component, (
        <div
          className="fb-designer-question-row"
          style={{
            display: 'flex',
            flexDirection: 'row',
            columnGap: '1rem',
            rowGap: '0.4rem',
            alignItems: 'stretch',
            marginBottom: '0.4rem',
            width: '100%',
          }}
        >
          {renderRowChildren(component.id, children)}
        </div>
      ));
    }
    if (component.type === 'fbGridCell') {
      const children = readOnlyPreview
        ? (component.children || []).filter(componentHasRoVData)
        : (component.children || []);
      return renderSelectionChrome(component, (
        <FbGridCell id={component.id} span={clampColSpan(component.colSpan)}>
          <div style={{ minHeight: '1.4rem' }}>
            {renderStackedChildren(component.id, children)}
          </div>
        </FbGridCell>
      ));
    }
    if (component.type === 'fbGroup') {
      const children = readOnlyPreview
        ? (component.children || []).filter(componentHasRoVData)
        : (component.children || []);
      return renderSelectionChrome(component, (
        <FbGroup
          required={component.required}
          requiredForAudit={component.requiredForAudit}
          showRequiredMarkers={false}
          label={(
            <span
              {...labelTooltipProps(component)}
              contentEditable={!publicId && !readOnlyPreview}
              suppressContentEditableWarning
              onBlur={(event) => updateComponent(component.id, { label: cleanEditedLabel(event.currentTarget.textContent || component.label, component.required, component.requiredForAudit) })}
              style={{ fontWeight: componentTextWeight(component, 500), outline: 'none' }}
            >
              {component.label}
              {component.requiredForAudit && <FbRequiredForAudit />}
              {component.required && <span style={{ color: '#d50000', marginLeft: '0.1rem' }}>*</span>}
            </span>
          )}
        >
          {renderGroupChildren(component, children)}
        </FbGroup>
      ));
    }
    if (component.type === 'fbTable') {
      const columns = normaliseTableColumns(component);
      const rowCount = normaliseTableRowCount(component);
      const templates = normaliseTableTemplates(component);
      const dataColumnCount = columns.length;
      const selectedHeaderIndex = selectedTableTarget?.kind === 'header' && selectedTableTarget.tableId === component.id ? selectedTableTarget.columnIndex : -1;
      const selectedRowIndex = selectedTableTarget?.kind === 'row' && selectedTableTarget.tableId === component.id ? selectedTableTarget.rowIndex : -1;
      const selectedCell = selectedTableTarget?.kind === 'cell' && selectedTableTarget.tableId === component.id ? selectedTableTarget : null;
      const selectedSeparatorIndex = selectedTableTarget?.kind === 'separator' && selectedTableTarget.tableId === component.id ? selectedTableTarget.separatorIndex : -1;
      const tableColumnDragProps = (separatorIndex: number) => ({
        onDragOver: (event: React.DragEvent<HTMLElement>) => {
          if (event.dataTransfer.types.includes('text/composer-table-column')) event.preventDefault();
        },
        onDrop: (event: React.DragEvent<HTMLElement>) => {
          event.preventDefault();
          event.stopPropagation();
          const fromIndex = Number(event.dataTransfer.getData('text/composer-table-column'));
          moveTableColumnToSeparator(component.id, fromIndex, separatorIndex);
        },
      });
      const tableSeparatorClass = (separatorIndex: number) =>
        `fb-composer-table-separator-cell ${selectedSeparatorIndex === separatorIndex ? 'fb-composer-table-selected' : ''}`;
      return renderSelectionChrome(component, (
        <div style={{ overflowX: 'auto' }}>
          {renderEditableLabel(component)}
          <FbTable style={{ width: component.useFullWidth === false ? 'auto' : '100%' }}>
            <FbTableHeader>
              <FbTableRow>
                {component.includeDragHandles && <FbTableHeaderCell aria-label="Row drag handles" style={{ width: '2rem' }} />}
                {greenBoxesVisible && (
                  <FbTableHeaderCell
                    aria-label="Column drop target before first column"
                    className={tableSeparatorClass(0)}
                    style={{ width: '0.4rem', padding: 0, border: 'none', backgroundColor: 'transparent' }}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectTableSeparator(component.id, 0);
                    }}
                    {...tableColumnDragProps(0)}
                  >
                    <span className="fbSeparatorTall" />
                  </FbTableHeaderCell>
                )}
                {columns.map((column, index) => (
                  <React.Fragment key={`${component.id}-head-wrap-${index}`}>
                    {greenBoxesVisible && index > 0 && (
                      <FbTableHeaderCell
                        aria-label={`Column drop target ${index}`}
                        className={tableSeparatorClass(index)}
                        style={{ width: '0.4rem', padding: 0, border: 'none', backgroundColor: 'transparent' }}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectTableSeparator(component.id, index);
                        }}
                        {...tableColumnDragProps(index)}
                      >
                        <span className="fbSeparatorTall" />
                      </FbTableHeaderCell>
                    )}
                    <FbTableHeaderCell
                      key={`${component.id}-head-${index}`}
                      className={selectedHeaderIndex === index ? 'fb-composer-table-selected' : ''}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectTableHeader(component.id, index);
                      }}
                    >
                      <div className="fb-composer-table-column-header-content">
                        {selectedHeaderIndex === index && greenBoxesVisible && dataColumnCount > 1 && !publicId && (
                          <div
                            className="fb-composer-table-column-drag-handle"
                            aria-label={`Drag column ${index + 1}`}
                            title="Drag column"
                            role="button"
                            draggable
                            onClick={(event) => event.stopPropagation()}
                            onDragStart={(event) => {
                              event.stopPropagation();
                              event.dataTransfer.setData('text/composer-table-column', String(index));
                              event.dataTransfer.effectAllowed = 'move';
                            }}
                          />
                        )}
                        <span
                          contentEditable={!publicId}
                          suppressContentEditableWarning
                          onBlur={(event) => updateTableColumnLabel(component.id, index, event.currentTarget.textContent || column)}
                          style={{ outline: 'none' }}
                        >
                          {column}
                        </span>
                      </div>
                    </FbTableHeaderCell>
                  </React.Fragment>
                ))}
                {greenBoxesVisible && (
                  <FbTableHeaderCell
                    aria-label="Column drop target after last column"
                    className={tableSeparatorClass(columns.length)}
                    style={{ width: '0.4rem', padding: 0, border: 'none', backgroundColor: 'transparent' }}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectTableSeparator(component.id, columns.length);
                    }}
                    {...tableColumnDragProps(columns.length)}
                  >
                    <span className="fbSeparatorTall" />
                  </FbTableHeaderCell>
                )}
                {component.includeRowDeleteButtons && <FbTableHeaderCell aria-label="Row delete buttons" style={{ width: '2rem' }} />}
              </FbTableRow>
            </FbTableHeader>
            <FbTableBody>
              {component.requireAtLeastOneRow && (
                <FbTableRow>
                  <FbTableCell
                    className="fb-table-required-row"
                    colSpan={columns.length + (component.includeDragHandles ? 1 : 0) + (component.includeRowDeleteButtons ? 1 : 0) + (greenBoxesVisible ? columns.length + 1 : 0)}
                    style={{ color: '#d50000', fontSize: '0.8rem', fontStyle: 'italic', fontWeight: 500 }}
                  >
                    {component.requireAtLeastOneRowText || 'Enter at least one row'}
                  </FbTableCell>
                </FbTableRow>
              )}
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <FbTableRow
                  key={`${component.id}-row-${rowIndex}`}
                  className={selectedRowIndex === rowIndex ? 'fb-composer-table-row-selected' : ''}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectTableRow(component.id, rowIndex);
                  }}
                >
                  {component.includeDragHandles && (
                    <FbTableCell style={{ width: '2rem', textAlign: 'center' }}>
                      <span className="material-icons" aria-hidden="true" title="Drag up or down to order list" style={{ color: '#1b6ec2', cursor: 'grab' }}>swap_vertical_circle</span>
                    </FbTableCell>
                  )}
                  {greenBoxesVisible && (
                    <FbTableCell
                      aria-label="Column drop target before first column"
                      className={tableSeparatorClass(0)}
                      style={{ width: '0.4rem', padding: 0, border: 'none', backgroundColor: 'transparent' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectTableSeparator(component.id, 0);
                      }}
                      {...tableColumnDragProps(0)}
                    >
                      <span className="fbSeparatorTall" />
                    </FbTableCell>
                  )}
                  {columns.map((column, columnIndex) => (
                    <React.Fragment key={`${component.id}-${rowIndex}-${columnIndex}-wrap`}>
                      {greenBoxesVisible && columnIndex > 0 && (
                        <FbTableCell
                          aria-label={`Column drop target ${columnIndex}`}
                          className={tableSeparatorClass(columnIndex)}
                          style={{ width: '0.4rem', padding: 0, border: 'none', backgroundColor: 'transparent' }}
                          onClick={(event) => {
                            event.stopPropagation();
                            selectTableSeparator(component.id, columnIndex);
                          }}
                          {...tableColumnDragProps(columnIndex)}
                        >
                          <span className="fbSeparatorTall" />
                        </FbTableCell>
                      )}
                      <FbTableCell
                        key={`${component.id}-${rowIndex}-${columnIndex}`}
                        className={selectedCell?.columnIndex === columnIndex && selectedCell.rowIndex === rowIndex ? 'fb-composer-table-selected' : ''}
                        style={{ minWidth: '6rem' }}
                        onClickCapture={() => {
                          selectTableCell(component.id, rowIndex, columnIndex);
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectTableCell(component.id, rowIndex, columnIndex);
                        }}
                      >
                        {templates[columnIndex] ? renderQuestion(
                          { ...templates[columnIndex]!, id: `${templates[columnIndex]!.id}-${rowIndex}`, key: `${templates[columnIndex]!.key || templates[columnIndex]!.id}-${rowIndex}` },
                          (_id, patch) => {
                            const templatesForPatch = normaliseTableTemplates(component);
                            const currentTemplate = templatesForPatch[columnIndex];
                            if (currentTemplate) updateTable(component.id, (table) => {
                              const nextTemplates = normaliseTableTemplates(table);
                              nextTemplates[columnIndex] = { ...currentTemplate, ...patch };
                              return { ...table, tableCellTemplates: nextTemplates };
                            });
                          },
                        ) : column}
                      </FbTableCell>
                    </React.Fragment>
                  ))}
                  {greenBoxesVisible && (
                    <FbTableCell
                      aria-label="Column drop target after last column"
                      className={tableSeparatorClass(columns.length)}
                      style={{ width: '0.4rem', padding: 0, border: 'none', backgroundColor: 'transparent' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectTableSeparator(component.id, columns.length);
                      }}
                      {...tableColumnDragProps(columns.length)}
                    >
                      <span className="fbSeparatorTall" />
                    </FbTableCell>
                  )}
                  {component.includeRowDeleteButtons && (
                    <FbTableCell style={{ width: '2rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        aria-label="Delete row"
                        title="Delete row"
                        style={{ border: 'none', background: 'transparent', color: '#d50000', padding: 0 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectTableRow(component.id, rowIndex);
                          updateTable(component.id, (table) => {
                            const count = normaliseTableRowCount(table);
                            if (count <= 1) return table;
                            return { ...table, tableRows: count - 1 };
                          });
                        }}
                      >
                        <span className="material-icons" aria-hidden="true">highlight_off</span>
                      </button>
                    </FbTableCell>
                  )}
                </FbTableRow>
              ))}
            </FbTableBody>
          </FbTable>
          {component.includeAddButton && (
            <div style={{ marginTop: '0.35rem' }}>
              <FbAddButton
                label={component.addButtonLabel || 'Add row'}
                editable={!publicId}
                onLabelChange={(label) => updateComponent(component.id, { addButtonLabel: label })}
                onClick={() => updateComponent(component.id, { tableRows: rowCount + 1 })}
              />
            </div>
          )}
        </div>
      ));
    }
    return renderSelectionChrome(component, (
      <>
        {renderQuestion(component)}
        {(() => {
          const nestedChildren = readOnlyPreview ? (component.children || []).filter(componentHasRoVData) : (component.children || []);
          return nestedChildren.length > 0 ? renderStackedChildren(component.id, nestedChildren) : null;
        })()}
      </>
    ));
  };

  const renderAuthPanel = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', height: '100vh', fontFamily: "'Roboto', sans-serif" }}>
      <div style={{ backgroundColor: 'white' }} />
      <aside className="fb-designer-panel" style={{ borderLeft: '0.1rem solid black', padding: '1rem', overflow: 'auto' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 0, marginBottom: '0.4rem' }}>formBuilder2</h1>
        <hr style={{ border: 'none', borderTop: '0.1rem solid black', margin: '0 0 0.8rem 0' }} />
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <label style={{ fontWeight: 300 }}><input type="radio" name="designer-auth-mode" checked={authMode === 'login'} onChange={() => { setAuthMode('login'); setShowPassword(false); }} /> Login</label>
          <label style={{ fontWeight: 300 }}><input type="radio" name="designer-auth-mode" checked={authMode === 'register'} onChange={() => { setAuthMode('register'); setShowPassword(false); setRegistrationStep('form'); }} /> Register</label>
        </div>
        {authMode === 'login' ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            login();
          }}
        >
          <label style={designerLabelStyle}>Email address</label>
          <input value={loginEmail} onChange={(event) => setLoginEmail(normaliseDesignerEmail(event.target.value))} style={{ ...designerInputStyle, marginBottom: '0.5rem' }} />
          <label style={designerLabelStyle}>Password</label>
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  login();
                }
              }}
              style={{ ...designerInputStyle, paddingRight: '1.8rem' }}
            />
            <button type="button" aria-label="Show password" onClick={() => setShowPassword((value) => !value)} style={passwordRevealButtonStyle}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 300 }}>
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            Remember me
          </label>
          <button type="submit" style={designerButtonStyle}>Login</button>
          {loginMessage && <p style={{ color: '#d50000' }}>{loginMessage}</p>}
        </form>
        ) : registrationStep === 'code' ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            verifyRegistration();
          }}
        >
          <p style={{ fontWeight: 300 }}>formBuilder2 has sent a verification code. Check your inbox and junk. Copy the code into the box. Verification codes are valid for ten minutes.</p>
          <label style={designerLabelStyle}>Enter code</label>
          <input value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} inputMode="numeric" style={{ ...designerInputStyle, marginBottom: '0.5rem' }} />
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="submit" style={designerButtonStyle}>Verify</button>
            <button type="button" style={designerButtonStyle} onClick={resendRegistrationCode}>Resend code</button>
            <button type="button" style={designerButtonStyle} onClick={() => { setRegistrationStep('form'); setRegistrationMessage(''); }}>Cancel</button>
          </div>
          {registrationMessage && <p style={{ color: '#d50000' }}>{registrationMessage}</p>}
        </form>
        ) : registrationStep === 'expired' || registrationStep === 'incorrect' ? (
        <div>
          <p style={{ color: '#d50000', fontWeight: 300 }}>{registrationStep === 'expired' ? 'The verification code is no longer valid' : 'The verification code is incorrect'}</p>
          <button type="button" style={designerButtonStyle} onClick={() => { setRegistrationStep('form'); setRegistrationMessage(''); }}>Retry</button>
          {registrationMessage && <p style={{ color: '#d50000' }}>{registrationMessage}</p>}
        </div>
        ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            startRegistration();
          }}
        >
          <label style={designerLabelStyle}>Email address</label>
          <input value={registerEmail} onChange={(event) => setRegisterEmail(normaliseDesignerEmail(event.target.value))} style={{ ...designerInputStyle, marginBottom: '0.5rem' }} />
          <p style={{ color: '#d50000', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 300 }}>Passwords must be 12 characters or longer. Do NOT use your NADEX password. Do NOT re-use another password. There is no automatic password recovery or reset.</p>
          <label style={designerLabelStyle}>Password</label>
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  startRegistration();
                }
              }}
              style={{ ...designerInputStyle, paddingRight: '1.8rem' }}
            />
            <button type="button" aria-label="Show password" onClick={() => setShowPassword((value) => !value)} style={passwordRevealButtonStyle}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          <label style={designerLabelStyle}>Repeat password</label>
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  startRegistration();
                }
              }}
              style={{ ...designerInputStyle, paddingRight: '1.8rem' }}
            />
            <button type="button" aria-label="Show password" onClick={() => setShowPassword((value) => !value)} style={passwordRevealButtonStyle}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          <button type="submit" style={designerButtonStyle}>Register</button>
          {registrationMessage && <p style={{ color: '#d50000' }}>{registrationMessage}</p>}
        </form>
        )}
        
      </aside>
    </div>
  );

  const renderBreadcrumbs = () => {
    const crumbs: Array<{ label: string; id: string }> = [{ label: 'Forms', id: 'forms' }];
    if (displayedDesign) crumbs.push({ label: displayedDesign.title, id: 'form' });
    const crumbLabel = (component: DesignerComponentSpec) =>
      component.label || `${typeLabels[component.type]} ${component.id}`;
    selectedPath
      .filter((component) => showRowsAndCellsInBreadcrumbs || !['fbGridRow', 'fbGridCell'].includes(component.type))
      .forEach((component) => crumbs.push({ label: crumbLabel(component), id: component.id }));
    if (selectedTableTarget?.kind === 'row') {
      crumbs.push({ label: `fbTableRow ${selectedTableTarget.rowIndex + 1}`, id: `${selectedTableTarget.tableId}-row-${selectedTableTarget.rowIndex}` });
    } else if (selectedTableTarget?.kind === 'cell') {
      crumbs.push({ label: `fbTableRow ${selectedTableTarget.rowIndex + 1}`, id: `${selectedTableTarget.tableId}-row-${selectedTableTarget.rowIndex}` });
      crumbs.push({ label: `fbTableCell ${selectedTableTarget.columnIndex + 1}`, id: `${selectedTableTarget.tableId}-cell-${selectedTableTarget.rowIndex}-${selectedTableTarget.columnIndex}` });
    } else if (selectedTableTarget?.kind === 'separator') {
      crumbs.push({ label: `fbSeparator ${selectedTableTarget.separatorIndex}`, id: `${selectedTableTarget.tableId}-separator-${selectedTableTarget.separatorIndex}` });
    }
    const selectedRowCells = selectedComponent?.type === 'fbGridRow'
      ? (selectedComponent.children || []).filter((child) => child.type === 'fbGridCell')
      : [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
          {crumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.id}-${index}`}>
              {index > 0 && <span>{'>'}</span>}
              <button
                type="button"
                style={breadcrumbButtonStyle}
                onClick={() => {
                if (crumb.id === 'forms') {
                  setActiveDesignId(null);
                  setSelectedId('form');
                } else {
                  setSelectedId(crumb.id);
                  setShowPurpleBoxes(true);
                  setShowAllPurpleBoxes(false);
                  if (selectedTableTarget && crumb.id === `${selectedTableTarget.tableId}-row-${selectedTableTarget.rowIndex}`) {
                    setSelectedId(selectedTableTarget.tableId);
                    setSelectedTableTarget({ kind: 'row', tableId: selectedTableTarget.tableId, rowIndex: selectedTableTarget.rowIndex });
                  } else if (selectedTableTarget?.kind === 'cell' && crumb.id === `${selectedTableTarget.tableId}-cell-${selectedTableTarget.rowIndex}-${selectedTableTarget.columnIndex}`) {
                    setSelectedId(selectedTableTarget.tableId);
                    setSelectedTableTarget(selectedTableTarget);
                  } else if (selectedTableTarget?.kind === 'separator' && crumb.id === `${selectedTableTarget.tableId}-separator-${selectedTableTarget.separatorIndex}`) {
                    setSelectedId(selectedTableTarget.tableId);
                    setSelectedTableTarget(selectedTableTarget);
                  } else {
                    setSelectedTableTarget(null);
                  }
                }
                }}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </div>
        {selectedRowCells.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 300 }}>Cells:</span>
            {selectedRowCells.map((cell) => (
            <button
              key={cell.id}
              type="button"
              style={breadcrumbButtonStyle}
              onClick={() => {
                setSelectedId(cell.id);
                setShowPurpleBoxes(true);
                setShowAllPurpleBoxes(false);
              }}
            >
              {crumbLabel(cell)}
            </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPropertyGrid = () => {
    if (!displayedDesign || publicId) return null;
    const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
    const row = (name: string, value: React.ReactNode) => (
      <tr key={name}>
        {React.createElement(fbcpName, null, name)}
        {React.createElement(fbcpVal, null, value)}
      </tr>
    );
    const toggle = (checked: boolean | undefined, onChange: (checked: boolean) => void) => (
      React.createElement(fbcpCheck, { checked: !!checked, onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked) })
    );

    if (!selectedComponent) {
      return (
        <table border={1} className="fb-designer-property-grid" style={tableStyle}>
          <tbody>
            {row('Title', <PropertyTextInput value={displayedDesign.title} onChange={(event) => updateActiveDesign((design) => ({ ...design, title: event.target.value }))} style={propertyInputStyle} />)}
            {row('Public id', <PropertyTextInput value={displayedDesign.publicId} readOnly style={propertyInputStyle} />)}
            {row('Notes', (
              <PropertyTextarea
                value={displayedDesign.notes || ''}
                onChange={(value) => updateActiveDesign((design) => ({ ...design, notes: value }))}
              />
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedTableTarget?.kind === 'cell' && selectedComponent.type === 'fbTable') {
      const template = normaliseTableTemplates(selectedComponent)[selectedTableTarget.columnIndex];
      if (template) {
        const supportsTemplatePlaceholder = ['fbTextInput', 'fbTime', 'fbTextArea'].includes(template.type);
        const supportsTemplateDefault = questionTypes.includes(template.type) && template.type !== 'fbGroup';
        return (
          <table border={1} className="fb-designer-property-grid" style={tableStyle}>
            <tbody>
              {row('Table cell template', <PropertyTextInput value={typeLabels[template.type]} readOnly style={propertyInputStyle} />)}
              {row('Label', (
                <PropertyTextarea
                  value={template.label}
                  onChange={(value) => updateSelectedTableCellTemplate({ label: value })}
                />
              ))}
              {supportsTemplateDefault && row('Default value', template.type === 'fbCheck' || template.type === 'fbRadio' ? (
                toggle(!!template.defaultValue, (checked) => updateSelectedTableCellTemplate({ defaultValue: checked ? 'checked' : '' }))
              ) : (
                <PropertyTextarea
                  value={template.defaultValue || ''}
                  onChange={(value) => updateSelectedTableCellTemplate({ defaultValue: value })}
                />
              ))}
              {template.type === 'fbNumberInputWithUnits' && row('Units', (
                <PropertyTextarea
                  value={template.units || 'units'}
                  onChange={(value) => updateSelectedTableCellTemplate({ units: value })}
                />
              ))}
              {row('Required', toggle(template.required, (checked) => updateSelectedTableCellTemplate({ required: checked })))}
              {row('Required for audit', toggle(template.requiredForAudit, (checked) => updateSelectedTableCellTemplate({ requiredForAudit: checked })))}
              {row('Tooltip', (
                <PropertyTextarea
                  value={template.tooltip || ''}
                  onChange={(value) => updateSelectedTableCellTemplate({ tooltip: value })}
                />
              ))}
              {supportsTemplatePlaceholder && row('Placeholder', (
                <PropertyTextarea
                  value={template.placeholder || ''}
                  onChange={(value) => updateSelectedTableCellTemplate({ placeholder: value })}
                />
              ))}
              {row('Database column', <PropertyTextInput value={template.databaseColumn || ''} onChange={(event) => updateSelectedTableCellTemplate({ databaseColumn: event.target.value })} style={propertyInputStyle} />)}
            </tbody>
          </table>
        );
      }
    }

    const supportsPlaceholder = ['fbTextInput', 'fbTime', 'fbTextArea'].includes(selectedComponent.type);
    const supportsDefaultValue = questionTypes.includes(selectedComponent.type) && selectedComponent.type !== 'fbGroup';
    const supportsAcceptUncoded = ['fbMSISelector', 'fbSCTProcedure', 'fbSCTDiagnosis'].includes(selectedComponent.type);
    const isTable = selectedComponent.type.toLowerCase().includes('table');
    const supportsOptions = selectedComponent.type === 'fbDropdown';
    const colSpanCell = selectedComponent.type === 'fbGridCell'
      ? selectedComponent
      : selectedParent?.type === 'fbGridCell'
        ? selectedParent
        : null;
    const updateColSpanCell = (value: number) => {
      if (colSpanCell) updateComponent(colSpanCell.id, { colSpan: clampColSpan(value) });
    };

    return (
      <>
        <table border={1} className="fb-designer-property-grid" style={tableStyle}>
          <tbody>
            {row('Type', (
              <PropertyDropdown value={selectedComponent.type} onChange={(event) => updateComponent(selectedComponent.id, { type: event.target.value as DesignerComponentType })} style={propertyInputStyle}>
                {Object.entries(typeLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
              </PropertyDropdown>
            ))}
            {row('Label', (
              <PropertyTextarea
                value={selectedComponent.label}
                minRows={1}
                onChange={(value) => updateComponent(selectedComponent.id, { label: value })}
              />
            ))}
            {row('Id', <PropertyTextInput value={selectedComponent.id} onChange={(event) => updateComponent(selectedComponent.id, { id: event.target.value })} style={propertyInputStyle} />)}
            {supportsDefaultValue && row('Default value', selectedComponent.type === 'fbCheck' || selectedComponent.type === 'fbRadio' ? (
              <input type="checkbox" checked={!!selectedComponent.defaultValue} onChange={(event) => updateComponent(selectedComponent.id, { defaultValue: event.target.checked ? 'checked' : '' })} />
            ) : (
              <PropertyTextarea
                value={selectedComponent.defaultValue || ''}
                onChange={(value) => updateComponent(selectedComponent.id, { defaultValue: value })}
              />
            ))}
            {selectedComponent.type === 'fbNumberInputWithUnits' && row('Units', (
              <PropertyTextarea
                value={selectedComponent.units || 'units'}
                onChange={(value) => updateComponent(selectedComponent.id, { units: value })}
              />
            ))}
            {row('Required', toggle(selectedComponent.required, (checked) => updateComponent(selectedComponent.id, { required: checked })))}
            {row('Required for audit', toggle(selectedComponent.requiredForAudit, (checked) => updateComponent(selectedComponent.id, { requiredForAudit: checked })))}
            {colSpanCell && row('Col span', (
              <PropertyTextInput
                type="number"
                min={1}
                max={12}
                value={clampColSpan(colSpanCell.colSpan)}
                onChange={(event) => updateColSpanCell(Number(event.target.value))}
                style={propertyInputStyle}
              />
            ))}
            {row('Tooltip', (
              <PropertyTextarea
                value={selectedComponent.tooltip || ''}
                minRows={1}
                onChange={(value) => updateComponent(selectedComponent.id, { tooltip: value })}
              />
            ))}
            {row('Bold override', toggle(selectedComponent.boldOverride, (checked) => updateComponent(selectedComponent.id, { boldOverride: checked })))}
            {row('Plain override', toggle(selectedComponent.plainOverride, (checked) => updateComponent(selectedComponent.id, { plainOverride: checked })))}
            {row('Show in RoV if empty', toggle(selectedComponent.showInRoVIfEmpty, (checked) => updateComponent(selectedComponent.id, { showInRoVIfEmpty: checked })))}
            {supportsPlaceholder && row('Placeholder', <PropertyTextInput value={selectedComponent.placeholder || ''} onChange={(event) => updateComponent(selectedComponent.id, { placeholder: event.target.value })} style={propertyInputStyle} />)}
            {selectedComponent.type === 'fbTextArea' && row('Full width', toggle(selectedComponent.fullWidth, (checked) => updateComponent(selectedComponent.id, { fullWidth: checked })))}
            {supportsAcceptUncoded && row('Accept uncoded values', toggle(selectedComponent.acceptUncodedValues, (checked) => updateComponent(selectedComponent.id, { acceptUncodedValues: checked })))}
            {row('Database column', <PropertyTextInput value={selectedComponent.databaseColumn || ''} onChange={(event) => updateComponent(selectedComponent.id, { databaseColumn: event.target.value })} style={propertyInputStyle} />)}
            {isTable && row('Use full width', toggle(selectedComponent.useFullWidth, (checked) => updateComponent(selectedComponent.id, { useFullWidth: checked })))}
            {isTable && row('Include drag handles', toggle(selectedComponent.includeDragHandles, (checked) => updateComponent(selectedComponent.id, { includeDragHandles: checked })))}
            {isTable && row('Include row delete buttons', toggle(selectedComponent.includeRowDeleteButtons, (checked) => updateComponent(selectedComponent.id, { includeRowDeleteButtons: checked })))}
            {isTable && row('Require at least one row', toggle(selectedComponent.requireAtLeastOneRow, (checked) => updateComponent(selectedComponent.id, { requireAtLeastOneRow: checked })))}
            {isTable && selectedComponent.requireAtLeastOneRow && row('Text for "Enter at least one..." warning', (
              <PropertyTextarea
                value={selectedComponent.requireAtLeastOneRowText || ''}
                onChange={(value) => updateComponent(selectedComponent.id, { requireAtLeastOneRowText: value })}
              />
            ))}
            {isTable && row('Include add button', toggle(selectedComponent.includeAddButton, (checked) => updateComponent(selectedComponent.id, { includeAddButton: checked })))}
            {isTable && selectedComponent.includeAddButton && row('Add button label', (
              <PropertyTextarea
                value={selectedComponent.addButtonLabel || ''}
                onChange={(value) => updateComponent(selectedComponent.id, { addButtonLabel: value })}
              />
            ))}
            {isTable && row('Columns', (
              <PropertyTextarea
                value={normaliseTableColumns(selectedComponent).join('\n')}
                onChange={(value) => updateComponent(selectedComponent.id, {
                  tableColumns: value.split('\n').map((label) => label.trim()).filter(Boolean),
                  tableCellTemplates: normaliseTableTemplates({
                    ...selectedComponent,
                    tableColumns: value.split('\n').map((label) => label.trim()).filter(Boolean),
                  }),
                })}
              />
            ))}
            {isTable && row('Rows', (
              <PropertyTextInput
                type="number"
                min={1}
                value={normaliseTableRowCount(selectedComponent)}
                onChange={(event) => updateComponent(selectedComponent.id, { tableRows: Math.max(1, Number(event.target.value) || 1) })}
                style={propertyInputStyle}
              />
            ))}
            {supportsOptions && selectedComponent.options && row('Options', (
              <PropertyTextarea
                key={`${selectedComponent.id}-options`}
                defaultValue={selectedComponent.options.map((option) => option.label).join('\n')}
                onBlur={(value) => updateComponent(selectedComponent.id, {
                  options: value.split('\n').filter(Boolean).map((label, index) => ({ value: `option${index + 1}`, label })),
                })}
              />
            ))}
            {row('Notes', (
              <PropertyTextarea
                value={selectedComponent.notes || ''}
                onChange={(value) => updateComponent(selectedComponent.id, { notes: value })}
              />
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const actionLabel = (label: string) => label.replace(/questions/g, 'components').replace(/question/g, 'component').replace(/SNOMED(?! CT)/g, 'SNOMED CT');

  const collapseTaskAccordions = () => {
    document.querySelectorAll<HTMLDetailsElement>('.fb-designer-action-nested details').forEach((details) => {
      details.open = false;
    });
    setDeleteOpen(false);
  };

  const actionListItem = (label: string, action: AddAction, parentId = selectedId, type?: DesignerComponentType, danger = false) => React.createElement(fbcAction, {
      key: label,
      danger,
      tabIndex: 0,
      role: 'button',
      onClick: () => {
        if (type) {
          addComponent(parentId, type, action);
          collapseTaskAccordions();
        }
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLLIElement>) => {
        if ((event.key === 'Enter' || event.key === ' ') && type) {
          event.preventDefault();
          addComponent(parentId, type, action);
          collapseTaskAccordions();
        }
      },
      children: (
        <>
          <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">{actionLabel(label)}</span>
        </>
      ),
    });

  const actionChoiceList = (label: string, action: AddAction, parentId = selectedId, types: DesignerComponentType[] = questionTypes) => (
    <li key={label} className="fb-designer-action-nested">
      <details>
        <summary><span className="fb-designer-action-label">{actionLabel(label)}</span></summary>
        <ul className="fb-designer-action-list">
          {types.map((type) => actionListItem(typeLabels[type], action, parentId, type))}
        </ul>
      </details>
    </li>
  );

  const renderContextControls = () => {
    if (!displayedDesign || publicId) return null;
    const controls: React.ReactNode[] = [];
    const separatorEmptyParent = selectedSeparatorEmptyParent();
    const separatorDeleteLabel = separatorEmptyParent?.type === 'fbSection'
      ? 'Delete section'
      : separatorEmptyParent?.type === 'fbGridRow'
        ? 'Delete component row'
        : separatorEmptyParent?.type === 'fbGridCell'
          ? 'Delete component row cell'
          : '';
    const selectedSupportsRightBelow = Boolean(
      selectedComponent &&
      questionTypes.includes(selectedComponent.type) &&
      selectedComponent.type !== 'fbRadio' &&
      selectedComponent.type !== 'fbCheck'
    );
    if (selectedTableTarget?.kind === 'header') {
      const table = allComponents(displayedDesign.components).find((component) => component.id === selectedTableTarget.tableId);
      const canDeleteColumn = table ? normaliseTableColumns(table).length > 1 : false;
      controls.push((
        <li
          key="add-table-column-right"
          className="fb-designer-action-item"
          tabIndex={0}
          role="button"
          onClick={addTableColumnRight}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              addTableColumnRight();
            }
          }}
        >
          <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">Add column to right</span>
        </li>
      ));
      if (canDeleteColumn) {
        controls.push((
          <li
            key="delete-table-column"
            className="fb-designer-action-item fb-designer-action-danger"
            tabIndex={0}
            role="button"
            onClick={deleteTableColumn}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                deleteTableColumn();
              }
            }}
          >
            <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">Delete column</span>
          </li>
        ));
      }
    } else if (selectedTableTarget?.kind === 'row') {
      const table = allComponents(displayedDesign.components).find((component) => component.id === selectedTableTarget.tableId);
      const canDeleteRow = normaliseTableRowCount(table) > 1;
      if (canDeleteRow) {
        controls.push((
          <li
            key="delete-table-row"
            className="fb-designer-action-item fb-designer-action-danger"
            tabIndex={0}
            role="button"
            onClick={deleteTableRow}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                deleteTableRow();
              }
            }}
          >
            <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">Delete row</span>
          </li>
        ));
      }
    } else if (selectedTableTarget?.kind === 'cell') {
      controls.push((
        <li key="add-table-cell-component" className="fb-designer-action-nested">
          <details>
            <summary><span className="fb-designer-action-label">Add component here</span></summary>
            <ul className="fb-designer-action-list">
              {questionTypes.map((type) => (
                <li
                  key={type}
                  className="fb-designer-action-item"
                  tabIndex={0}
                  role="button"
                  onClick={() => addComponentToSelectedTableCell(type)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      addComponentToSelectedTableCell(type);
                    }
                  }}
                >
                  <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">{typeLabels[type]}</span>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ));
    } else if (selectedTableTarget?.kind === 'separator') {
      controls.push((
        <li
          key="add-table-column-at-separator"
          className="fb-designer-action-item"
          tabIndex={0}
          role="button"
          onClick={addTableColumnAtSeparator}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              addTableColumnAtSeparator();
            }
          }}
        >
          <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">Add column here</span>
        </li>
      ));
    } else if (selectedSeparator) {
      const separatorParent = selectedSeparator.parentId === 'form'
        ? null
        : allComponents(displayedDesign.components).find((component) => component.id === selectedSeparator.parentId) || null;
      const separatorTypes = !separatorParent || separatorParent.type === 'fbSection' || separatorParent.type === 'fbGridCell'
        ? formOrSectionComponentTypes
        : questionTypes;
      controls.push(actionChoiceList('Add component here', 'separatorInsert', selectedSeparator.parentId, separatorTypes));
      if (separatorEmptyParent) {
        controls.push((
          <li
            key="delete-empty-separator-parent"
            className="fb-designer-action-item fb-designer-action-danger"
            tabIndex={0}
            role="button"
            onClick={deleteSelectedSeparatorParent}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                deleteSelectedSeparatorParent();
              }
            }}
          >
            <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">{separatorDeleteLabel}</span>
          </li>
        ));
      }
    } else if (!selectedComponent) {
      controls.push(actionListItem('Add section to form', 'append', 'form', 'fbSection'));
      controls.push(actionListItem('Add Grid row to form', 'append', 'form', 'fbGridRow'));
      controls.push(actionChoiceList('Add single component to form', 'append', 'form', formOrSectionComponentTypes));
    } else if (selectedComponent.type === 'fbSection') {
      controls.push(actionListItem('Add Grid row to section', 'append', selectedId, 'fbGridRow'));
      controls.push(actionChoiceList('Add component to section', 'append', selectedId, formOrSectionComponentTypes));
      controls.push(actionListItem('Add another section', 'afterSelected', selectedId, 'fbSection'));
    } else if (selectedComponent.type === 'fbGridRow') {
      controls.push(actionChoiceList('Add question at end of row', 'rowEnd'));
      controls.push(actionChoiceList('Add a single question below this row', 'singleBelowRow'));
      controls.push(actionListItem('Add another row of questions below this row', 'rowBelow', selectedId, 'fbGridRow'));
    } else if (selectedComponent.type === 'fbGridCell') {
      controls.push(actionChoiceList('Add component to the right', 'cellRight'));
      controls.push(actionChoiceList('Add component below', 'cellBelow'));
    } else if (selectedParent?.type === 'fbGridCell' && selectedComponent && questionTypes.includes(selectedComponent.type)) {
      controls.push(actionChoiceList('Add component to right', 'componentRight'));
      controls.push(actionChoiceList('Add component below', 'componentBelow'));
      if (selectedComponent.type === 'fbGroup') {
        controls.push(actionListItem('Add radiobutton to group', 'groupOption', selectedId, 'fbRadio'));
        controls.push(actionListItem('Add check box to group', 'groupOption', selectedId, 'fbCheck'));
      } else if (selectedComponent.type === 'fbRadio') {
        controls.push(actionChoiceList('Add a subquestion', 'subquestion'));
        controls.push(actionListItem('Add another radiobutton below', 'questionBelow', selectedId, 'fbRadio'));
      } else if (selectedComponent.type === 'fbCheck') {
        controls.push(actionChoiceList('Add a subquestion', 'subquestion'));
        controls.push(actionListItem('Add another check box below', 'questionBelow', selectedId, 'fbCheck'));
      }
    } else if (selectedComponent.type === 'fbGroup') {
      controls.push(actionListItem('Add radiobutton to group', 'groupOption', selectedId, 'fbRadio'));
      controls.push(actionListItem('Add check box to group', 'groupOption', selectedId, 'fbCheck'));
      controls.push(actionChoiceList('Add a question below', 'questionBelow'));
      controls.push(actionListItem('Add a row of questions below', 'questionBelow', selectedId, 'fbGridRow'));
    } else if (selectedComponent.type === 'fbRadio') {
      controls.push(actionChoiceList('Add a subquestion', 'subquestion'));
      controls.push(actionListItem('Add another radiobutton below', 'questionBelow', selectedId, 'fbRadio'));
    } else if (selectedComponent.type === 'fbCheck') {
      controls.push(actionChoiceList('Add a subquestion', 'subquestion'));
      controls.push(actionListItem('Add another check box below', 'questionBelow', selectedId, 'fbCheck'));
    } else if (selectedParent?.type === 'fbGridCell' && selectedComponent && selectedSupportsRightBelow) {
      controls.push(actionChoiceList('Add component to right', 'componentRight'));
      controls.push(actionChoiceList('Add component below', 'componentBelow'));
    } else if (selectedSupportsRightBelow) {
      controls.push(actionChoiceList('Add component to right', 'componentRight'));
      controls.push(actionChoiceList('Add component below', 'componentBelow'));
    } else if (selectedParent?.type === 'fbGridCell') {
      controls.push(actionChoiceList('Add component to the right', 'cellRight', selectedParent.id));
      controls.push(actionChoiceList('Add component below', 'cellBelow', selectedParent.id));
    }
    if (canRemoveEnclosingRowAndCell) {
      controls.push((
        <li
          key="remove-enclosing-row-and-cell"
          className="fb-designer-action-item"
          tabIndex={0}
          role="button"
          onClick={removeEnclosingRowAndCell}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              removeEnclosingRowAndCell();
            }
          }}
        >
          <span className="fb-designer-action-marker" aria-hidden="true" style={{ fontWeight: 700 }}>{'\u25b6 '}</span><span className="fb-designer-action-label">Remove enclosing row and cell components</span>
        </li>
      ));
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
        <ul className="fb-designer-action-list">{controls}</ul>
        {!selectedSeparator && !selectedTableTarget && <details open={deleteOpen} onToggle={(event) => setDeleteOpen(event.currentTarget.open)}>
          <summary className="fb-designer-delete-summary">Delete</summary>
          <ul className="fb-designer-action-list fb-designer-delete-action-list">
            <li
              className="fb-designer-action-item fb-designer-action-danger"
              tabIndex={0}
              role="button"
              onClick={() => {
                setDeleteOpen(false);
                if (selectedComponent) deleteSelected();
                else if (confirm('Delete form?')) {
                  deleteActiveDesign();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setDeleteOpen(false);
                  if (selectedComponent) deleteSelected();
                }
              }}
            >
              {selectedComponent ? 'Confirm delete component' : 'Confirm delete form'}
            </li>
          </ul>
        </details>}
      </div>
    );
  };

  const getAddMenuTypesForState = (state: AddMenuState): DesignerComponentType[] => {
    const parentType = state.parentId === 'form'
      ? undefined
      : allComponents(displayedDesign?.components || []).find((component) => component.id === state.parentId)?.type;
    const label = state.label || '';
    if (label === 'Add section to form' || label === 'Add another section') return ['fbSection'];
    if (label === 'Add Grid row to form' || label === 'Add Grid row to section' || label.includes('row of questions')) return ['fbGridRow'];
    if (label.includes('radiobutton')) return ['fbRadio'];
    if (label.includes('check box')) return ['fbCheck'];
    if (state.action === 'groupOption') return ['fbRadio', 'fbCheck'];
    if (state.action === 'rowEnd' || state.action === 'cellRight' || state.action === 'cellBelow' || state.action === 'componentRight' || state.action === 'componentBelow' || state.action === 'subquestion' || state.action === 'singleBelowRow') return questionTypes;
    if (state.action === 'afterSelected' && selectedComponent?.type === 'fbSection') return ['fbSection'];
    if (state.action === 'questionBelow' && label.includes('row')) return ['fbGridRow'];
    if (state.action === 'questionBelow') return questionTypes;
    return getAllowedAddTypes(parentType);
  };

  if (!email && !publicId) return renderAuthPanel();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: publicId ? '1fr' : '3fr 1fr', height: '100vh', fontFamily: "'Roboto', sans-serif", backgroundColor: 'white' }}>
      <main
        onClick={() => {
          if (!publicId) setSelectedId('form');
        }}
        style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}
      >
        {displayedDesign ? (
          <>
            <div style={{ borderBottom: '0.2rem solid #1b6ec2', padding: '0.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1
                contentEditable={!readOnlyPreview && !publicId}
                suppressContentEditableWarning
                onBlur={(event) => updateActiveDesign((design) => ({ ...design, title: event.currentTarget.textContent || 'New form' }))}
                style={{ fontSize: '2rem', fontWeight: 500, border: selectedId === 'form' && !publicId && showPurpleBoxes ? `0.1rem solid ${purple}` : '0.1rem solid transparent', flex: 1, margin: 0 }}
              >
                {displayedDesign.title}
              </h1>
              <Addressograph />
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
              <nav ref={leftPanelRef} className="w-64 overflow-y-auto" aria-label="Form sections" style={{ backgroundColor: 'white', padding: '0.4rem', borderRight: '0.1rem solid silver' }}>
                <FbLayoutNav
                  items={sectionComponents.map((section) => ({
                    id: section.id,
                    label: section.label,
                    isActive: selectedId === section.id,
                    isComplete: true,
                    onClick: (event) => {
                      event.stopPropagation();
                      if (!publicId) setSelectedId(section.id);
                      scrollDesignerSection(section.id);
                    },
                  }))}
                />
              </nav>
              <div className="fb-layout-edit-view-form" data-designer-scroll-container="true" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                <div
                  onDragOver={(event) => {
                    if (draggedId) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'none';
                    }
                  }}
                  onDrop={(event) => {
                    if (event.target !== event.currentTarget) return;
                    handleInvalidDrop(event);
                  }}
                  style={{
                    position: 'relative',
                    border: ((selectedId === 'form' && showPurpleBoxes) || showAllPurpleBoxes) && !publicId ? `0.1rem solid ${purple}` : '0.1rem solid transparent',
                    minHeight: displayedDesign.components.length === 0 ? '2rem' : 'auto',
                    padding: ((selectedId === 'form' && showPurpleBoxes) || showAllPurpleBoxes) && !publicId ? '0.4rem' : 0,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!publicId) setSelectedId('form');
                  }}
                >
                  {renderStackedChildren('form', displayedDesign.components)}
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem',
                backgroundColor: 'white',
                borderTop: '0.2rem solid rgb(27, 110, 194)',
                minHeight: '2.8rem',
                boxSizing: 'border-box',
              }}
            >
              <FbButton
                type="button"
                variant="primary"
                className="fb-bottom-control-btn-rov"
                onClick={() => setReadOnlyPreview((value) => !value)}
                style={{ marginLeft: '0.2rem', padding: '0 0.5rem' }}
              >
                {readOnlyPreview ? 'EV' : 'RoV'}
              </FbButton>
            </div>
          </>
        ) : (
          <div style={{ padding: '1rem', fontWeight: 300 }}>{publicId ? 'Public form not found.' : ''}</div>
        )}
      </main>
      {!publicId && React.createElement(fbcPanel, {
        bodyRef: rightPanelScrollRef,
        header: React.createElement(fbcHeader, null, (
        <>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>formBuilder2</h1>
          <hr style={{ border: 'none', borderTop: '0.1rem solid black', margin: '0 0 0.5rem 0' }} />
          {React.createElement(fbcBreadcrumbs, null, renderBreadcrumbs())}
          {!publicId && (
            React.createElement(fbcOptions, null, (
            <>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 300 }}>
              <input
                type="checkbox"
                checked={showRowsAndCellsInBreadcrumbs}
                onChange={(event) => setShowRowsAndCellsInBreadcrumbs(event.target.checked)}
                style={{ marginTop: '0.1rem' }}
              />
              Show rows and cells in breadcrumbs
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 300 }}>
              <input
                type="checkbox"
                checked={showPurpleBoxes}
                onChange={(event) => {
                  setShowPurpleBoxes(event.target.checked);
                  if (event.target.checked) setShowAllPurpleBoxes(false);
                }}
                style={{ marginTop: '0.1rem' }}
              />
              Show selected purple boxes (component boundaries)
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.25rem', fontSize: '0.85rem', fontWeight: 300 }}>
              <input
                type="checkbox"
                checked={showAllPurpleBoxes}
                onChange={(event) => {
                  setShowAllPurpleBoxes(event.target.checked);
                  if (event.target.checked) setShowPurpleBoxes(false);
                  else setShowPurpleBoxes(true);
                }}
                style={{ marginTop: '0.1rem' }}
              />
              Show all purple boxes
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.25rem', fontSize: '0.85rem', fontWeight: 300 }}>
              <input
                type="checkbox"
                checked={showGreenBoxes}
                onChange={(event) => setShowGreenBoxes(event.target.checked)}
                style={{ marginTop: '0.1rem' }}
              />
              Show green bars (enables drag and drop)
            </label>
            </>
            ))
          )}
        </>
        )),
        properties: React.createElement(fbcProperties, null, (
          !displayedDesign || (!activeDesign && !publicId) ? (
            <>
              {designs.map((design) => (
                <div key={design.id} style={{ borderBottom: '0.1rem solid silver', padding: '0.4rem 0' }}>
                  <button type="button" style={breadcrumbButtonStyle} onClick={() => { setActiveDesignId(design.id); setSelectedId('form'); setReadOnlyPreview(false); }}>
                    {design.title}
                  </button>
                </div>
              ))}
              {!publicId && <button type="button" style={{ ...designerButtonStyle, marginTop: '0.6rem' }} onClick={newDesign}>New form</button>}
            </>
          ) : (
            renderPropertyGrid()
          )
        )),
        actions: React.createElement(fbcActions, null, displayedDesign && activeDesign ? renderContextControls() : null),
        footer: React.createElement(fbcFooter, null, (
        <>
          {displayedDesign && (
            <>
              <hr style={{ border: 'none', borderTop: '0.1rem solid silver', margin: '0 0 0.4rem 0' }} />
              <div style={{ marginBottom: '0.5rem', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 300, color: 'black' }}>Public URL: </span>
                <a href={publicUrl} style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: '#1b6ec2', textDecoration: 'underline' }}>{publicUrl}</a>
                <button type="button" aria-label="Copy public URL" title="Copy public URL" onClick={copyPublicUrl} style={{ border: 'none', background: 'transparent', padding: 0, marginLeft: '0.2rem', height: '0.8rem', verticalAlign: 'baseline', cursor: 'pointer' }}>
                  <span className="material-icons" aria-hidden="true" style={{ fontSize: '0.8rem', lineHeight: '0.8rem' }}>content_copy</span>
                </button>
              </div>
              <hr style={{ border: 'none', borderTop: '0.1rem solid silver', margin: '0 0 0.5rem 0' }} />
            </>
          )}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {activeDesign && !publicId && <button type="button" style={designerButtonStyle} onClick={() => { setJsonDraft(JSON.stringify(activeDesign, null, 2)); setShowJson(true); }}>Show JSON</button>}
            {activeDesign && !publicId && (
              <button
                type="button"
                style={composerSaveButtonStyle(saveButtonState)}
                disabled={saveButtonState !== 'dirty'}
                onClick={saveActiveDesign}
              >
                {saveButtonLabel}
              </button>
            )}
          </div>
          {!publicId && (
            <>
              <hr style={{ border: 'none', borderTop: '0.1rem solid silver', margin: '0.5rem 0 0.35rem 0' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 300, marginBottom: '0.35rem', wordBreak: 'break-all' }}>
                User: {email}
              </div>
              <button type="button" style={designerButtonStyle} onClick={() => {
                if (sessionToken) logoutDesignerSession(sessionToken);
                localStorage.removeItem(composerSessionCookieName);
                localStorage.removeItem(legacyControllerSessionCookieName);
                localStorage.removeItem('formBuilder2DesignerSession');
                clearComposerSessionCookie();
                clearAuthFormInputs();
                setSessionToken(null);
                setDesignerPassword(null);
                setEmail(null);
              }}>Logout</button>
            </>
          )}
        </>
        )),
      })}
      {renderTooltips(true)}
      {addMenu && displayedDesign && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddMenu(null);
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: Math.min(addMenu.rect.bottom + 4, window.innerHeight - 320),
              left: Math.min(addMenu.rect.left, window.innerWidth - 240),
              width: '14rem',
              maxHeight: '20rem',
              overflow: 'auto',
              backgroundColor: 'white',
              border: `0.1rem solid ${purple}`,
              padding: '0.35rem',
            }}
          >
            {getAddMenuTypesForState(addMenu).map((type) => (
              <button key={type} type="button" className="fb-designer-add-menu-item" onClick={() => addComponent(addMenu.parentId, type, addMenu.action || 'append')} style={{ ...designerButtonStyle, display: 'block', width: '100%', marginBottom: '0.05rem', padding: '0.1rem 0.15rem', color: purple, border: 'none', textAlign: 'left' }}>
                {typeLabels[type]}
              </button>
            ))}
          </div>
        </div>
      )}
      {showJson && activeDesign && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>
          <div style={{ backgroundColor: 'white', border: '0.1rem solid black', padding: '1rem', width: '70vw', height: '70vh' }}>
            <textarea value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} wrap="off" style={{ width: '100%', height: 'calc(100% - 3rem)', fontFamily: 'monospace', overflow: 'scroll', whiteSpace: 'pre' }} />
            <button type="button" style={designerButtonStyle} onClick={applyJsonDraft}>OK</button>
            <button type="button" style={{ ...designerButtonStyle, marginLeft: '0.4rem' }} onClick={() => setShowJson(false)}>Cancel</button>
          </div>
        </div>
      )}
      {dragDropProblemVisible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div role="alert" style={{ width: '22rem', maxWidth: 'calc(100vw - 2rem)', backgroundColor: 'white', color: 'black', border: '0.1rem solid black', padding: '0.8rem', boxShadow: '0 0.25rem 0.8rem rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Drag and drop problem</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.3 }}>{dragDropProblemText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
