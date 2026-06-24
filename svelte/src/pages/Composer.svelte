<script lang="ts">
  import { onMount } from 'svelte';
  import FbcAction from '../components/fbcAction.svelte';
  import FbcActions from '../components/fbcActions.svelte';
  import FbcBreadcrumbs from '../components/fbcBreadcrumbs.svelte';
  import FbcButton from '../components/fbcButton.svelte';
  import FbcOptions from '../components/fbcOptions.svelte';
  import FbcPanel from '../components/fbcPanel.svelte';
  import FbcProperties from '../components/fbcProperties.svelte';
  import FbAddButton from '../components/fbAddButton.svelte';
  import FbAddressograph from '../components/fbAddressograph.svelte';
  import FbLayoutNav from '../components/fbLayoutNav.svelte';
  import FbTable from '../components/fbTable.svelte';
  import FbTableBody from '../components/fbTableBody.svelte';
  import FbTableCell from '../components/fbTableCell.svelte';
  import FbTableHeader from '../components/fbTableHeader.svelte';
  import FbTableHeaderCell from '../components/fbTableHeaderCell.svelte';
  import FbTableRow from '../components/fbTableRow.svelte';
  import FbNumberInput from '../components/fbNumberInput.svelte';
  import FbDateHeightWeightBMIRow from '../components/fbDateHeightWeightBMIRow.svelte';
  import FbNotificationTypeGroup from '../components/fbNotificationTypeGroup.svelte';
  import FbSmartDropdown from '../components/fbSmartDropdown.svelte';
  import FbTextArea from '../components/fbTextArea.svelte';
  import FbTextInput from '../components/fbTextInput.svelte';
  import FbToolTip from '../components/fbToolTip.svelte';
  import FbcpCheck from '../components/fbcpCheck.svelte';
  import FbcpDropdown from '../components/fbcpDropdown.svelte';
  import FbcpTextInput from '../components/fbcpTextInput.svelte';
  import FbcpTextarea from '../components/fbcpTextarea.svelte';
  import { composerAuth, deleteDesign, listDesignsBySession, saveComposerPrefs, saveDesign } from '../lib/api';

  type ComposerComponent = {
    id: string;
    key?: string;
    type: string;
    label?: string;
    text?: string;
    value?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    placeholder?: string;
    defaultValue?: string;
    units?: string;
    tooltip?: string;
    databaseColumn?: string;
    notes?: string;
    options?: Array<{ value: string; label: string }>;
    children?: ComposerComponent[];
    [key: string]: any;
  };

  type ComposerDesign = {
    id: string;
    publicId: string;
    title: string;
    patientUuid: string;
    components: ComposerComponent[];
  };

  type SeparatorTarget = {
    id: string;
    parentId: string;
    index: number;
    orientation: 'wide' | 'tall' | 'tallForSingle';
    fullSize?: boolean;
  };

  type TableTarget =
    | { kind: 'header'; tableId: string; columnIndex: number }
    | { kind: 'row'; tableId: string; rowIndex: number }
    | { kind: 'cell'; tableId: string; rowIndex: number; columnIndex: number }
    | { kind: 'separator'; tableId: string; separatorIndex: number };

  const sessionKey = 'formBuilder2ComposerSession';
  const defaultPatientUuid = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  const devComposerBypass = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get('devComposerBypass') === '1';
  const paletteTypes = [
    'fbSection',
    'fbGridRow',
    'fbGridCell',
    'fbTable',
    'fbTextInput',
    'fbTextArea',
    'fbDropdown',
    'fbSmartDropdown',
    'fbGroup',
    'fbRadio',
    'fbCheck',
    'fbInverseSubq',
    'fbSubqForOption',
    'fbNumberInput',
    'fbNumberInputWithUnits',
    'fbDateHeightWeightBMIRow',
    'fbNotificationTypeGroup',
    'fbDateExact',
    'fbDatePartial',
    'fbTime',
    'fbMSISelector',
    'fbSCTProcedure',
    'fbSCTDiagnosis',
    'fbBoxedInfo',
    'fbBoxedWarning',
    'fbBoxedAlert',
    'fbBloodPressure',
  ];
  const questionTypes = [
    'fbTextInput',
    'fbTime',
    'fbTextArea',
    'fbDropdown',
    'fbSmartDropdown',
    'fbNumberInput',
    'fbNumberInputWithUnits',
    'fbDateHeightWeightBMIRow',
    'fbNotificationTypeGroup',
    'fbBloodPressure',
    'fbCheck',
    'fbRadio',
    'fbInverseSubq',
    'fbSubqForOption',
    'fbGroup',
    'fbDatePartial',
    'fbDateExact',
    'fbMSISelector',
    'fbSCTDiagnosis',
    'fbSCTProcedure',
  ];
  const messageTypes = ['fbBoxedWarning', 'fbBoxedAlert', 'fbBoxedInfo'];
  const formOrSectionComponentTypes = ['fbTable', ...messageTypes, ...questionTypes];
  const typeLabels: Record<string, string> = {
    fbSection: 'Section',
    fbGridRow: 'Grid row',
    fbGridCell: 'Grid cell',
    fbTable: 'Table',
    fbTextInput: 'Text input',
    fbTextArea: 'Text area',
    fbDropdown: 'Dropdown',
    fbSmartDropdown: 'Smart dropdown',
    fbGroup: 'Group',
    fbRadio: 'Radio button',
    fbCheck: 'Checkbox',
    fbInverseSubq: 'Inverse subquestion',
    fbSubqForOption: 'Subquestion for option',
    fbNumberInput: 'Number input',
    fbNumberInputWithUnits: 'Number input with units',
    fbDateHeightWeightBMIRow: 'Date, height, weight, BMI row',
    fbNotificationTypeGroup: 'Notification type group',
    fbDateExact: 'Exact date',
    fbDatePartial: 'Partial date',
    fbTime: 'Time',
    fbMSISelector: 'Staff selector',
    fbSCTProcedure: 'SNOMED CT procedure',
    fbSCTDiagnosis: 'SNOMED CT diagnosis',
    fbBoxedInfo: 'Boxed info',
    fbBoxedWarning: 'Boxed warning',
    fbBoxedAlert: 'Boxed alert',
    fbBloodPressure: 'Blood pressure',
  };

  let email = '';
  let password = '';
  let repeatPassword = '';
  let remember = true;
  let verifyCode = '';
  let authMode: 'login' | 'register' = 'login';
  let awaitingVerification = false;
  let showPassword = false;
  let sessionToken = devComposerBypass ? null : localStorage.getItem(sessionKey) || readCookie(sessionKey);
  let authMessage = '';
  let designs: ComposerDesign[] = [];
  let activeDesign: ComposerDesign = devComposerBypass ? devPreviewDesign() : newDesign();
  let selectedId = 'form';
  let jsonText = JSON.stringify(activeDesign, null, 2);
  let jsonError = '';
  let showJson = false;
  let statusMessage = '';
  let loading = false;
  let savingDesign = false;
  let composerReady = false;
  let prefsReady = false;
  let prefsSaveTimer: number | null = null;
  let designSaveTimer: number | null = null;
  let lastSavedDesignSignature = '';
  let isReadOnlyPreview = false;
  let showRowsAndCellsInBreadcrumbs = false;
  let showSelectedPurpleBoxes = true;
  let showAllPurpleBoxes = false;
  let showGreenBars = false;
  let showingDesignList = false;
  let selectedSeparator: SeparatorTarget | null = null;
  let selectedTableTarget: TableTarget | null = null;
  let draggedId: string | null = null;
  let draggedTableColumn: { tableId: string; columnIndex: number } | null = null;
  let draggedTableRow: { tableId: string; rowIndex: number } | null = null;
  let dragDropProblemVisible = false;
  let dragDropProblemTimer: number | null = null;
  let previewValues: Record<string, string> = {};

  $: publicUrl = activeDesign.publicId ? `${window.location.origin}/formBuilder2/userForm.html#${activeDesign.publicId}` : '';
  $: selectedComponent = selectedId === 'form' ? null : findComponent(activeDesign.components, selectedId);
  $: selectedPath = selectedId === 'form' ? [] : componentPath(activeDesign.components, selectedId);
  $: selectedParent = selectedPath.length > 1 ? selectedPath[selectedPath.length - 2] : null;
  $: selectedTable = selectedTableTarget ? findComponent(activeDesign.components, selectedTableTarget.tableId) : null;
  $: selectedTableTemplate = selectedTableTarget?.kind === 'cell' && selectedTable
    ? normaliseTableTemplates(selectedTable)[selectedTableTarget.columnIndex]
    : null;
  $: propertyComponent = selectedTableTemplate || selectedComponent;
  $: selectedColSpanCell = selectedComponent?.type === 'fbGridCell' ? selectedComponent : selectedParent?.type === 'fbGridCell' ? selectedParent : null;
  $: selectedLabel = propertyComponent?.text ?? propertyComponent?.label ?? '';
  $: selectedOptionsText = propertyComponent?.options?.map((option) => `${option.value}|${option.label}`).join('\n') || '';
  $: selectedTableColumnsText = selectedComponent?.tableColumns?.map((column: any) => `${column.id || column.label}|${column.label || column.id || ''}`).join('\n') || '';
  $: selectedTableRowCount = selectedComponent?.tableRows?.length || 0;
  $: composerUnlocked = Boolean(sessionToken) || devComposerBypass;
  $: greenBarsVisible = composerUnlocked && !showingDesignList && !isReadOnlyPreview && showGreenBars;
  $: activeDesignDirty = composerReady && lastSavedDesignSignature !== JSON.stringify(activeDesign);
  $: saveButtonState = savingDesign ? 'saving' : activeDesignDirty ? 'dirty' : 'saved';
  $: saveButtonLabel = saveButtonState === 'saved' ? 'Saved' : saveButtonState === 'saving' ? 'Saving...' : 'Save';
  $: breadcrumbItems = selectedId === 'form'
    ? [{ id: 'form', label: 'Forms' }, { id: 'form', label: activeDesign.title || 'Untitled form' }]
    : [{ id: 'form', label: 'Forms' }, { id: 'form', label: activeDesign.title || 'Untitled form' }, ...selectedPath.map((component) => ({ id: component.id, label: breadcrumbLabel(component) })).filter((item) => item.label)];
  $: composerNavItems = activeDesign.components
    .filter((component) => component.type === 'fbSection')
    .map((section, index) => ({
      id: section.id,
      label: section.label || `Section ${index + 1}`,
      isActive: selectedId === section.id || Boolean(findComponent(section.children || [], selectedId)),
      isComplete: true,
      incomplete: 0,
      onClick: () => {
        selectedId = section.id;
      },
    }));
  $: if (composerReady && prefsReady && sessionToken) {
    activeDesign.id;
    showRowsAndCellsInBreadcrumbs;
    showSelectedPurpleBoxes;
    showAllPurpleBoxes;
    showGreenBars;
    schedulePrefsSave();
  }

  $: if (composerReady && prefsReady && sessionToken && !showingDesignList) {
    const activeSignature = JSON.stringify(activeDesign);
    if (lastSavedDesignSignature && activeSignature !== lastSavedDesignSignature) scheduleDesignSave();
  }

  onMount(async () => {
    if (sessionToken) {
      await resumeSession();
    } else if (devComposerBypass) {
      email = 'local-composer-preview@wales.nhs.uk';
      prefsReady = true;
      markDesignClean();
    }
    composerReady = true;
  });

  function readCookie(name: string) {
    const prefix = `${encodeURIComponent(name)}=`;
    return document.cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix))?.slice(prefix.length) || null;
  }

  function rememberSession(token: string, expiresAt?: string) {
    sessionToken = token;
    localStorage.setItem(sessionKey, token);
    const maxAge = expiresAt ? Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 60 * 60 * 24 * 30;
    document.cookie = `${encodeURIComponent(sessionKey)}=${token}; max-age=${maxAge}; path=/; samesite=lax`;
  }

  function clearSession() {
    sessionToken = null;
    localStorage.removeItem(sessionKey);
    document.cookie = `${encodeURIComponent(sessionKey)}=; max-age=0; path=/; samesite=lax`;
  }

  function randomHex(length = 16) {
    const bytes = new Uint8Array(Math.max(1, Math.ceil(length / 2)));
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
  }

  function makeUuid() {
    return crypto.randomUUID ? crypto.randomUUID() : `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`;
  }

  function newDesign(): ComposerDesign {
    return {
      id: makeUuid(),
      publicId: randomHex(32),
      title: 'My first form',
      patientUuid: defaultPatientUuid,
      components: [],
    };
  }

  function devPreviewDesign(): ComposerDesign {
    return {
      id: makeUuid(),
      publicId: 'composerpreview',
      title: 'Composer preview form',
      patientUuid: defaultPatientUuid,
      components: [
        {
          id: 'section1',
          key: 'section1',
          type: 'fbSection',
          label: 'Section 1',
          children: [
            {
              id: 'row1',
              key: 'row1',
              type: 'fbGridRow',
              label: 'Grid row 1',
              children: [
                { id: 'cell1', key: 'cell1', type: 'fbGridCell', label: '', colSpan: 1, children: [{ id: 'field1', key: 'field1', type: 'fbTextInput', label: 'Text question', required: true }] },
                { id: 'cell2', key: 'cell2', type: 'fbGridCell', label: '', colSpan: 1, children: [{ id: 'field2', key: 'field2', type: 'fbDropdown', label: 'Dropdown question', options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }] }] },
                {
                  id: 'cell3',
                  key: 'cell3',
                  type: 'fbGridCell',
                  label: '',
                  colSpan: 1,
                  children: [{
                    id: 'group1',
                    key: 'group1',
                    type: 'fbGroup',
                    label: 'Group question',
                    children: [
                      { id: 'field3', key: 'field3', type: 'fbRadio', label: 'Radio option', value: 'radioOption' },
                      { id: 'field4', key: 'field4', type: 'fbCheck', label: 'Check option', value: 'checkOption' },
                    ],
                  }],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  function allComponents(components: ComposerComponent[]): ComposerComponent[] {
    return components.flatMap((component) => [component, ...allComponents(component.children || [])]);
  }

  function idPrefixForType(type: string) {
    if (type === 'fbSection') return 'section';
    if (type === 'fbGridRow') return 'row';
    if (type === 'fbGridCell') return 'cell';
    if (type === 'fbGroup') return 'group';
    if (type === 'fbTable') return 'table';
    return 'field';
  }

  function nextUniqueComponentId(type: string, existing = allComponents(activeDesign.components)) {
    const prefix = idPrefixForType(type);
    const used = new Set(existing.map((component) => component.id));
    let index = 1;
    while (used.has(`${prefix}${index}`)) index += 1;
    return `${prefix}${index}`;
  }

  function componentLabel(type: string) {
    return typeLabels[type] || type.replace(/^fb/, '').replace(/([A-Z])/g, ' $1').trim() || 'Question';
  }

  function gridCellSpan(component: ComposerComponent | null | undefined) {
    return Math.max(1, Math.min(12, Number(component?.colSpan) || 1));
  }

  function gridRowSpanTotal(row: ComposerComponent | null | undefined) {
    const cells = (row?.children || []).filter((child) => child.type === 'fbGridCell');
    return Math.max(1, cells.reduce((total, cell) => total + gridCellSpan(cell), 0));
  }

  function previewGridCellStyle(component: ComposerComponent, rowContext: ComposerComponent | null) {
    const span = gridCellSpan(component);
    if (!rowContext) return `grid-column: span ${span};`;

    const cells = (rowContext.children || []).filter((child) => child.type === 'fbGridCell');
    const totalSpan = gridRowSpanTotal(rowContext);
    const cellCount = Math.max(1, cells.length);
    const separatorCount = greenBarsVisible ? cellCount + 1 : 0;
    const itemCount = greenBarsVisible ? (cellCount * 2) + 1 : cellCount;
    const gapCount = Math.max(0, itemCount - 1);
    const reservedRem = separatorCount + gapCount;
    const basis = `calc((100% - ${reservedRem}rem) * ${span} / ${totalSpan})`;
    return `grid-column: span ${span}; flex: 0 0 ${basis}; min-width: 0;`;
  }

  function previewComponentClass(
    component: ComposerComponent,
    currentSelectedId = selectedId,
    showAll = showAllPurpleBoxes,
    showSelected = showSelectedPurpleBoxes,
    showGreen = greenBarsVisible,
    readOnly = isReadOnlyPreview,
  ) {
    return [
      'preview-component',
      isSelectionShown(component, currentSelectedId, showAll, showSelected) ? 'selected' : '',
      showGreen ? 'green-bar' : '',
      readOnly ? 'read-only' : '',
      component.type === 'fbSection' ? 'preview-section-component' : '',
      component.type === 'fbGridRow' ? 'preview-grid-row-component' : '',
      component.type === 'fbGridCell' ? 'preview-grid-cell-component' : '',
      component.type === 'fbGroup' ? 'fb-radio-checkbox-group-container' : '',
      questionTypes.includes(component.type) && !['fbRadio', 'fbCheck'].includes(component.type) ? 'fb-question-container' : '',
    ].filter(Boolean).join(' ');
  }

  function makeComponent(type: string, existing = allComponents(activeDesign.components)): ComposerComponent {
    const sameTypeCount = existing.filter((component) => component.type === type).length + 1;
    const id = nextUniqueComponentId(type, existing);
    const base: ComposerComponent = { id, key: id, type, label: componentLabel(type) };
    if (type === 'fbSection') return { ...base, label: `Section ${sameTypeCount}`, children: [] };
    if (type === 'fbGridRow') return { ...base, label: `Grid row ${sameTypeCount}`, children: [] };
    if (type === 'fbGridCell') return { ...base, label: '', colSpan: 1, children: [] };
    if (type === 'fbTable') return {
      ...base,
      label: `Table ${sameTypeCount}`,
      useFullWidth: true,
      includeDragHandles: false,
      includeRowDeleteButtons: false,
      requireAtLeastOneRow: false,
      requireAtLeastOneRowText: 'Enter at least one row',
      includeAddButton: false,
      addButtonLabel: 'Add row',
      tableColumns: [{ id: `${id}-col1`, label: 'Column 1' }],
      tableRows: [{ id: `${id}-row1` }, { id: `${id}-row2` }, { id: `${id}-row3` }],
      tableCellTemplates: [makeComponent('fbTextInput', [...existing, base])],
    };
    if (type === 'fbDropdown' || type === 'fbSmartDropdown') return { ...base, label: `Question ${sameTypeCount}`, options: [{ value: 'option1', label: 'Option 1' }] };
    if (type === 'fbSubqForOption') return { ...base, label: `Option subquestion ${sameTypeCount}`, optionValue: 'option1', children: [] };
    if (type === 'fbInverseSubq') return { ...base, label: `Inverse subquestion ${sameTypeCount}`, children: [] };
    if (type === 'fbNotificationTypeGroup') return { ...base, label: 'Notification type' };
    if (type === 'fbDateHeightWeightBMIRow') return { ...base, label: 'Date recorded / height / weight / BMI' };
    if (type === 'fbGroup') return {
      ...base,
      label: `Group ${sameTypeCount}`,
      children: [],
    };
    if (type === 'fbRadio') return { ...base, label: `Radio ${sameTypeCount}`, value: `option${sameTypeCount}` };
    if (type === 'fbCheck') return { ...base, label: `Check ${sameTypeCount}`, value: `option${sameTypeCount}` };
    if (['fbTextInput', 'fbTime', 'fbTextArea', 'fbNumberInput', 'fbNumberInputWithUnits', 'fbDateExact', 'fbDatePartial', 'fbMSISelector', 'fbSCTProcedure', 'fbSCTDiagnosis', 'fbBloodPressure'].includes(type)) {
      return { ...base, label: `Question ${sameTypeCount}`, placeholder: ['fbTextInput', 'fbTime', 'fbTextArea'].includes(type) ? '' : undefined, fullWidth: type === 'fbTextArea' ? false : undefined, units: type === 'fbNumberInputWithUnits' ? 'units' : undefined };
    }
    if (type === 'fbNumberInputWithUnits') return { ...base, units: 'units' };
    if (type === 'fbBoxedInfo') return { ...base, text: 'Information message' };
    if (type === 'fbBoxedWarning') return { ...base, text: 'Warning message' };
    if (type === 'fbBoxedAlert') return { ...base, text: 'Alert message' };
    return base;
  }

  function syncJson() {
    jsonText = JSON.stringify(activeDesign, null, 2);
    jsonError = '';
  }

  function repairDesign(input: any): ComposerDesign {
    return {
      id: input?.id || makeUuid(),
      publicId: input?.publicId || randomHex(32),
      title: input?.title || 'My first form',
      patientUuid: input?.patientUuid || defaultPatientUuid,
      components: Array.isArray(input?.components) ? repairComponents(input.components) : [],
      notes: input?.notes || '',
    };
  }

  function repairComponents(components: any[]): ComposerComponent[] {
    const seen = new Set<string>();
    const repair = (component: any): ComposerComponent => {
      const type = component?.type || 'fbTextInput';
      const fallbackId = nextUniqueComponentId(type, Array.from(seen).map((id) => ({ id, type: 'existing' } as ComposerComponent)));
      let id = String(component?.id || fallbackId);
      if (seen.has(id)) id = fallbackId;
      seen.add(id);
      const next: ComposerComponent = { ...component, id, key: component?.key || id, type };
      if (next.type === 'fbGridCell') next.colSpan = Math.min(12, Math.max(1, Number(next.colSpan) || 1));
      if (Array.isArray(component?.children)) next.children = component.children.map(repair);
      return next;
    };
    return components.map(repair);
  }

  async function applyJson(saveAfterApply = false) {
    try {
      activeDesign = repairDesign(JSON.parse(jsonText));
      selectedId = 'form';
      jsonError = '';
      statusMessage = 'JSON applied.';
      syncJson();
      showJson = false;
      if (saveAfterApply) await persistDesign();
    } catch (error) {
      jsonError = error instanceof Error ? error.message : String(error);
    }
  }

  function findComponent(components: ComposerComponent[], id: string): ComposerComponent | null {
    for (const component of components) {
      if (component.id === id) return component;
      const child = findComponent(component.children || [], id);
      if (child) return child;
    }
    return null;
  }

  function componentPath(components: ComposerComponent[], id: string, parents: ComposerComponent[] = []): ComposerComponent[] {
    for (const component of components) {
      const path = [...parents, component];
      if (component.id === id) return path;
      const childPath = componentPath(component.children || [], id, path);
      if (childPath.length) return childPath;
    }
    return [];
  }

  function breadcrumbLabel(component: ComposerComponent) {
    if (!showRowsAndCellsInBreadcrumbs && (component.type === 'fbGridRow' || component.type === 'fbGridCell')) return '';
    return component.label || component.text || typeLabels[component.type] || component.type;
  }

  function updateComponentTree(components: ComposerComponent[], id: string, updater: (component: ComposerComponent) => ComposerComponent): ComposerComponent[] {
    return components.map((component) => {
      if (component.id === id) return updater(component);
      if (component.children) return { ...component, children: updateComponentTree(component.children, id, updater) };
      return component;
    });
  }

  function removeComponentTree(components: ComposerComponent[], id: string): ComposerComponent[] {
    return components
      .filter((component) => component.id !== id)
      .map((component) => component.children ? { ...component, children: removeComponentTree(component.children, id) } : component);
  }

  function extractComponent(components: ComposerComponent[], id: string): { components: ComposerComponent[]; extracted: ComposerComponent | null } {
    let extracted: ComposerComponent | null = null;
    const next = components.flatMap((component) => {
      if (component.id === id) {
        extracted = component;
        return [];
      }
      if (component.children) {
        const result = extractComponent(component.children, id);
        if (result.extracted) extracted = result.extracted;
        return [{ ...component, children: result.components }];
      }
      return [component];
    });
    return { components: next, extracted };
  }

  function insertIntoParentAt(components: ComposerComponent[], parentId: string, index: number, componentToInsert: ComposerComponent): ComposerComponent[] {
    if (parentId === 'form') {
      const next = [...components];
      next.splice(Math.max(0, Math.min(index, next.length)), 0, componentToInsert);
      return next;
    }
    return components.map((component) => {
      if (component.id === parentId) {
        const children = [...(component.children || [])];
        children.splice(Math.max(0, Math.min(index, children.length)), 0, componentToInsert);
        return { ...component, children };
      }
      return component.children ? { ...component, children: insertIntoParentAt(component.children, parentId, index, componentToInsert) } : component;
    });
  }

  function replaceChildAtWithRow(components: ComposerComponent[], parentId: string, index: number, row: ComposerComponent): ComposerComponent[] {
    if (parentId === 'form') {
      const next = [...components];
      next.splice(Math.max(0, Math.min(index, next.length - 1)), 1, row);
      return next;
    }
    return components.map((component) => {
      if (component.id === parentId) {
        const children = [...(component.children || [])];
        children.splice(Math.max(0, Math.min(index, children.length - 1)), 1, row);
        return { ...component, children };
      }
      return component.children ? { ...component, children: replaceChildAtWithRow(component.children, parentId, index, row) } : component;
    });
  }

  function childrenForParent(components: ComposerComponent[], parentId: string) {
    if (parentId === 'form') return components;
    return findComponent(components, parentId)?.children || [];
  }

  function canDropOnSeparator(target: SeparatorTarget) {
    if (!draggedId) return false;
    const dragged = findComponent(activeDesign.components, draggedId);
    const parent = target.parentId === 'form' ? null : findComponent(activeDesign.components, target.parentId);
    if (!dragged || dragged.id === target.parentId) return false;
    const parentPath = target.parentId === 'form' ? [] : componentPath(activeDesign.components, target.parentId);
    if (parentPath.some((component) => component.id === dragged.id)) return false;
    if (target.orientation === 'tallForSingle') {
      return questionTypes.includes(dragged.type) && (target.parentId === 'form' || parent?.type === 'fbSection');
    }
    if (dragged.type === 'fbGridRow') return target.parentId === 'form' || parent?.type === 'fbSection';
    if (dragged.type === 'fbGridCell') return parent?.type === 'fbGridRow';
    if (parent?.type === 'fbGridRow') return questionTypes.includes(dragged.type);
    if (parent?.type === 'fbGroup') return dragged.type === 'fbRadio' || dragged.type === 'fbCheck';
    return true;
  }

  function showDragDropProblem() {
    dragDropProblemVisible = true;
    if (dragDropProblemTimer) window.clearTimeout(dragDropProblemTimer);
    dragDropProblemTimer = window.setTimeout(() => {
      dragDropProblemVisible = false;
      dragDropProblemTimer = null;
    }, 900);
  }

  function moveDraggedToSeparator(target: SeparatorTarget) {
    if (!draggedId || !canDropOnSeparator(target)) {
      draggedId = null;
      showDragDropProblem();
      return;
    }
    const existing = allComponents(activeDesign.components);
    const dragged = existing.find((component) => component.id === draggedId);
    const parent = target.parentId === 'form' ? null : existing.find((component) => component.id === target.parentId) || null;
    if (!dragged) return;
    let components = activeDesign.components;
    if (target.orientation === 'tallForSingle') {
      const originalIndex = target.id.includes('single-right') ? target.index - 1 : target.index;
      const original = childrenForParent(components, target.parentId)[originalIndex];
      if (!original || original.id === draggedId || !questionTypes.includes(dragged.type)) return;
      const draggedPath = componentPath(components, draggedId);
      const draggedParent = draggedPath.length > 1 ? draggedPath[draggedPath.length - 2] : null;
      const draggedSiblings = childrenForParent(components, draggedParent?.id || 'form');
      const draggedSiblingIndex = draggedSiblings.findIndex((child) => child.id === draggedId);
      const adjustedOriginalIndex = draggedParent?.id === target.parentId || (!draggedParent && target.parentId === 'form')
        ? originalIndex - (draggedSiblingIndex >= 0 && draggedSiblingIndex < originalIndex ? 1 : 0)
        : originalIndex;
      const result = extractComponent(components, draggedId);
      if (!result.extracted) return;
      const firstChild = target.id.includes('single-right') ? original : result.extracted;
      const secondChild = target.id.includes('single-right') ? result.extracted : original;
      const firstCell = { ...makeComponent('fbGridCell', existing), children: [firstChild] };
      const secondCell = { ...makeComponent('fbGridCell', [...existing, firstCell]), children: [secondChild] };
      const row = { ...makeComponent('fbGridRow', [...existing, firstCell, secondCell]), children: [firstCell, secondCell] };
      components = replaceChildAtWithRow(result.components, target.parentId, adjustedOriginalIndex, row);
    } else {
      const result = extractComponent(components, draggedId);
      if (!result.extracted) return;
      const postExtractComponents = allComponents(result.components);
      const componentToInsert = parent?.type === 'fbGridRow' && questionTypes.includes(result.extracted.type)
        ? { ...makeComponent('fbGridCell', postExtractComponents), children: [result.extracted] }
        : result.extracted;
      components = insertIntoParentAt(result.components, target.parentId, target.index, componentToInsert);
    }
    activeDesign = { ...activeDesign, components };
    selectedId = dragged.id;
    selectedSeparator = null;
    draggedId = null;
    syncJson();
  }

  function updateComponent(id: string, patch: Partial<ComposerComponent>) {
    activeDesign = { ...activeDesign, components: updateComponentTree(activeDesign.components, id, (component) => ({ ...component, ...patch })) };
    syncJson();
  }

  function insertChild(parentId: string, component: ComposerComponent) {
    if (parentId === 'form') {
      activeDesign = { ...activeDesign, components: [...activeDesign.components, component] };
    } else {
      activeDesign = {
        ...activeDesign,
        components: updateComponentTree(activeDesign.components, parentId, (parent) => ({ ...parent, children: [...(parent.children || []), component] })),
      };
    }
    selectedId = component.id;
    syncJson();
  }

  function wrapForRow(type: string) {
    const cell = makeComponent('fbGridCell');
    return { ...cell, children: [makeComponent(type, [...allComponents(activeDesign.components), cell])] };
  }

  function addComponent(type: string, parentId = selectedId) {
    const component = type === 'fbGridRow' ? makeComponent(type) : makeComponent(type);
    const target = parentId === 'form' ? null : findComponent(activeDesign.components, parentId);
    if (target?.type === 'fbGridRow') {
      const cell = { ...makeComponent('fbGridCell'), children: [component] };
      insertChild(parentId, cell);
      selectedId = component.id;
      return;
    }
    if ((target?.type === 'fbSection' || target?.type === 'fbGridCell' || target?.type === 'fbGroup' || target?.type === 'fbRadio' || target?.type === 'fbCheck') || parentId === 'form') {
      insertChild(parentId, component);
      return;
    }
    insertAfterSelected(component);
  }

  function insertAfterSelected(component: ComposerComponent) {
    const insert = (components: ComposerComponent[]): [ComposerComponent[], boolean] => {
      const next: ComposerComponent[] = [];
      for (const current of components) {
        if (current.id === selectedId) {
          next.push(current, component);
          return [next.concat(components.slice(components.indexOf(current) + 1)), true];
        }
        if (current.children) {
          const [children, found] = insert(current.children);
          next.push({ ...current, children });
          if (found) return [next.concat(components.slice(components.indexOf(current) + 1)), true];
        } else {
          next.push(current);
        }
      }
      return [next, false];
    };
    const [components, found] = insert(activeDesign.components);
    activeDesign = { ...activeDesign, components: found ? components : [...activeDesign.components, component] };
    selectedId = component.id;
    syncJson();
  }

  function addComponentBelow(type: string) {
    if (selectedComponent?.type === 'fbGridRow') {
      insertAfterSelected(type === 'fbGridRow' ? makeComponent('fbGridRow') : { ...makeComponent('fbGridRow'), children: [wrapForRow(type)] });
      return;
    }
    insertAfterSelected(makeComponent(type));
  }

  function replaceSelectedWithRow(type: string) {
    if (!selectedComponent) return false;
    const existing = allComponents(activeDesign.components);
    const leftCell = makeComponent('fbGridCell', existing);
    const rightCell = makeComponent('fbGridCell', [...existing, leftCell]);
    const newComponent = makeComponent(type, [...existing, leftCell, rightCell]);
    const row = makeComponent('fbGridRow', [...existing, leftCell, rightCell, newComponent]);
    const rowWithChildren = {
      ...row,
      children: [
        { ...leftCell, children: [selectedComponent] },
        { ...rightCell, children: [newComponent] },
      ],
    };
    const replace = (components: ComposerComponent[]): [ComposerComponent[], boolean] => {
      const next: ComposerComponent[] = [];
      for (const current of components) {
        if (current.id === selectedId) {
          next.push(rowWithChildren);
          return [next.concat(components.slice(components.indexOf(current) + 1)), true];
        }
        if (current.children) {
          const [children, found] = replace(current.children);
          next.push({ ...current, children });
          if (found) return [next.concat(components.slice(components.indexOf(current) + 1)), true];
        } else {
          next.push(current);
        }
      }
      return [next, false];
    };
    const [components, found] = replace(activeDesign.components);
    if (!found) return false;
    activeDesign = { ...activeDesign, components };
    selectedId = newComponent.id;
    syncJson();
    return true;
  }

  function addComponentRight(type: string) {
    const path = selectedPath;
    const row = [...path].reverse().find((component) => component.type === 'fbGridRow');
    const cell = selectedComponent?.type === 'fbGridCell' ? selectedComponent : selectedParent?.type === 'fbGridCell' ? selectedParent : null;
    if (!row || !cell) {
      if (!replaceSelectedWithRow(type)) addComponentBelow(type);
      return;
    }
    const newCell = wrapForRow(type);
    activeDesign = {
      ...activeDesign,
      components: updateComponentTree(activeDesign.components, row.id, (rowComponent) => {
        const children = rowComponent.children || [];
        const index = children.findIndex((child) => child.id === cell.id);
        return { ...rowComponent, children: [...children.slice(0, index + 1), newCell, ...children.slice(index + 1)] };
      }),
    };
    selectedId = newCell.children?.[0]?.id || newCell.id;
    syncJson();
  }

  function componentTypesForSeparator(separator: SeparatorTarget) {
    const parent = separator.parentId === 'form' ? null : findComponent(activeDesign.components, separator.parentId);
    if (!parent || parent.type === 'fbSection' || parent.type === 'fbGridCell') return formOrSectionComponentTypes;
    if (parent.type === 'fbGroup') return ['fbRadio', 'fbCheck'];
    if (parent.type === 'fbDropdown' || parent.type === 'fbSmartDropdown') return ['fbSubqForOption'];
    return questionTypes;
  }

  function addComponentAtSelectedSeparator(type: string) {
    if (!selectedSeparator) return;
    const separator = selectedSeparator;
    const existing = allComponents(activeDesign.components);
    const parent = separator.parentId === 'form' ? null : findComponent(activeDesign.components, separator.parentId);
    let component = makeComponent(type, existing);
    let nextSelectedId = component.id;
    let components = activeDesign.components;
    if (separator.orientation === 'tallForSingle') {
      const originalIndex = separator.id.includes('single-right') ? separator.index - 1 : separator.index;
      const original = childrenForParent(activeDesign.components, separator.parentId)[originalIndex];
      if (original && questionTypes.includes(type)) {
        const insertedComponent = component;
        const firstChild = separator.id.includes('single-right') ? original : insertedComponent;
        const secondChild = separator.id.includes('single-right') ? insertedComponent : original;
        const firstCell = { ...makeComponent('fbGridCell', existing), children: [firstChild] };
        const secondCell = { ...makeComponent('fbGridCell', [...existing, firstCell]), children: [secondChild] };
        component = { ...makeComponent('fbGridRow', [...existing, firstCell, secondCell]), children: [firstCell, secondCell] };
        nextSelectedId = insertedComponent.id;
        components = replaceChildAtWithRow(components, separator.parentId, originalIndex, component);
      } else {
        components = insertIntoParentAt(components, separator.parentId, separator.index, component);
      }
    } else if (parent?.type === 'fbGridRow' && questionTypes.includes(type)) {
      const insertedComponent = component;
      component = { ...makeComponent('fbGridCell', existing), children: [insertedComponent] };
      nextSelectedId = insertedComponent.id;
      components = insertIntoParentAt(components, separator.parentId, separator.index, component);
    } else {
      components = insertIntoParentAt(components, separator.parentId, separator.index, component);
    }
    activeDesign = { ...activeDesign, components };
    selectedId = nextSelectedId;
    selectedSeparator = null;
    syncJson();
  }

  function addPaletteComponent(type: string) {
    if (selectedSeparator) {
      addComponentAtSelectedSeparator(type);
      return;
    }
    if (!selectedComponent) {
      addComponent(type, 'form');
      return;
    }
    if (selectedComponent.type === 'fbGridCell' || selectedParent?.type === 'fbGridCell') {
      addComponentRight(type);
      return;
    }
    if (['fbSection', 'fbGridRow', 'fbGroup', 'fbRadio', 'fbCheck', 'fbDropdown', 'fbSmartDropdown', 'fbInverseSubq', 'fbSubqForOption'].includes(selectedComponent.type)) {
      addComponent(type, selectedId);
      return;
    }
    addComponentBelow(type);
  }

  function removeSelected() {
    if (!selectedComponent) return;
    activeDesign = { ...activeDesign, components: removeComponentTree(activeDesign.components, selectedId) };
    selectedId = 'form';
    syncJson();
  }

  function updateSelectedText(value: string) {
    if (!propertyComponent) return;
    const key = propertyComponent.type.startsWith('fbBoxed') ? 'text' : 'label';
    updatePropertyComponent({ [key]: value });
  }

  function updateSelectedOptions(value: string) {
    if (!propertyComponent) return;
    const options = value.split(/\r?\n/).map((line) => {
      const [optionValue, optionLabel] = line.split('|');
      return { value: (optionValue || '').trim(), label: (optionLabel || optionValue || '').trim() };
    }).filter((option) => option.value || option.label);
    updatePropertyComponent({ options });
  }

  function updateSelectedTableColumns(value: string) {
    if (!selectedComponent) return;
    const tableColumns = value.split(/\r?\n/).map((line, index) => {
      const [id, label] = line.split('|');
      const cleanId = (id || `col${index + 1}`).trim();
      return { id: cleanId, label: (label || id || `Column ${index + 1}`).trim() };
    }).filter((column) => column.id || column.label);
    updateComponent(selectedId, { tableColumns: tableColumns.length ? tableColumns : [{ id: 'col1', label: 'Column 1' }] });
  }

  function updateSelectedTableRowCount(value: number) {
    if (!selectedComponent) return;
    const rowCount = Math.max(0, Math.min(50, Math.floor(value) || 0));
    const currentRows = selectedComponent.tableRows || [];
    const tableRows = Array.from({ length: rowCount }, (_, index) => currentRows[index] || { id: `${selectedComponent.id}-row${index + 1}` });
    updateComponent(selectedId, { tableRows });
  }

  function tableColumns(component: ComposerComponent) {
    const rawColumns = component.tableColumns?.length ? component.tableColumns : [{ id: `${component.id}-col1`, label: 'Column 1' }];
    return rawColumns.map((column: any, index: number) => {
      if (typeof column === 'string') return { id: `${component.id}-col${index + 1}`, label: column || `Column ${index + 1}` };
      return { id: column.id || `${component.id}-col${index + 1}`, label: column.label || column.id || `Column ${index + 1}` };
    });
  }

  function tableRows(component: ComposerComponent) {
    if (Array.isArray(component.tableRows)) {
      return component.tableRows.length ? component.tableRows : [{ id: `${component.id}-row1` }];
    }
    const count = Math.max(1, Number(component.tableRows) || 3);
    return Array.from({ length: count }, (_, index) => ({ id: `${component.id}-row${index + 1}` }));
  }

  function normaliseTableTemplates(component: ComposerComponent) {
    const columns = tableColumns(component);
    const templates = [...(component.tableCellTemplates || [])];
    while (templates.length < columns.length) templates.push(null);
    return templates.slice(0, columns.length);
  }

  function updateTable(tableId: string, updater: (table: ComposerComponent) => ComposerComponent) {
    activeDesign = {
      ...activeDesign,
      components: updateComponentTree(activeDesign.components, tableId, updater),
    };
    syncJson();
  }

  function selectTableHeader(tableId: string, columnIndex: number) {
    selectedId = tableId;
    selectedTableTarget = { kind: 'header', tableId, columnIndex };
    selectedSeparator = null;
  }

  function selectTableRow(tableId: string, rowIndex: number) {
    selectedId = tableId;
    selectedTableTarget = { kind: 'row', tableId, rowIndex };
    selectedSeparator = null;
  }

  function selectTableCell(tableId: string, rowIndex: number, columnIndex: number) {
    selectedId = tableId;
    selectedTableTarget = { kind: 'cell', tableId, rowIndex, columnIndex };
    selectedSeparator = null;
  }

  function selectTableSeparator(tableId: string, separatorIndex: number) {
    selectedId = tableId;
    selectedTableTarget = { kind: 'separator', tableId, separatorIndex };
    selectedSeparator = null;
  }

  function updateTableColumnLabel(tableId: string, columnIndex: number, label: string) {
    updateTable(tableId, (table) => {
      const columns = tableColumns(table);
      columns[columnIndex] = { ...columns[columnIndex], label: label.trim() || `Column ${columnIndex + 1}` };
      return { ...table, tableColumns: columns };
    });
  }

  function addTableColumn(tableId: string, insertIndex: number) {
    updateTable(tableId, (table) => {
      const columns = tableColumns(table);
      const templates = normaliseTableTemplates(table);
      const index = Math.max(0, Math.min(columns.length, insertIndex));
      columns.splice(index, 0, { id: `${table.id}-col${columns.length + 1}`, label: `Column ${columns.length + 1}` });
      templates.splice(index, 0, null);
      return { ...table, tableColumns: columns, tableCellTemplates: templates };
    });
    selectedTableTarget = { kind: 'header', tableId, columnIndex: insertIndex };
  }

  function deleteTableColumn(tableId: string, columnIndex: number) {
    updateTable(tableId, (table) => {
      const columns = tableColumns(table);
      if (columns.length <= 1) return table;
      const templates = normaliseTableTemplates(table);
      columns.splice(columnIndex, 1);
      templates.splice(columnIndex, 1);
      return { ...table, tableColumns: columns, tableCellTemplates: templates };
    });
    selectedTableTarget = { kind: 'header', tableId, columnIndex: Math.max(0, columnIndex - 1) };
  }

  function deleteTableRow(tableId: string, rowIndex: number) {
    updateTable(tableId, (table) => {
      const rows = tableRows(table);
      if (rows.length <= 1) return table;
      rows.splice(rowIndex, 1);
      return { ...table, tableRows: rows };
    });
    selectedTableTarget = { kind: 'row', tableId, rowIndex: Math.max(0, rowIndex - 1) };
  }

  function addTableRow(tableId: string) {
    updateTable(tableId, (table) => {
      const rows = tableRows(table);
      return { ...table, tableRows: [...rows, { id: `${table.id}-row${rows.length + 1}` }] };
    });
  }

  function moveTableRow(tableId: string, fromIndex: number, toIndex: number) {
    let movedToIndex = fromIndex;
    updateTable(tableId, (table) => {
      const rows = tableRows(table);
      if (fromIndex < 0 || fromIndex >= rows.length || toIndex < 0 || toIndex >= rows.length || fromIndex === toIndex) return table;
      const nextRows = [...rows];
      const [row] = nextRows.splice(fromIndex, 1);
      nextRows.splice(toIndex, 0, row);
      movedToIndex = toIndex;
      return { ...table, tableRows: nextRows };
    });
    selectedTableTarget = { kind: 'row', tableId, rowIndex: movedToIndex };
  }

  function moveTableColumnToSeparator(tableId: string, fromIndex: number, separatorIndex: number) {
    let movedToIndex = fromIndex;
    updateTable(tableId, (table) => {
      const columns = tableColumns(table);
      if (fromIndex < 0 || fromIndex >= columns.length || separatorIndex < 0 || separatorIndex > columns.length) return table;
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
    selectedTableTarget = { kind: 'header', tableId, columnIndex: movedToIndex };
  }

  function addComponentToSelectedTableCell(type: string) {
    if (!selectedTableTarget || selectedTableTarget.kind !== 'cell') return;
    const tableId = selectedTableTarget.tableId;
    const columnIndex = selectedTableTarget.columnIndex;
    updateTable(tableId, (table) => {
      const templates = normaliseTableTemplates(table);
      templates[columnIndex] = makeComponent(type, allComponents(activeDesign.components));
      return { ...table, tableCellTemplates: templates };
    });
  }

  function updateTableCellTemplate(tableId: string, columnIndex: number, patch: Partial<ComposerComponent>) {
    updateTable(tableId, (table) => {
      const templates = normaliseTableTemplates(table);
      const current = templates[columnIndex];
      if (!current) return table;
      templates[columnIndex] = { ...current, ...patch };
      return { ...table, tableCellTemplates: templates };
    });
  }

  function updatePropertyComponent(patch: Partial<ComposerComponent>) {
    if (selectedTableTarget?.kind === 'cell' && selectedTableTemplate) {
      updateTableCellTemplate(selectedTableTarget.tableId, selectedTableTarget.columnIndex, patch);
      return;
    }
    if (selectedComponent) updateComponent(selectedComponent.id, patch);
  }

  function beginNewDesign() {
    activeDesign = newDesign();
    selectedId = 'form';
    isReadOnlyPreview = false;
    showingDesignList = false;
    syncJson();
  }

  function showDesignList() {
    selectedId = 'form';
    selectedSeparator = null;
    showingDesignList = true;
    isReadOnlyPreview = false;
    if (showAllPurpleBoxes) showAllPurpleBoxes = false;
  }

  function openDesign(design: ComposerDesign) {
    activeDesign = repairDesign(design);
    selectedId = 'form';
    selectedSeparator = null;
    showingDesignList = false;
    isReadOnlyPreview = false;
    syncJson();
  }

  function applyPrefs(prefs: any) {
    if (!prefs || typeof prefs !== 'object') return;
    if (typeof prefs.showRowsAndCellsInBreadcrumbs === 'boolean') showRowsAndCellsInBreadcrumbs = prefs.showRowsAndCellsInBreadcrumbs;
    if (typeof prefs.showPurpleBoxes === 'boolean') showSelectedPurpleBoxes = prefs.showPurpleBoxes;
    if (typeof prefs.showAllPurpleBoxes === 'boolean') showAllPurpleBoxes = prefs.showAllPurpleBoxes;
    if (typeof prefs.showGreenBoxes === 'boolean') showGreenBars = prefs.showGreenBoxes;
  }

  function schedulePrefsSave() {
    if (!sessionToken) return;
    if (prefsSaveTimer) window.clearTimeout(prefsSaveTimer);
    prefsSaveTimer = window.setTimeout(() => {
      prefsSaveTimer = null;
      void saveComposerPrefs(sessionToken!, {
        activeDesignId: activeDesign.id,
        showRowsAndCellsInBreadcrumbs,
        showPurpleBoxes: showSelectedPurpleBoxes,
        showAllPurpleBoxes,
        showGreenBoxes: showGreenBars,
      }).catch(() => {});
    }, 600);
  }

  function markDesignClean() {
    lastSavedDesignSignature = JSON.stringify(activeDesign);
  }

  function scheduleDesignSave() {
    if (!sessionToken || loading || showJson) return;
    if (designSaveTimer) window.clearTimeout(designSaveTimer);
    designSaveTimer = window.setTimeout(() => {
      designSaveTimer = null;
      void persistDesign(true);
    }, 1500);
  }

  async function resumeSession() {
    if (!sessionToken) return;
    try {
      const session = await composerAuth('session', { sessionToken });
      email = session.email || email;
      applyPrefs(session.prefs);
      if (session.sessionToken) rememberSession(session.sessionToken, session.expiresAt);
      await loadDesigns(session.prefs?.activeDesignId, true);
      markDesignClean();
      prefsReady = true;
    } catch {
      clearSession();
    }
  }

  async function login() {
    loading = true;
    authMessage = '';
    try {
      const session = await composerAuth('login', { email, password, remember });
      applyPrefs(session.prefs);
      rememberSession(session.sessionToken, session.expiresAt);
      await loadDesigns(session.prefs?.activeDesignId, true);
      password = '';
      repeatPassword = '';
      authMessage = 'Logged in.';
      markDesignClean();
      prefsReady = true;
    } catch (error) {
      authMessage = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  async function registerStart() {
    loading = true;
    authMessage = '';
    try {
      const normalisedEmail = email.trim().toLowerCase();
      if (!normalisedEmail.endsWith('@wales.nhs.uk')) throw new Error('Use a @wales.nhs.uk email address.');
      if (password !== repeatPassword) throw new Error('Passwords do not match.');
      await composerAuth('register-start', { email, password });
      awaitingVerification = true;
      authMessage = 'Verification code sent.';
    } catch (error) {
      authMessage = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  async function registerResend() {
    loading = true;
    authMessage = '';
    try {
      await composerAuth('register-resend', { email, password });
      authMessage = 'Verification code resent.';
    } catch (error) {
      authMessage = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  async function registerVerify() {
    loading = true;
    authMessage = '';
    try {
      const session = await composerAuth('register-verify', { email, password, code: verifyCode });
      applyPrefs(session.prefs);
      rememberSession(session.sessionToken, session.expiresAt);
      awaitingVerification = false;
      await loadDesigns(session.prefs?.activeDesignId, true);
      password = '';
      repeatPassword = '';
      verifyCode = '';
      authMessage = 'Registered and logged in.';
      markDesignClean();
      prefsReady = true;
    } catch (error) {
      authMessage = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  async function loadDesigns(preferredDesignId?: string | null, showList = false) {
    if (!sessionToken) return;
    loading = true;
    try {
      const rows = await listDesignsBySession(sessionToken);
      designs = (rows || []).map((row) => repairDesign(row.json_spec || row.design || row)).filter(Boolean);
      if (designs.length > 0) {
        activeDesign = designs.find((design) => design.id === preferredDesignId) || designs[0];
        selectedId = 'form';
        showingDesignList = showList;
        syncJson();
        markDesignClean();
      } else {
        showingDesignList = true;
        activeDesign = newDesign();
        syncJson();
        markDesignClean();
      }
    } catch (error) {
      statusMessage = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  async function persistDesign(isAutoSave = false) {
    if (designSaveTimer) {
      window.clearTimeout(designSaveTimer);
      designSaveTimer = null;
    }
    if (devComposerBypass && !sessionToken) {
      activeDesign = { ...activeDesign, savedAt: new Date().toISOString() };
      syncJson();
      markDesignClean();
      return;
    }
    if (!sessionToken) {
      statusMessage = 'Log in before saving.';
      return;
    }
    try {
      activeDesign = repairDesign(JSON.parse(jsonText));
    } catch (error) {
      jsonError = error instanceof Error ? error.message : String(error);
      return;
    }
    savingDesign = true;
    try {
      await saveDesign({ sessionToken, design: activeDesign });
      markDesignClean();
      await loadDesigns(activeDesign.id, false);
    } catch (error) {
      statusMessage = error instanceof Error ? error.message : String(error);
    } finally {
      savingDesign = false;
    }
  }

  async function removeDesign() {
    if (!sessionToken) return;
    if (!confirm('Delete form?')) return;
    loading = true;
    try {
      await deleteDesign({ sessionToken, designId: activeDesign.id, publicId: activeDesign.publicId });
      beginNewDesign();
      await loadDesigns(null, true);
      statusMessage = 'Design deleted.';
    } catch (error) {
      statusMessage = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  async function logout() {
    if (sessionToken && lastSavedDesignSignature && JSON.stringify(activeDesign) !== lastSavedDesignSignature) {
      await persistDesign(true);
    }
    clearSession();
    prefsReady = false;
    lastSavedDesignSignature = '';
    designs = [];
    email = '';
    password = '';
    repeatPassword = '';
    verifyCode = '';
    awaitingVerification = false;
    activeDesign = newDesign();
    selectedId = 'form';
    showingDesignList = false;
    syncJson();
    statusMessage = 'Logged out.';
  }

  function handlePreviewSelect(event: MouseEvent, id: string) {
    event.stopPropagation();
    if (!isReadOnlyPreview) {
      selectedId = id;
      selectedSeparator = null;
      selectedTableTarget = null;
      if (showAllPurpleBoxes) showAllPurpleBoxes = false;
    }
  }

  function isSelectionShown(
    component: ComposerComponent,
    currentSelectedId = selectedId,
    showAll = showAllPurpleBoxes,
    showSelected = showSelectedPurpleBoxes,
  ) {
    return showAll || (showSelected && currentSelectedId === component.id);
  }

  function controlLabel(component: ComposerComponent) {
    return component.label || component.text || component.key || component.type;
  }

  function copyPublicUrl() {
    void navigator.clipboard?.writeText(publicUrl);
    statusMessage = 'Public URL copied.';
  }

  function setPreviewValue(id: string, value: string) {
    previewValues = { ...previewValues, [id]: value };
  }

  function supportsDefaultValue(component: ComposerComponent) {
    return questionTypes.includes(component.type) && component.type !== 'fbGroup';
  }

  function supportsPlaceholder(component: ComposerComponent) {
    return ['fbTextInput', 'fbTime', 'fbTextArea'].includes(component.type);
  }

  function supportsAcceptUncoded(component: ComposerComponent) {
    return ['fbMSISelector', 'fbSCTProcedure', 'fbSCTDiagnosis'].includes(component.type);
  }
</script>

{#snippet requiredMark(component: ComposerComponent)}
  {#if component.requiredForAudit}<span class="required-for-audit">RfA</span>{/if}
  {#if component.required}<span class="required">*</span>{/if}
{/snippet}

{#snippet editableLabel(component: ComposerComponent)}
  {#if component.label}
    <div
      class="preview-label"
      contenteditable={!isReadOnlyPreview}
      suppressContentEditableWarning
      role="textbox"
      tabindex="0"
      onblur={(event) => updateComponent(component.id, { label: event.currentTarget.textContent?.trim() || component.label })}
      onclick={(event) => handlePreviewSelect(event, component.id)}
      onkeydown={(event) => { if (event.key === 'Escape') (event.currentTarget as HTMLElement).blur(); }}
    >{component.label}{@render requiredMark(component)}</div>
  {/if}
{/snippet}

{#snippet tableTemplateLabel(template: ComposerComponent, tableId: string, columnIndex: number, rowIndex: number)}
  {#if template.label}
    <div
      class="preview-label"
      contenteditable={!isReadOnlyPreview}
      role="textbox"
      tabindex="0"
      onblur={(event) => updateTableCellTemplate(tableId, columnIndex, { label: event.currentTarget.textContent?.trim() || template.label })}
      onclick={(event) => { event.stopPropagation(); selectTableCell(tableId, rowIndex, columnIndex); }}
      onfocus={() => { if (!isReadOnlyPreview) selectTableCell(tableId, rowIndex, columnIndex); }}
      onkeydown={(event) => { if (event.key === 'Escape') (event.currentTarget as HTMLElement).blur(); }}
    >{template.label}{@render requiredMark(template)}</div>
  {/if}
{/snippet}

{#snippet renderTableCellTemplate(template: ComposerComponent, tableId: string, columnIndex: number, rowIndex: number)}
  {@const previewId = `${template.id}-${rowIndex}`}
  <div class="preview-table-cell-template">
    {#if template.type === 'fbRadio'}
      <label class="preview-choice fb-radio-checkbox-item"><input type="radio" name={`${tableId}-${columnIndex}-${rowIndex}`} disabled={isReadOnlyPreview} /> <span>{controlLabel(template)}</span>{@render requiredMark(template)}</label>
    {:else if template.type === 'fbCheck'}
      <label class="preview-choice fb-radio-checkbox-item"><input type="checkbox" disabled={isReadOnlyPreview} /> <span>{controlLabel(template)}</span>{@render requiredMark(template)}</label>
    {:else if template.type === 'fbTextArea'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <FbTextArea
        id={previewId}
        name={template.key || previewId}
        placeholder={template.placeholder || ''}
        value={previewValues[previewId] ?? template.defaultValue ?? ''}
        fullWidth={template.fullWidth}
        readonly={isReadOnlyPreview}
        onChange={(value) => setPreviewValue(previewId, value)}
      />
    {:else if template.type === 'fbDropdown'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <select value={previewValues[previewId] ?? template.defaultValue ?? ''} disabled={isReadOnlyPreview} onchange={(event) => setPreviewValue(previewId, event.currentTarget.value)}>
        {#each template.options || [] as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {:else if template.type === 'fbNumberInput' || template.type === 'fbNumberInputWithUnits'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <FbNumberInput
        id={previewId}
        name={template.key || previewId}
        value={previewValues[previewId] ?? template.defaultValue ?? ''}
        units={template.type === 'fbNumberInputWithUnits' ? template.units || 'units' : ''}
        placeholder={template.placeholder || ''}
        readonly={isReadOnlyPreview}
        subfield
        onChange={(value) => setPreviewValue(previewId, value)}
        unitEditable={template.type === 'fbNumberInputWithUnits' && !isReadOnlyPreview}
        onUnitClick={(event) => event.stopPropagation()}
        onUnitBlur={(value) => updateTableCellTemplate(tableId, columnIndex, { units: value })}
      />
    {:else if template.type === 'fbDateExact' || template.type === 'fbDatePartial'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <input type="text" placeholder={template.type === 'fbDateExact' ? 'dd-Mmm-yyyy' : 'Month yyyy'} value={previewValues[previewId] ?? template.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(previewId, event.currentTarget.value)} />
    {:else if template.type === 'fbTime'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <input type="time" value={previewValues[previewId] ?? template.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(previewId, event.currentTarget.value)} />
    {:else if template.type === 'fbMSISelector' || template.type === 'fbSCTProcedure' || template.type === 'fbSCTDiagnosis'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <div class="preview-selector">
        <input type="text" placeholder={template.placeholder || typeLabels[template.type] || template.type} value={previewValues[previewId] ?? template.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(previewId, event.currentTarget.value)} />
        <span class="material-icons" aria-hidden="true">warning</span>
      </div>
    {:else if template.type === 'fbBoxedInfo' || template.type === 'fbBoxedWarning' || template.type === 'fbBoxedAlert'}
      <div class="preview-boxed" class:info={template.type === 'fbBoxedInfo'} class:warning={template.type === 'fbBoxedWarning'} class:alert={template.type === 'fbBoxedAlert'}>
        <span class="material-icons" aria-hidden="true">{template.type === 'fbBoxedInfo' ? 'info' : template.type === 'fbBoxedWarning' ? 'warning' : 'error'}</span>
        <span
          contenteditable={!isReadOnlyPreview}
          onblur={(event) => updateTableCellTemplate(tableId, columnIndex, { text: event.currentTarget.textContent?.trim() || template.text })}
        >{template.text || template.label}</span>
    </div>
    {:else if template.type === 'fbBloodPressure'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <div class="preview-blood-pressure">
        <div class="bp-numbers"><input type="number" readonly={isReadOnlyPreview} /><span></span><input type="number" readonly={isReadOnlyPreview} /></div>
        <div>mmHg</div>
    </div>
    {:else if template.type === 'fbTextInput'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <FbTextInput
        id={previewId}
        name={template.key || previewId}
        placeholder={template.placeholder || ''}
        value={previewValues[previewId] ?? template.defaultValue ?? ''}
        subfield
        readonly={isReadOnlyPreview}
        required={false}
        onChange={(value) => setPreviewValue(previewId, value)}
      />
    {:else}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <input type="text" placeholder={template.placeholder || ''} value={previewValues[previewId] ?? template.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(previewId, event.currentTarget.value)} />
    {/if}
  </div>
{/snippet}

{#snippet renderChildren(component: ComposerComponent)}
  {#if component.children?.length}
    <div class="preview-children" class:grid-row={component.type === 'fbGridRow'} class:grid-cell={component.type === 'fbGridCell'}>
      {@render renderStackedChildren(component.id, component.children)}
    </div>
  {:else if greenBarsVisible && ['fbSection', 'fbGridCell', 'fbRadio', 'fbCheck'].includes(component.type)}
    {@render renderSeparator({ id: `${component.id}-separator-0`, parentId: component.id, index: 0, orientation: 'wide', fullSize: true })}
  {/if}
{/snippet}

{#snippet renderSeparator(target: SeparatorTarget)}
  <div
    class="fb-composer-separator"
    class:tall={target.orientation === 'tall' || target.orientation === 'tallForSingle'}
    class:full-size={target.fullSize}
    class:selected={selectedSeparator?.id === target.id}
    role="button"
    tabindex="0"
    aria-label="Component drop target"
    onclick={(event) => {
      event.stopPropagation();
      selectedId = target.id;
      selectedSeparator = target;
    }}
    onkeydown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedId = target.id;
        selectedSeparator = target;
      }
    }}
    ondragover={(event) => {
      if (draggedId) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = canDropOnSeparator(target) ? 'move' : 'none';
      }
    }}
    ondrop={(event) => {
      event.preventDefault();
      event.stopPropagation();
      moveDraggedToSeparator(target);
    }}
    onmouseup={(event) => {
      if (draggedId) {
        event.preventDefault();
        event.stopPropagation();
        moveDraggedToSeparator(target);
      }
    }}
  ></div>
{/snippet}

{#snippet renderSingleQuestionWithTallSeparators(parentId: string, child: ComposerComponent, index: number)}
  <div class="fb-composer-single-question-separators">
    {@render renderSeparator({ id: `${parentId}-single-left-${child.id}`, parentId, index, orientation: 'tallForSingle' })}
    {@render renderComponent(child)}
    {@render renderSeparator({ id: `${parentId}-single-right-${child.id}`, parentId, index: index + 1, orientation: 'tallForSingle' })}
  </div>
{/snippet}

{#snippet renderStackedChildren(parentId: string, children: ComposerComponent[])}
  {#if !greenBarsVisible}
    {#each children as child (child.id)}
      {@render renderComponent(child)}
    {/each}
  {:else if children.length === 0}
    {@render renderSeparator({ id: `${parentId}-separator-0`, parentId, index: 0, orientation: 'wide', fullSize: true })}
  {:else}
    {#each children as child, index (child.id)}
      {@render renderSeparator({ id: `${parentId}-separator-${index}`, parentId, index, orientation: 'wide' })}
      {#if questionTypes.includes(child.type) && (parentId === 'form' || findComponent(activeDesign.components, parentId)?.type === 'fbSection')}
        {@render renderSingleQuestionWithTallSeparators(parentId, child, index)}
      {:else}
        {@render renderComponent(child)}
      {/if}
    {/each}
    {@render renderSeparator({ id: `${parentId}-separator-${children.length}`, parentId, index: children.length, orientation: 'wide' })}
  {/if}
{/snippet}

{#snippet renderRowChildren(row: ComposerComponent)}
  {@const children = row.children || []}
  {#if !greenBarsVisible}
    {#each children as child (child.id)}
      {@render renderComponent(child, row)}
    {/each}
  {:else if children.length === 0}
    {@render renderSeparator({ id: `${row.id}-separator-0`, parentId: row.id, index: 0, orientation: 'wide', fullSize: true })}
  {:else}
    {#each children as child, index (child.id)}
      {@render renderSeparator({ id: `${row.id}-separator-${index}`, parentId: row.id, index, orientation: 'tall' })}
      {@render renderComponent(child, row)}
    {/each}
    {@render renderSeparator({ id: `${row.id}-separator-${children.length}`, parentId: row.id, index: children.length, orientation: 'tall' })}
  {/if}
{/snippet}

{#snippet renderComponent(component: ComposerComponent, rowContext: ComposerComponent | null = null)}
  <FbToolTip
    text={component.tooltip || ''}
    as="div"
    className={previewComponentClass(component, selectedId, showAllPurpleBoxes, showSelectedPurpleBoxes, greenBarsVisible, isReadOnlyPreview)}
    style={component.type === 'fbGridCell' ? previewGridCellStyle(component, rowContext) : ''}
    role="button"
    tabindex="0"
    ariaLabel={component.label || component.text || typeLabels[component.type] || component.type}
    onClick={(event) => handlePreviewSelect(event, component.id)}
    onKeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectedId = component.id; } }}
  >
    {#if isSelectionShown(component, selectedId, showAllPurpleBoxes, showSelectedPurpleBoxes) && greenBarsVisible}
      <span
        class="purple-handle"
        aria-hidden="true"
        draggable="true"
        onmousedown={(event) => {
          event.stopPropagation();
          draggedId = component.id;
        }}
        ondragstart={(event) => {
          event.stopPropagation();
          draggedId = component.id;
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', component.id);
        }}
        ondragend={() => (draggedId = null)}
      ></span>
    {/if}

    {#if component.type === 'fbSection'}
      <section class="preview-section">
        <h2
          contenteditable={!isReadOnlyPreview}
          suppressContentEditableWarning
          onblur={(event) => updateComponent(component.id, { label: event.currentTarget.textContent?.trim() || component.label })}
        >{component.label || 'Section'}</h2>
        {@render renderChildren(component)}
      </section>
    {:else if component.type === 'fbGridRow'}
      <div class="preview-grid-row">
        {@render renderRowChildren(component)}
      </div>
    {:else if component.type === 'fbGridCell'}
      <div class="preview-grid-cell">{@render renderChildren(component)}</div>
    {:else if component.type === 'fbTable'}
      {@render editableLabel(component)}
      {@const columns = tableColumns(component)}
      {@const rows = tableRows(component)}
      {@const templates = normaliseTableTemplates(component)}
      {@const selectedHeaderIndex = selectedTableTarget?.kind === 'header' && selectedTableTarget.tableId === component.id ? selectedTableTarget.columnIndex : -1}
      {@const selectedRowIndex = selectedTableTarget?.kind === 'row' && selectedTableTarget.tableId === component.id ? selectedTableTarget.rowIndex : -1}
      {@const selectedSeparatorIndex = selectedTableTarget?.kind === 'separator' && selectedTableTarget.tableId === component.id ? selectedTableTarget.separatorIndex : -1}
      <div class="preview-table-wrap">
        <FbTable className="preview-table" style={component.useFullWidth === false ? 'width: auto;' : 'width: 100%;'}>
          <FbTableHeader>
            <FbTableRow>
              {#if component.includeDragHandles}<FbTableHeaderCell width="2rem" aria-label="Row drag handles" />{/if}
              {#if greenBarsVisible}
                <FbTableHeaderCell
                  className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === 0 ? 'fb-composer-table-selected' : ''}`}
                  style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                  aria-label="Column drop target before first column"
                  onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, 0); }}
                  ondragover={(event) => { if (draggedTableColumn?.tableId === component.id) event.preventDefault(); }}
                  ondrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedTableColumn?.tableId === component.id) moveTableColumnToSeparator(component.id, draggedTableColumn.columnIndex, 0); draggedTableColumn = null; }}
                ><span class="fbSeparatorTall"></span></FbTableHeaderCell>
              {/if}
              {#each columns as column, index (column.id)}
                {#if greenBarsVisible && index > 0}
                  <FbTableHeaderCell
                    className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === index ? 'fb-composer-table-selected' : ''}`}
                    style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                    aria-label={`Column drop target ${index}`}
                    onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, index); }}
                    ondragover={(event) => { if (draggedTableColumn?.tableId === component.id) event.preventDefault(); }}
                    ondrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedTableColumn?.tableId === component.id) moveTableColumnToSeparator(component.id, draggedTableColumn.columnIndex, index); draggedTableColumn = null; }}
                  ><span class="fbSeparatorTall"></span></FbTableHeaderCell>
                {/if}
                <FbTableHeaderCell
                  className={selectedHeaderIndex === index ? 'fb-composer-table-selected' : ''}
                  onclick={(event) => { event.stopPropagation(); selectTableHeader(component.id, index); }}
                >
                  <div class="fb-composer-table-column-header-content">
                    {#if selectedHeaderIndex === index && greenBarsVisible && columns.length > 1}
                      <button
                        type="button"
                        class="fb-composer-table-column-drag-handle"
                        aria-label={`Drag column ${index + 1}`}
                        title="Drag column"
                        draggable="true"
                        onclick={(event) => event.stopPropagation()}
                        ondragstart={(event) => {
                          event.stopPropagation();
                          draggedTableColumn = { tableId: component.id, columnIndex: index };
                          event.dataTransfer?.setData('text/composer-table-column', String(index));
                        }}
                        ondragend={() => (draggedTableColumn = null)}
                      ></button>
                    {/if}
                    <span
                      contenteditable={!isReadOnlyPreview}
                      suppressContentEditableWarning
                      onblur={(event) => updateTableColumnLabel(component.id, index, event.currentTarget.textContent || column.label)}
                    >{column.label}</span>
                  </div>
                </FbTableHeaderCell>
              {/each}
              {#if greenBarsVisible}
                <FbTableHeaderCell
                  className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === columns.length ? 'fb-composer-table-selected' : ''}`}
                  style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                  aria-label="Column drop target after last column"
                  onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, columns.length); }}
                  ondragover={(event) => { if (draggedTableColumn?.tableId === component.id) event.preventDefault(); }}
                  ondrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedTableColumn?.tableId === component.id) moveTableColumnToSeparator(component.id, draggedTableColumn.columnIndex, columns.length); draggedTableColumn = null; }}
                ><span class="fbSeparatorTall"></span></FbTableHeaderCell>
              {/if}
              {#if component.includeRowDeleteButtons}<FbTableHeaderCell width="2rem" aria-label="Row delete buttons" />{/if}
            </FbTableRow>
          </FbTableHeader>
          <FbTableBody>
          {#if component.requireAtLeastOneRow}
            <FbTableRow><FbTableCell className="fb-table-required-row" style="color: #d50000; font-size: 0.8rem; font-style: italic; font-weight: 500;" colspan={columns.length + (component.includeDragHandles ? 1 : 0) + (component.includeRowDeleteButtons ? 1 : 0) + (greenBarsVisible ? columns.length + 1 : 0)}>{component.requireAtLeastOneRowText || 'Enter at least one row'}</FbTableCell></FbTableRow>
          {/if}
          {#each rows as row, rowIndex (row.id || rowIndex)}
            <FbTableRow
              className={selectedRowIndex === rowIndex ? 'fb-composer-table-row-selected' : ''}
              draggable={!!component.includeDragHandles}
              onclick={(event) => { event.stopPropagation(); selectTableRow(component.id, rowIndex); }}
              ondragstart={(event) => {
                if (!component.includeDragHandles) return;
                draggedTableRow = { tableId: component.id, rowIndex };
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/composer-table-row', `${component.id}:${rowIndex}`);
              }}
              ondragover={(event) => {
                if (draggedTableRow?.tableId === component.id) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }
              }}
              ondrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (draggedTableRow?.tableId === component.id) moveTableRow(component.id, draggedTableRow.rowIndex, rowIndex);
                draggedTableRow = null;
              }}
              ondragend={() => (draggedTableRow = null)}
            >
              {#if component.includeDragHandles}<FbTableCell width="2rem" style="text-align: center;"><span class="material-icons table-drag-icon" aria-hidden="true" title="Drag up or down to order list">swap_vertical_circle</span></FbTableCell>{/if}
              {#if greenBarsVisible}
                <FbTableCell
                  className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === 0 ? 'fb-composer-table-selected' : ''}`}
                  style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                  aria-label="Column drop target before first column"
                  onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, 0); }}
                  ondragover={(event) => { if (draggedTableColumn?.tableId === component.id) event.preventDefault(); }}
                  ondrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedTableColumn?.tableId === component.id) moveTableColumnToSeparator(component.id, draggedTableColumn.columnIndex, 0); draggedTableColumn = null; }}
                ><span class="fbSeparatorTall"></span></FbTableCell>
              {/if}
              {#each columns as column, columnIndex (column.id)}
                {#if greenBarsVisible && columnIndex > 0}
                  <FbTableCell
                    className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === columnIndex ? 'fb-composer-table-selected' : ''}`}
                    style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                    aria-label={`Column drop target ${columnIndex}`}
                    onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, columnIndex); }}
                    ondragover={(event) => { if (draggedTableColumn?.tableId === component.id) event.preventDefault(); }}
                    ondrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedTableColumn?.tableId === component.id) moveTableColumnToSeparator(component.id, draggedTableColumn.columnIndex, columnIndex); draggedTableColumn = null; }}
                  ><span class="fbSeparatorTall"></span></FbTableCell>
                {/if}
                <FbTableCell
                  className={selectedTableTarget?.kind === 'cell' && selectedTableTarget.tableId === component.id && selectedTableTarget.rowIndex === rowIndex && selectedTableTarget.columnIndex === columnIndex ? 'fb-composer-table-selected' : ''}
                  style="min-width: 6rem;"
                  onclick={(event) => { event.stopPropagation(); selectTableCell(component.id, rowIndex, columnIndex); }}
                >
                  {#if templates[columnIndex]}
                    {@render renderTableCellTemplate(templates[columnIndex], component.id, columnIndex, rowIndex)}
                  {:else}
                    {column.label}
                  {/if}
                </FbTableCell>
              {/each}
              {#if greenBarsVisible}
                <FbTableCell
                  className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === columns.length ? 'fb-composer-table-selected' : ''}`}
                  style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                  aria-label="Column drop target after last column"
                  onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, columns.length); }}
                  ondragover={(event) => { if (draggedTableColumn?.tableId === component.id) event.preventDefault(); }}
                  ondrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedTableColumn?.tableId === component.id) moveTableColumnToSeparator(component.id, draggedTableColumn.columnIndex, columns.length); draggedTableColumn = null; }}
                ><span class="fbSeparatorTall"></span></FbTableCell>
              {/if}
              {#if component.includeRowDeleteButtons}
                <FbTableCell width="2rem" style="text-align: center;">
                  <button type="button" class="table-delete-button" aria-label="Delete row" title="Delete row" onclick={(event) => { event.stopPropagation(); deleteTableRow(component.id, rowIndex); }}>
                    <span class="material-icons" aria-hidden="true">highlight_off</span>
                  </button>
                </FbTableCell>
              {/if}
            </FbTableRow>
          {/each}
          </FbTableBody>
        </FbTable>
        {#if component.includeAddButton}<div class="preview-add-button-row"><FbAddButton label={component.addButtonLabel || 'Add row'} editable={!isReadOnlyPreview} onLabelChange={(label) => updateComponent(component.id, { addButtonLabel: label })} onClick={() => addTableRow(component.id)} /></div>{/if}
      </div>
    {:else if component.type === 'fbGroup'}
      <div class="preview-group" role="group" aria-label={component.label || 'Group'}>
        {@render editableLabel(component)}
        {#if component.children?.length}
          {@render renderStackedChildren(component.id, component.children)}
        {:else}
          {#if greenBarsVisible}
            {@render renderSeparator({ id: `${component.id}-separator-0`, parentId: component.id, index: 0, orientation: 'wide', fullSize: true })}
          {:else}
            <div class="preview-empty">Empty group</div>
          {/if}
        {/if}
      </div>
    {:else if component.type === 'fbRadio'}
      <label class="preview-choice fb-radio-checkbox-item"><input type="radio" name={selectedParent?.id || component.id} checked={component.defaultValue === 'checked'} disabled={isReadOnlyPreview} onchange={(event) => updateComponent(component.id, { defaultValue: event.currentTarget.checked ? 'checked' : '' })} /> <span>{controlLabel(component)}</span>{@render requiredMark(component)}</label>
      {@render renderChildren(component)}
    {:else if component.type === 'fbCheck'}
      <label class="preview-choice fb-radio-checkbox-item"><input type="checkbox" checked={component.defaultValue === 'checked'} disabled={isReadOnlyPreview} onchange={(event) => updateComponent(component.id, { defaultValue: event.currentTarget.checked ? 'checked' : '' })} /> <span>{controlLabel(component)}</span>{@render requiredMark(component)}</label>
      {@render renderChildren(component)}
    {:else if component.type === 'fbInverseSubq'}
      <div class="preview-inverse-subq fb-subquestion">
        {@render editableLabel(component)}
        {@render renderChildren(component)}
      </div>
    {:else if component.type === 'fbSubqForOption'}
      <div class="preview-subq-for-option fb-subquestion">
        {@render editableLabel(component)}
        {@render renderChildren(component)}
      </div>
    {:else if component.type === 'fbTextArea'}
      {@render editableLabel(component)}
      <FbTextArea
        id={component.id}
        name={component.key || component.id}
        placeholder={component.placeholder || ''}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        fullWidth={component.fullWidth}
        readonly={isReadOnlyPreview}
        onChange={(value) => setPreviewValue(component.id, value)}
      />
    {:else if component.type === 'fbTextInput'}
      {@render editableLabel(component)}
      <FbTextInput
        id={component.id}
        name={component.key || component.id}
        placeholder={component.placeholder || ''}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        required={false}
        readonly={isReadOnlyPreview}
        subfield
        onChange={(value) => setPreviewValue(component.id, value)}
      />
    {:else if component.type === 'fbDropdown'}
      {@render editableLabel(component)}
      <select value={previewValues[component.id] ?? component.defaultValue ?? ''} disabled={isReadOnlyPreview} onchange={(event) => setPreviewValue(component.id, event.currentTarget.value)}>
        {#each component.options || [] as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      {@render renderChildren(component)}
    {:else if component.type === 'fbSmartDropdown'}
      <FbSmartDropdown
        label={component.label || ''}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        options={component.options || []}
        placeholder={component.placeholder || 'Type here to search'}
        fullWidth={component.fullWidth}
        noWidthConstraint={component.noWidthConstraint}
        onChange={(value) => setPreviewValue(component.id, value)}
      />
      {@render renderChildren(component)}
    {:else if component.type === 'fbDateHeightWeightBMIRow'}
      <FbDateHeightWeightBMIRow
        dateRecorded={previewValues[`${component.id}-dateRecorded`] || ''}
        heightCm={previewValues[`${component.id}-heightCm`] || ''}
        weightKg={previewValues[`${component.id}-weightKg`] || ''}
        onDateRecordedChange={(value) => setPreviewValue(`${component.id}-dateRecorded`, value)}
        onHeightCmChange={(value) => setPreviewValue(`${component.id}-heightCm`, value)}
        onWeightKgChange={(value) => setPreviewValue(`${component.id}-weightKg`, value)}
      />
    {:else if component.type === 'fbNotificationTypeGroup'}
      <FbNotificationTypeGroup
        value={previewValues[component.id] ?? component.defaultValue ?? 'routine'}
        onChange={(value) => setPreviewValue(component.id, value)}
        subfield
      />
    {:else if component.type === 'fbNumberInput' || component.type === 'fbNumberInputWithUnits'}
      {@render editableLabel(component)}
      <FbNumberInput
        id={component.id}
        name={component.key || component.id}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        units={component.type === 'fbNumberInputWithUnits' ? component.units || 'units' : ''}
        placeholder={component.placeholder || ''}
        required={component.required}
        readonly={isReadOnlyPreview}
        subfield
        onChange={(value) => setPreviewValue(component.id, value)}
        unitEditable={component.type === 'fbNumberInputWithUnits' && !isReadOnlyPreview}
        onUnitClick={(event) => {
          event.stopPropagation();
          handlePreviewSelect(event, component.id);
        }}
        onUnitFocus={() => {
          if (!isReadOnlyPreview) selectedId = component.id;
        }}
        onUnitBlur={(value) => updateComponent(component.id, { units: value })}
      />
    {:else if component.type === 'fbDateExact' || component.type === 'fbDatePartial'}
      {@render editableLabel(component)}
      <input type="text" placeholder={component.type === 'fbDateExact' ? 'dd-Mmm-yyyy' : 'Month yyyy'} value={previewValues[component.id] ?? component.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(component.id, event.currentTarget.value)} />
    {:else if component.type === 'fbTime'}
      {@render editableLabel(component)}
      <input type="time" value={previewValues[component.id] ?? component.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(component.id, event.currentTarget.value)} />
    {:else if component.type === 'fbMSISelector' || component.type === 'fbSCTProcedure' || component.type === 'fbSCTDiagnosis'}
      {@render editableLabel(component)}
      <div class="preview-selector">
        <input type="text" placeholder={component.placeholder || typeLabels[component.type] || component.type} value={previewValues[component.id] ?? component.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(component.id, event.currentTarget.value)} />
        <span class="material-icons" aria-hidden="true">warning</span>
      </div>
    {:else if component.type === 'fbBoxedInfo' || component.type === 'fbBoxedWarning' || component.type === 'fbBoxedAlert'}
      <div
        class="preview-boxed"
        class:info={component.type === 'fbBoxedInfo'}
        class:warning={component.type === 'fbBoxedWarning'}
        class:alert={component.type === 'fbBoxedAlert'}
      >
        <span class="material-icons" aria-hidden="true">{component.type === 'fbBoxedInfo' ? 'info' : component.type === 'fbBoxedWarning' ? 'warning' : 'error'}</span>
        <span
          contenteditable={!isReadOnlyPreview}
          suppressContentEditableWarning
          onblur={(event) => updateComponent(component.id, { text: event.currentTarget.textContent?.trim() || component.text })}
        >{component.text || component.label}</span>
      </div>
    {:else if component.type === 'fbBloodPressure'}
      {@render editableLabel(component)}
      <div class="preview-blood-pressure">
        <div class="bp-numbers"><input type="number" readonly={isReadOnlyPreview} /><span></span><input type="number" readonly={isReadOnlyPreview} /></div>
        <div>mmHg</div>
      </div>
    {:else}
      {@render editableLabel(component)}
      <input type="text" placeholder={component.placeholder || ''} value={previewValues[component.id] ?? component.defaultValue ?? ''} readonly={isReadOnlyPreview} oninput={(event) => setPreviewValue(component.id, event.currentTarget.value)} />
    {/if}
  </FbToolTip>
{/snippet}

<main class="svelte-composer-shell">
  {#if !composerReady}
    <section class="svelte-composer-body composer-startup-blank" aria-label="Composer loading" aria-busy="true"></section>
  {:else}
  <section class="svelte-composer-body">
    {#if !composerUnlocked || showingDesignList}
      <section class="composer-preview-panel composer-preview-panel-blank" aria-label="Form preview"></section>
    {:else}
      <section class="composer-preview-panel" aria-label="Form preview">
        <div class="composer-preview-header">
          <h1
            class:form-selected-title={selectedId === 'form' && showSelectedPurpleBoxes}
            contenteditable={!isReadOnlyPreview}
            suppressContentEditableWarning
            onclick={() => (selectedId = 'form')}
            onkeydown={(event) => { if (event.key === 'Escape') (event.currentTarget as HTMLElement).blur(); }}
            onblur={(event) => { activeDesign = { ...activeDesign, title: event.currentTarget.textContent?.trim() || activeDesign.title }; syncJson(); }}
          >{activeDesign.title}</h1>
          <div class="composer-preview-addressograph">
            <FbAddressograph />
          </div>
        </div>
        <div class="composer-preview-workspace">
          <nav class="composer-preview-nav" aria-label="Form sections">
            {#if composerNavItems.length}
              <FbLayoutNav items={composerNavItems} />
            {:else}
              <div class="composer-preview-nav-empty">No sections</div>
            {/if}
          </nav>
          <div
            class="composer-form-preview"
            class:form-selected={selectedId === 'form' && showSelectedPurpleBoxes}
            role="button"
            tabindex="0"
            onclick={() => { if (!isReadOnlyPreview) { selectedId = 'form'; selectedSeparator = null; } }}
            onkeydown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !isReadOnlyPreview) { event.preventDefault(); selectedId = 'form'; selectedSeparator = null; } }}
          >
            {#if activeDesign.components.length || greenBarsVisible}
              {@render renderStackedChildren('form', activeDesign.components)}
            {:else}
              <button type="button" class="empty-preview" onclick={(event) => { event.stopPropagation(); addComponent('fbSection', 'form'); }}>
                Add the first section
              </button>
            {/if}
          </div>
        </div>
        <div class="composer-preview-bottom-bar">
          <button type="button" class="fb-button fb-bottom-control-btn-rov" onclick={() => (isReadOnlyPreview = !isReadOnlyPreview)}>{isReadOnlyPreview ? 'EV' : 'RoV'}</button>
        </div>
      </section>
    {/if}

      <FbcPanel>
        <div slot="header">
          <div class="panel-title">formBuilder2</div>
          <hr class="panel-header-rule" />
          {#if composerUnlocked}
            <FbcBreadcrumbs>
              {#each breadcrumbItems as part, index}
                {#if index > 0}<span class="breadcrumb-separator"> &gt; </span>{/if}
                <button
                  type="button"
                  onclick={() => {
                    if (index === 0) {
                      showDesignList();
                    } else {
                      showingDesignList = false;
                      selectedId = part.id;
                      if (showAllPurpleBoxes) showAllPurpleBoxes = false;
                    }
                  }}
                >
                  {part.label}
                </button>
              {/each}
            </FbcBreadcrumbs>
            {#if !showingDesignList}
              <FbcOptions>
                <label><FbcpCheck checked={showRowsAndCellsInBreadcrumbs} onChange={(checked) => (showRowsAndCellsInBreadcrumbs = checked)} /> Show rows and cells in breadcrumbs</label>
                <label><FbcpCheck checked={showSelectedPurpleBoxes} onChange={(checked) => { showSelectedPurpleBoxes = checked; if (checked) showAllPurpleBoxes = false; }} /> Show selected purple boxes</label>
                <label><FbcpCheck checked={showAllPurpleBoxes} onChange={(checked) => { showAllPurpleBoxes = checked; if (checked) showSelectedPurpleBoxes = false; }} /> Show all purple boxes</label>
                <label><FbcpCheck checked={showGreenBars} onChange={(checked) => (showGreenBars = checked)} /> Show green bars</label>
              </FbcOptions>
            {/if}
          {/if}
        </div>

        <div slot="properties">
          <FbcProperties>
            <section class="right-section">
              {#if !composerUnlocked}
                <div class="composer-auth-panel">
                  <div class="auth-mode" role="radiogroup" aria-label="Authentication mode">
                    <label><input type="radio" bind:group={authMode} value="login" onchange={() => { showPassword = false; awaitingVerification = false; authMessage = ''; }} /> Login</label>
                    <label><input type="radio" bind:group={authMode} value="register" onchange={() => { showPassword = false; awaitingVerification = false; authMessage = ''; }} /> Register</label>
                  </div>
                  {#if authMode === 'login'}
                    <form
                      onsubmit={(event) => {
                        event.preventDefault();
                        login();
                      }}
                    >
                      <label for="composer-login-email">Email address</label>
                      <input id="composer-login-email" type="email" bind:value={email} autocomplete="username" class="composer-auth-input-spaced" />
                      <label for="composer-login-password">Password</label>
                      <div class="composer-password-field">
                        <input id="composer-login-password" type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="current-password" />
                        <button type="button" aria-label="Show password" onclick={() => (showPassword = !showPassword)}>
                          <span class="material-icons" aria-hidden="true">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                      <label class="composer-check"><input type="checkbox" bind:checked={remember} /> Remember me</label>
                      <FbcButton type="submit" disabled={loading}>Login</FbcButton>
                    </form>
                  {:else if awaitingVerification}
                    <form
                      onsubmit={(event) => {
                        event.preventDefault();
                        registerVerify();
                      }}
                    >
                      <p>formBuilder2 has sent a verification code. Check your inbox and junk. Copy the code into the box. Verification codes are valid for ten minutes.</p>
                      <label for="composer-verification-code">Enter code</label>
                      <input id="composer-verification-code" type="text" bind:value={verifyCode} inputmode="numeric" maxlength="6" class="composer-auth-input-spaced" />
                      <div class="composer-auth-button-row">
                        <FbcButton type="submit" disabled={loading}>Verify</FbcButton>
                        <FbcButton type="button" onClick={registerResend} disabled={loading}>Resend code</FbcButton>
                        <FbcButton type="button" onClick={() => { awaitingVerification = false; verifyCode = ''; authMessage = ''; }} disabled={loading}>Cancel</FbcButton>
                      </div>
                    </form>
                  {:else}
                    <form
                      onsubmit={(event) => {
                        event.preventDefault();
                        registerStart();
                      }}
                    >
                      <label for="composer-register-email">Email address</label>
                      <input id="composer-register-email" type="email" bind:value={email} autocomplete="username" class="composer-auth-input-spaced" />
                      <p class="composer-password-warning">Passwords must be 12 characters or longer. Do NOT use your NADEX password. Do NOT re-use another password. There is no automatic password recovery or reset.</p>
                      <label for="composer-register-password">Password</label>
                      <div class="composer-password-field">
                        <input id="composer-register-password" type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="new-password" />
                        <button type="button" aria-label="Show password" onclick={() => (showPassword = !showPassword)}>
                          <span class="material-icons" aria-hidden="true">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                      <label for="composer-repeat-password">Repeat password</label>
                      <div class="composer-password-field">
                        <input id="composer-repeat-password" type={showPassword ? 'text' : 'password'} bind:value={repeatPassword} autocomplete="new-password" />
                        <button type="button" aria-label="Show password" onclick={() => (showPassword = !showPassword)}>
                          <span class="material-icons" aria-hidden="true">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                      <FbcButton type="submit" disabled={loading}>Register</FbcButton>
                    </form>
                  {/if}
                  {#if authMessage}<p class="composer-auth-message">{authMessage}</p>{/if}
                </div>
              {:else if showingDesignList}
                <div class="composer-design-list">
                  <h2>Forms</h2>
                  {#if designs.length}
                    <ul>
                      {#each designs as design (design.id)}
                        <li><button type="button" class="composer-design-link" onclick={() => openDesign(design)}>{design.title || 'Untitled form'}</button></li>
                      {/each}
                    </ul>
                  {:else}
                    <p>No saved forms.</p>
                  {/if}
                  <FbcButton type="button" onClick={beginNewDesign}>New form</FbcButton>
                </div>
              {:else if propertyComponent}
                <table class="fb-designer-property-grid">
                  <tbody>
                    <tr><th scope="row">Type</th><td><FbcpDropdown value={propertyComponent.type} options={paletteTypes.map((type) => ({ value: type, label: typeLabels[type] || type }))} onChange={(value) => updatePropertyComponent({ type: value, label: propertyComponent.label || componentLabel(value) })} /></td></tr>
                    <tr><th scope="row">{propertyComponent.type.startsWith('fbBoxed') ? 'Text' : 'Label'}</th><td><FbcpTextarea value={selectedLabel} onInput={updateSelectedText} /></td></tr>
                    <tr><th scope="row">Id</th><td><FbcpTextInput value={propertyComponent.id} onInput={(value) => updatePropertyComponent({ id: value })} /></td></tr>
                    {#if supportsDefaultValue(propertyComponent)}
                      <tr><th scope="row">Default value</th><td>
                        {#if propertyComponent.type === 'fbRadio' || propertyComponent.type === 'fbCheck'}
                          <FbcpCheck checked={!!propertyComponent.defaultValue} onChange={(checked) => updatePropertyComponent({ defaultValue: checked ? 'checked' : '' })} />
                        {:else}
                          <FbcpTextInput value={propertyComponent.defaultValue || ''} onInput={(value) => updatePropertyComponent({ defaultValue: value })} />
                        {/if}
                      </td></tr>
                    {/if}
                    {#if propertyComponent.type === 'fbNumberInputWithUnits'}
                      <tr><th scope="row">Units</th><td><FbcpTextInput value={propertyComponent.units || ''} onInput={(value) => updatePropertyComponent({ units: value })} /></td></tr>
                    {/if}
                    <tr><th scope="row">Required</th><td><FbcpCheck checked={!!propertyComponent.required} onChange={(checked) => updatePropertyComponent({ required: checked })} /></td></tr>
                    <tr><th scope="row">Required for audit</th><td><FbcpCheck checked={!!propertyComponent.requiredForAudit} onChange={(checked) => updatePropertyComponent({ requiredForAudit: checked })} /></td></tr>
                    {#if selectedColSpanCell && !selectedTableTemplate}
                      <tr><th scope="row">Col span</th><td><FbcpTextInput type="number" min="1" max="12" value={String(selectedColSpanCell.colSpan || 1)} onInput={(value) => updateComponent(selectedColSpanCell!.id, { colSpan: Math.min(12, Math.max(1, Number(value) || 1)) })} /></td></tr>
                    {/if}
                    <tr><th scope="row">Tooltip</th><td><FbcpTextarea value={propertyComponent.tooltip || ''} onInput={(value) => updatePropertyComponent({ tooltip: value })} /></td></tr>
                    <tr><th scope="row">Bold override</th><td><FbcpCheck checked={!!propertyComponent.boldOverride} onChange={(checked) => updatePropertyComponent({ boldOverride: checked })} /></td></tr>
                    <tr><th scope="row">Plain override</th><td><FbcpCheck checked={!!propertyComponent.plainOverride} onChange={(checked) => updatePropertyComponent({ plainOverride: checked })} /></td></tr>
                    <tr><th scope="row">Show in RoV if empty</th><td><FbcpCheck checked={!!propertyComponent.showInRoVIfEmpty} onChange={(checked) => updatePropertyComponent({ showInRoVIfEmpty: checked })} /></td></tr>
                    {#if supportsPlaceholder(propertyComponent)}
                      <tr><th scope="row">Placeholder</th><td><FbcpTextInput value={propertyComponent.placeholder || ''} onInput={(value) => updatePropertyComponent({ placeholder: value })} /></td></tr>
                    {/if}
                    {#if propertyComponent.type === 'fbTextArea'}
                      <tr><th scope="row">Full width</th><td><FbcpCheck checked={!!propertyComponent.fullWidth} onChange={(checked) => updatePropertyComponent({ fullWidth: checked })} /></td></tr>
                    {/if}
                    {#if supportsAcceptUncoded(propertyComponent)}
                      <tr><th scope="row">Accept uncoded values</th><td><FbcpCheck checked={!!propertyComponent.acceptUncodedValues} onChange={(checked) => updatePropertyComponent({ acceptUncodedValues: checked })} /></td></tr>
                    {/if}
                    <tr><th scope="row">Database column</th><td><FbcpTextInput value={propertyComponent.databaseColumn || ''} onInput={(value) => updatePropertyComponent({ databaseColumn: value })} /></td></tr>
                    {#if !selectedTableTemplate && selectedComponent?.type === 'fbTable'}
                      <tr><th scope="row">Use full width</th><td><FbcpCheck checked={!!selectedComponent.useFullWidth} onChange={(checked) => updateComponent(selectedId, { useFullWidth: checked })} /></td></tr>
                      <tr><th scope="row">Include drag handles</th><td><FbcpCheck checked={!!selectedComponent.includeDragHandles} onChange={(checked) => updateComponent(selectedId, { includeDragHandles: checked })} /></td></tr>
                      <tr><th scope="row">Include row delete buttons</th><td><FbcpCheck checked={!!selectedComponent.includeRowDeleteButtons} onChange={(checked) => updateComponent(selectedId, { includeRowDeleteButtons: checked })} /></td></tr>
                      <tr><th scope="row">Require at least one row</th><td><FbcpCheck checked={!!selectedComponent.requireAtLeastOneRow} onChange={(checked) => updateComponent(selectedId, { requireAtLeastOneRow: checked })} /></td></tr>
                      <tr><th scope="row">Required-row text</th><td><FbcpTextarea value={selectedComponent.requireAtLeastOneRowText || ''} onInput={(value) => updateComponent(selectedId, { requireAtLeastOneRowText: value })} /></td></tr>
                      <tr><th scope="row">Include add button</th><td><FbcpCheck checked={!!selectedComponent.includeAddButton} onChange={(checked) => updateComponent(selectedId, { includeAddButton: checked })} /></td></tr>
                      <tr><th scope="row">Add button label</th><td><FbcpTextInput value={selectedComponent.addButtonLabel || ''} onInput={(value) => updateComponent(selectedId, { addButtonLabel: value })} /></td></tr>
                      <tr><th scope="row">Columns</th><td><FbcpTextarea value={selectedTableColumnsText} onInput={updateSelectedTableColumns} placeholder="id|Label" /></td></tr>
                      <tr><th scope="row">Rows</th><td><FbcpTextInput type="number" min="1" max="50" value={String(Math.max(1, selectedTableRowCount || 1))} onInput={(value) => updateSelectedTableRowCount(Number(value))} /></td></tr>
                    {/if}
                    {#if propertyComponent.type === 'fbDropdown'}
                      <tr><th scope="row">Options</th><td><FbcpTextarea value={selectedOptionsText} onInput={updateSelectedOptions} placeholder="value|Label" /></td></tr>
                    {/if}
                    <tr><th scope="row">Notes</th><td><FbcpTextarea value={propertyComponent.notes || ''} onInput={(value) => updatePropertyComponent({ notes: value })} /></td></tr>
                  </tbody>
                </table>
              {:else}
                <table class="fb-designer-property-grid">
                  <tbody>
                    <tr><th scope="row">Title</th><td><FbcpTextInput value={activeDesign.title} onInput={(value) => { activeDesign = { ...activeDesign, title: value }; syncJson(); }} /></td></tr>
                    <tr><th scope="row">Public id</th><td><FbcpTextInput value={activeDesign.publicId} readonly /></td></tr>
                    <tr><th scope="row">Notes</th><td><FbcpTextarea value={activeDesign.notes || ''} onInput={(value) => { activeDesign = { ...activeDesign, notes: value }; syncJson(); }} /></td></tr>
                  </tbody>
                </table>
              {/if}
            </section>
          </FbcProperties>
        </div>

        <div slot="actions">
          {#if composerUnlocked && !showingDesignList}
            <FbcActions>
            <section class="right-section">
              <ul class="fb-designer-action-list">
                {#if selectedSeparator}
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component here</span></summary>
                      <div class="palette-grid">
                        {#each componentTypesForSeparator(selectedSeparator) as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addPaletteComponent(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                {:else if selectedTableTarget?.kind === 'header' && selectedComponent?.type === 'fbTable'}
                  <FbcAction onClick={() => addTableColumn(selectedTableTarget!.tableId, selectedTableTarget!.columnIndex + 1)}><span class="fb-designer-action-label">Add column to right</span></FbcAction>
                  {#if tableColumns(selectedComponent).length > 1}
                    <FbcAction danger onClick={() => deleteTableColumn(selectedTableTarget!.tableId, selectedTableTarget!.columnIndex)}><span class="fb-designer-action-label">Delete column</span></FbcAction>
                  {/if}
                {:else if selectedTableTarget?.kind === 'row' && selectedComponent?.type === 'fbTable'}
                  {#if tableRows(selectedComponent).length > 1}
                    <FbcAction danger onClick={() => deleteTableRow(selectedTableTarget!.tableId, selectedTableTarget!.rowIndex)}><span class="fb-designer-action-label">Delete row</span></FbcAction>
                  {/if}
                {:else if selectedTableTarget?.kind === 'cell' && selectedComponent?.type === 'fbTable'}
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component here</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponentToSelectedTableCell(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                {:else if selectedTableTarget?.kind === 'separator' && selectedComponent?.type === 'fbTable'}
                  <FbcAction onClick={() => addTableColumn(selectedTableTarget!.tableId, selectedTableTarget!.separatorIndex)}><span class="fb-designer-action-label">Add column here</span></FbcAction>
                {:else if !selectedComponent}
                  <FbcAction onClick={() => addComponent('fbSection', 'form')}><span class="fb-designer-action-label">Add section to form</span></FbcAction>
                  <FbcAction onClick={() => addComponent('fbGridRow', 'form')}><span class="fb-designer-action-label">Add Grid row to form</span></FbcAction>
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add single component to form</span></summary>
                      <div class="palette-grid">
                        {#each formOrSectionComponentTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponent(type, 'form')}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                  <li>
                    <details>
                      <summary class="fb-designer-action-summary fb-designer-action-danger"><span class="fb-designer-action-label">Delete</span></summary>
                      <button type="button" class="fb-designer-action-item fb-designer-action-danger fb-designer-confirm-delete" onclick={removeDesign}>
                        <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">Confirm delete form</span>
                      </button>
                    </details>
                  </li>
                {:else if selectedComponent.type === 'fbSection'}
                  <FbcAction onClick={() => addComponent('fbGridRow', selectedId)}><span class="fb-designer-action-label">Add Grid row to section</span></FbcAction>
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add single component to section</span></summary>
                      <div class="palette-grid">
                        {#each formOrSectionComponentTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponent(type, selectedId)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                {:else if selectedComponent.type === 'fbGridRow'}
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component at end of row</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponent(type, selectedId)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                  <FbcAction onClick={() => addComponentBelow('fbGridRow')}><span class="fb-designer-action-label">Add another row below</span></FbcAction>
                {:else if selectedComponent.type === 'fbGridCell' || selectedParent?.type === 'fbGridCell'}
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component to right</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponentRight(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component below</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponentBelow(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                {:else if selectedComponent.type === 'fbGroup'}
                  <FbcAction onClick={() => addComponent('fbRadio', selectedId)}><span class="fb-designer-action-label">Add radiobutton to group</span></FbcAction>
                  <FbcAction onClick={() => addComponent('fbCheck', selectedId)}><span class="fb-designer-action-label">Add check box to group</span></FbcAction>
                  <li>
                    <details>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component below</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponentBelow(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                {:else if selectedComponent.type === 'fbRadio'}
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add a subquestion</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponent(type, selectedId)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                  <FbcAction onClick={() => addComponent('fbInverseSubq', selectedId)}><span class="fb-designer-action-label">Add an inverse subcomponent</span></FbcAction>
                  <FbcAction onClick={() => addComponentBelow('fbRadio')}><span class="fb-designer-action-label">Add another radiobutton below</span></FbcAction>
                {:else if selectedComponent.type === 'fbCheck'}
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add a subquestion</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponent(type, selectedId)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                  <FbcAction onClick={() => addComponent('fbInverseSubq', selectedId)}><span class="fb-designer-action-label">Add an inverse subcomponent</span></FbcAction>
                  <FbcAction onClick={() => addComponentBelow('fbCheck')}><span class="fb-designer-action-label">Add another check box below</span></FbcAction>
                {:else if selectedComponent.type === 'fbDropdown' || selectedComponent.type === 'fbSmartDropdown'}
                  <FbcAction onClick={() => addComponent('fbSubqForOption', selectedId)}><span class="fb-designer-action-label">Add an option subquestion</span></FbcAction>
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component below</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponentBelow(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                {:else}
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component to right</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponentRight(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                  <li>
                    <details open>
                      <summary class="fb-designer-action-summary"><span class="fb-designer-action-label">Add component below</span></summary>
                      <div class="palette-grid">
                        {#each questionTypes as type}
                          <button type="button" class="fb-designer-action-item" onclick={() => addComponentBelow(type)}>
                            <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">{typeLabels[type] || type}</span>
                          </button>
                        {/each}
                      </div>
                    </details>
                  </li>
                {/if}
                {#if selectedComponent}
                  <li>
                    <details>
                      <summary class="fb-designer-action-summary fb-designer-action-danger"><span class="fb-designer-action-label">Delete selected component</span></summary>
                      <button type="button" class="fb-designer-action-item fb-designer-action-danger fb-designer-confirm-delete" onclick={removeSelected}>
                        <span class="fb-designer-action-marker" aria-hidden="true">&#x25b6; </span><span class="fb-designer-action-label">Confirm delete component</span>
                      </button>
                    </details>
                  </li>
                {/if}
              </ul>
            </section>
            </FbcActions>
          {/if}
        </div>

        <div slot="footer">
          {#if composerUnlocked && !showingDesignList && publicUrl}
            <div class="public-url">
              <span>Public URL: </span><a href={publicUrl}>{publicUrl}</a>
              <button type="button" aria-label="Copy public URL" title="Copy public URL" onclick={copyPublicUrl}>
                <span class="material-icons" aria-hidden="true">content_copy</span>
              </button>
            </div>
          {/if}
          {#if composerUnlocked && !showingDesignList}
            <div class="composer-panel-button-row">
              <FbcButton type="button" onClick={() => { jsonText = JSON.stringify(activeDesign, null, 2); jsonError = ''; showJson = true; }}>Show JSON</FbcButton>
              <FbcButton
                type="button"
                className={`composer-save-button composer-save-button-${saveButtonState}`}
                onClick={() => persistDesign(false)}
                disabled={saveButtonState !== 'dirty'}
              >{saveButtonLabel}</FbcButton>
            </div>
            {#if statusMessage}
              <div class="composer-status">{statusMessage}</div>
            {/if}
          {/if}
          {#if composerUnlocked}
            <hr class="panel-footer-rule" />
            <div class="session-email">User: {email}</div>
            <FbcButton type="button" onClick={logout}>Logout</FbcButton>
          {:else if statusMessage}
            <div class="composer-status">{statusMessage}</div>
          {/if}
        </div>
      </FbcPanel>
    </section>
  {/if}
  {#if showJson}
    <div class="json-popup-backdrop" role="presentation">
      <div class="json-popup" role="dialog" aria-modal="true" aria-labelledby="json-popup-title">
        <h2 id="json-popup-title">JSON</h2>
        <textarea class="json-editor" bind:value={jsonText} spellcheck="false"></textarea>
        {#if jsonError}<div class="composer-error">{jsonError}</div>{/if}
        <div class="composer-panel-button-row">
          <FbcButton type="button" onClick={() => applyJson(true)} disabled={loading}>OK</FbcButton>
          <FbcButton type="button" onClick={() => { showJson = false; syncJson(); }}>Cancel</FbcButton>
        </div>
      </div>
    </div>
  {/if}
  {#if dragDropProblemVisible}
    <div class="drag-drop-problem" role="alert" aria-live="assertive">
      <div class="drag-drop-problem-title">Drag and drop problem</div>
      <div>Use the light-green separator bars as drop targets. Rows drop into forms or sections, cells drop into rows, and questions drop into sections, cells, groups, or question separators.</div>
    </div>
  {/if}
</main>

<style>
  .svelte-composer-shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .composer-status,
  .session-email,
  p {
    font-size: 0.9rem;
    font-weight: 300;
  }

  .composer-auth-panel {
    width: 100%;
  }

  .composer-auth-panel label {
    display: block;
    margin: 0 0 0.15rem 0;
    font-size: 0.8rem;
    font-style: italic;
    font-weight: 300;
  }

  .composer-auth-panel input {
    width: 100%;
    height: 2rem;
    border: 0.1rem solid black;
    border-radius: 0;
    box-sizing: border-box;
    padding: 0.2rem;
    font-size: 1rem;
    font-weight: 300;
    background: white;
  }

  .composer-auth-input-spaced {
    margin-bottom: 0.5rem;
  }

  .composer-password-field {
    position: relative;
    margin-bottom: 0.5rem;
  }

  .composer-password-field input {
    padding-right: 1.8rem;
  }

  .composer-password-field button {
    position: absolute;
    right: 0.2rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.4rem;
    height: 1.4rem;
    border: none;
    background: transparent;
    color: black;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .composer-password-field .material-icons {
    font-size: 1rem;
    line-height: 1;
  }

  .composer-password-warning {
    color: var(--fb-red);
    font-size: 0.85rem;
    font-style: italic;
    font-weight: 300;
  }

  .composer-auth-message {
    color: var(--fb-red);
  }

  .composer-auth-panel .composer-check {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    font-style: normal;
    font-weight: 300;
  }

  .composer-auth-panel .composer-check input {
    display: inline-block;
    width: auto;
    height: auto;
    margin: 0;
  }

  .composer-auth-button-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  h2,
  .panel-title {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 500;
  }

  label {
    display: block;
    margin-bottom: 0.45rem;
    font-size: 0.9rem;
    font-weight: 500;
  }

  input,
  textarea,
  select {
    width: 100%;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-sizing: border-box;
    font-size: 1rem;
    font-weight: 300;
    background: white;
  }

  input,
  select {
    height: 2rem;
    padding: 0 0.5rem;
  }

  textarea {
    min-height: 4rem;
    padding: 0.5rem;
  }

  .auth-mode,
  .composer-check {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    font-weight: 300;
  }

  .auth-mode label {
    display: flex;
    gap: 0.25rem;
    margin: 0 0 0.6rem 0;
    font-size: 0.9rem;
    font-style: normal;
  }

  .auth-mode input,
  .composer-check input {
    width: auto;
    height: auto;
    margin: 0;
    display: inline-block;
  }

  .svelte-composer-body {
    min-height: 0;
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 20rem;
    overflow: hidden;
  }

  .composer-preview-panel {
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .composer-preview-panel-blank {
    background: white;
  }

  .composer-preview-header {
    flex: 0 0 auto;
    position: relative;
    min-height: 8.8rem;
    padding: 0.4rem 0.4rem 0.2rem 0.4rem;
    border-bottom: 0.2rem solid var(--fb-blue);
    box-sizing: border-box;
  }

  .composer-preview-header h1 {
    margin: 0;
    color: var(--fb-blue);
    font-size: 2rem;
    font-weight: 500;
    outline: none;
    padding: 0.1rem;
    border: 0.1rem solid transparent;
    width: calc(100% - 23rem);
    min-height: 2.4rem;
  }

  .composer-preview-header h1.form-selected-title {
    border-color: purple;
  }

  .composer-preview-addressograph {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    min-width: 22rem;
  }

  .composer-preview-workspace {
    min-height: 0;
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    overflow: hidden;
  }

  .composer-preview-nav {
    min-width: 0;
    overflow: auto;
    padding: 0.4rem;
    border-right: 0.1rem solid silver;
    background: white;
  }

  .composer-preview-nav-empty {
    color: #666;
    font-size: 0.85rem;
    font-weight: 300;
  }

  .composer-form-preview {
    overflow: auto;
    padding: 0.8rem 0 4rem 0;
    position: relative;
  }

  .composer-preview-bottom-bar {
    flex: 0 0 auto;
    display: flex;
    gap: 0.4rem;
    border-top: 0.2rem solid var(--fb-blue);
    padding: 0.4rem;
    background: white;
    min-height: 2.8rem;
    box-sizing: border-box;
  }

  .composer-preview-bottom-bar .fb-button {
    height: auto;
    min-height: 1.8rem;
    padding: 0 0.5rem;
    margin-left: 0.2rem;
    border: 0.1rem solid var(--fb-blue);
    border-radius: 0.25rem;
    background: var(--fb-blue);
    color: white;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }

  .composer-preview-bottom-bar .fb-button:hover,
  .composer-preview-bottom-bar .fb-button:focus {
    background: var(--fb-active-darker-yellow);
    border-color: var(--fb-active-darker-yellow);
    color: black;
  }

  .composer-form-preview.form-selected {
    outline: 0.1rem solid purple;
    outline-offset: -0.1rem;
  }

  .empty-preview {
    margin: 1rem;
    border: 0.1rem dashed silver;
    border-radius: 0.4rem;
    background: white;
    color: var(--fb-blue);
    font-size: 1rem;
    font-weight: 500;
    padding: 1rem;
    cursor: pointer;
  }

  :global(.preview-component) {
    position: relative;
    margin: 0.15rem 0;
    padding: 0.15rem 0.25rem;
    outline: 0.1rem solid transparent;
    outline-offset: -0.1rem;
    cursor: pointer;
  }

  :global(.preview-component.selected) {
    outline: 0.12rem solid purple !important;
    outline-offset: -0.12rem;
    box-shadow: inset 0 0 0 0.05rem purple;
  }

  :global(.preview-component.preview-section-component.selected),
  :global(.preview-component.preview-grid-row-component.selected),
  :global(.preview-component.preview-grid-cell-component.selected) {
    padding: 0.4rem;
  }

  :global(.preview-component.fb-question-container:hover),
  :global(.preview-component.fb-question-container:focus-within),
  :global(.preview-component.fb-radio-checkbox-group-container:hover),
  :global(.preview-component.fb-radio-checkbox-group-container:focus-within) {
    background: var(--fb-active-lighter-yellow);
  }

  :global(.preview-component.fb-question-container .preview-component.fb-question-container:hover),
  :global(.preview-component.fb-question-container .preview-component.fb-question-container:focus-within),
  :global(.preview-component.fb-question-container .preview-component.fb-radio-checkbox-group-container:hover),
  :global(.preview-component.fb-question-container .preview-component.fb-radio-checkbox-group-container:focus-within),
  :global(.preview-component.fb-radio-checkbox-group-container .preview-component.fb-question-container:hover),
  :global(.preview-component.fb-radio-checkbox-group-container .preview-component.fb-question-container:focus-within) {
    background: var(--fb-active-darker-yellow);
  }

  :global(.preview-component.fb-question-container .preview-component.fb-question-container .preview-component.fb-question-container:hover),
  :global(.preview-component.fb-question-container .preview-component.fb-question-container .preview-component.fb-question-container:focus-within),
  :global(.preview-component.fb-radio-checkbox-group-container .preview-component.fb-question-container .preview-component.fb-question-container:hover),
  :global(.preview-component.fb-radio-checkbox-group-container .preview-component.fb-question-container .preview-component.fb-question-container:focus-within) {
    background: var(--fb-active-lighter-yellow);
  }

  :global(.preview-component.green-bar::before) {
    content: "";
    position: absolute;
    left: 0;
    top: 0.25rem;
    bottom: 0.25rem;
    width: 0.4rem;
    background: var(--fb-faint-green);
  }

  .purple-handle {
    position: absolute;
    top: -0.1rem;
    left: -0.1rem;
    width: 1rem;
    height: 1rem;
    background: purple;
    z-index: 2;
    cursor: grab;
  }

  .fb-composer-separator {
    width: 100%;
    min-height: 1rem;
    height: 1rem;
    border: none;
    border-radius: 0;
    background: #C5E1A5;
    box-sizing: border-box;
    cursor: pointer;
    outline: none;
  }

  .fb-composer-separator.tall {
    width: 1rem;
    min-width: 1rem;
    height: 100%;
    min-height: 2rem;
  }

  .fb-composer-separator.full-size {
    width: 100%;
    height: 1rem;
    min-height: 1rem;
  }

  .fb-composer-separator.selected {
    outline: 0.1rem solid purple;
  }

  .fb-composer-single-question-separators {
    display: grid;
    grid-template-columns: 1rem minmax(0, 1fr) 1rem;
    column-gap: 0.4rem;
    align-items: stretch;
    width: 100%;
  }

  .drag-drop-problem {
    position: fixed;
    left: 50%;
    top: 4rem;
    transform: translateX(-50%);
    z-index: 80;
    width: min(28rem, calc(100vw - 2rem));
    box-sizing: border-box;
    border: 0.2rem solid var(--fb-red);
    border-radius: 0.4rem;
    background: white;
    color: var(--fb-red);
    padding: 0.6rem 0.8rem;
    font-family: 'Roboto', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.2);
  }

  .drag-drop-problem-title {
    margin-bottom: 0.2rem;
    font-size: 1rem;
    font-weight: 500;
  }

  .preview-section h2 {
    margin: 0 0 0.4rem 0;
    padding: 0.3rem 0.6rem;
    background: var(--fb-blue);
    color: white;
    border-radius: 0;
    font-size: 1rem;
    font-weight: 500;
    outline: none;
  }

  .preview-grid-row,
  .preview-children.grid-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    gap: 1rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  :global(.preview-grid-row > .fb-composer-separator.tall) {
    flex: 0 0 1rem;
    align-self: stretch;
  }

  :global(.preview-grid-row > .preview-grid-cell-component) {
    box-sizing: border-box;
    min-height: 2rem;
  }

  .preview-grid-cell,
  .preview-children.grid-cell {
    min-width: 0;
    min-height: 2rem;
    box-sizing: border-box;
  }

  .preview-label {
    margin-bottom: 0.2rem;
    font-weight: 500;
    outline: none;
  }

  .required {
    color: var(--fb-red);
    font-weight: 500;
  }

  .required-for-audit {
    display: inline-block;
    margin-left: 0.1rem;
    padding: 0.05rem 0.2rem;
    background: var(--fb-orange);
    color: white;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    vertical-align: baseline;
    white-space: nowrap;
  }

  .preview-group {
    border: 0;
    padding: 0;
    margin: 0;
  }

  .preview-choice {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    width: fit-content;
    padding: 0.1rem 0.2rem;
    margin-bottom: 0.1rem;
    font-weight: 300;
  }

  .preview-choice:hover,
  .preview-choice:focus-within {
    background: var(--fb-active-darker-yellow);
  }

  :global(.fb-radio-checkbox-group-container .fb-radio-checkbox-group-container) .preview-choice:hover,
  :global(.fb-radio-checkbox-group-container .fb-radio-checkbox-group-container) .preview-choice:focus-within,
  :global(.fb-question-container .fb-radio-checkbox-group-container) .preview-choice:hover,
  :global(.fb-question-container .fb-radio-checkbox-group-container) .preview-choice:focus-within {
    background: var(--fb-active-lighter-yellow);
  }

  .preview-choice input {
    width: auto;
    height: auto;
  }

  .preview-selector,
  .preview-blood-pressure {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    max-width: 24rem;
  }

  .preview-selector .material-icons {
    color: var(--fb-orange);
  }

  .preview-boxed {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    border: 0.2rem solid currentColor;
    border-radius: 0.4rem;
    padding: 0.5rem;
    box-sizing: border-box;
    font-weight: 500;
  }

  .preview-boxed .material-icons {
    font-size: 4rem;
  }

  .preview-boxed.info {
    color: var(--fb-blue);
  }

  .preview-boxed.warning {
    color: var(--fb-orange);
  }

  .preview-boxed.alert {
    color: var(--fb-red);
  }

  .preview-table-wrap {
    overflow-x: auto;
  }

  :global(.preview-table) {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.2rem;
  }

  :global(.fb-composer-table-selected),
  :global(.fb-composer-table-row-selected > td) {
    outline: 0.1rem solid purple;
    outline-offset: -0.1rem;
  }

  :global(.fb-composer-table-separator-cell) {
    cursor: pointer;
  }

  .fbSeparatorTall {
    display: block;
    width: 1rem;
    min-height: 2rem;
    height: 100%;
    background: #C5E1A5;
  }

  .fb-composer-table-column-header-content {
    position: relative;
    min-height: 1rem;
    outline: none;
  }

  .fb-composer-table-column-drag-handle {
    position: absolute;
    top: -0.25rem;
    left: -0.25rem;
    width: 1rem;
    height: 1rem;
    border: none;
    padding: 0;
    background: var(--fb-blue);
    cursor: grab;
    z-index: 2;
  }

  .table-drag-icon {
    color: var(--fb-blue);
    cursor: grab;
  }

  .table-delete-button {
    border: none;
    background: transparent;
    color: var(--fb-red);
    padding: 0;
    cursor: pointer;
  }

  .preview-add-button-row {
    margin-top: 0.35rem;
  }

  .preview-table-cell-template {
    min-width: 0;
  }

  .preview-blood-pressure {
    width: fit-content;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem;
  }

  .bp-numbers {
    display: grid;
    width: 4.4rem;
    gap: 0.2rem;
  }

  .bp-numbers input {
    border: none;
    height: 1.4rem;
  }

  .bp-numbers span {
    border-top: 0.2rem solid silver;
  }

  .right-section {
    margin-bottom: 0.4rem;
  }

  .fb-designer-action-summary,
  .fb-designer-action-item {
    display: block;
    width: 100%;
    border: 0.1rem solid transparent;
    background: transparent;
    color: var(--fb-blue);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 300;
    padding: 0.125rem 0.35rem;
    text-align: left;
    text-decoration: underline;
  }

  .fb-designer-action-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .fb-designer-action-summary:hover,
  .fb-designer-action-item:hover,
  .fb-designer-action-summary:focus,
  .fb-designer-action-item:focus {
    background: #e6e6e6;
    color: black;
    outline: none;
  }

  .fb-designer-action-danger,
  .fb-designer-action-danger::before,
  .fb-designer-action-danger .fb-designer-action-marker {
    color: var(--fb-red);
  }

  .fb-designer-action-danger:hover,
  .fb-designer-action-danger:focus,
  .fb-designer-action-danger:hover::before,
  .fb-designer-action-danger:focus::before,
  .fb-designer-action-danger:hover .fb-designer-action-marker,
  .fb-designer-action-danger:focus .fb-designer-action-marker {
    color: var(--fb-red);
  }

  .fb-designer-confirm-delete {
    margin-left: 0.8rem;
    width: calc(100% - 0.8rem);
  }

  .fb-designer-action-summary::marker {
    content: "";
  }

  .fb-designer-action-summary::before {
    content: "\25b6  ";
    font-weight: 700;
  }

  details[open] > .fb-designer-action-summary::before {
    content: "\25bc  ";
  }

  .composer-panel-button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.45rem;
  }

  :global(.composer-save-button) {
    color: black !important;
    opacity: 1 !important;
  }

  :global(.composer-save-button-saved) {
    background-color: var(--fb-green) !important;
    cursor: not-allowed !important;
  }

  :global(.composer-save-button-saving) {
    background-color: var(--fb-orange) !important;
    cursor: not-allowed !important;
  }

  :global(.composer-save-button-dirty) {
    background-color: var(--fb-red) !important;
    cursor: pointer !important;
  }

  :global(.composer-save-button:disabled) {
    color: black !important;
    opacity: 1 !important;
  }

  .composer-startup-blank {
    background: white;
  }

  .composer-design-list ul {
    list-style: none;
    margin: 0 0 0.6rem 0;
    padding: 0;
  }

  .composer-design-list li {
    margin: 0.15rem 0;
  }

  .composer-design-link {
    border: 0;
    background: transparent;
    color: var(--fb-blue);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 300;
    padding: 0;
    text-align: left;
    text-decoration: underline;
  }

  .composer-design-link:hover,
  .composer-design-link:focus {
    color: black;
    outline: none;
  }

  .fb-designer-property-grid {
    width: 100%;
    border-collapse: collapse;
    border-top: 0.1rem solid silver;
    border-left: 0.1rem solid silver;
    font-size: 0.85rem;
  }

  .fb-designer-property-grid th,
  .fb-designer-property-grid td {
    min-height: 2rem;
    border-right: 0.1rem solid silver;
    border-bottom: 0.1rem solid silver;
    box-sizing: border-box;
    padding: 0.25rem;
    font-weight: 300;
    vertical-align: middle;
  }

  .fb-designer-property-grid th {
    width: 8rem;
    text-align: left;
    font-style: italic;
  }

  .fb-designer-property-grid input,
  .fb-designer-property-grid select {
    border-radius: 0;
    border: none;
    font-size: 0.9rem;
    padding: 0;
  }

  .fb-designer-property-grid :global(.fbcp-text-input),
  .fb-designer-property-grid :global(.fbcp-textarea),
  .fb-designer-property-grid :global(.fbcp-dropdown),
  .fb-designer-property-grid :global([data-fbcp-text-input]),
  .fb-designer-property-grid :global([data-fbcp-dropdown]) {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    border-width: 0 !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    display: block !important;
    font-family: 'Roboto', sans-serif !important;
    font-size: 0.85rem !important;
    font-weight: 300 !important;
    line-height: 1.2 !important;
    margin: 0 !important;
    min-height: 1.2rem !important;
    outline: none !important;
    padding: 0 !important;
    width: 100% !important;
  }

  .fb-designer-property-grid :global(.fbcp-text-input:focus),
  .fb-designer-property-grid :global(.fbcp-textarea:focus),
  .fb-designer-property-grid :global(.fbcp-dropdown:focus),
  .fb-designer-property-grid :global([data-fbcp-text-input]:focus),
  .fb-designer-property-grid :global([data-fbcp-dropdown]:focus) {
    border: none !important;
    border-width: 0 !important;
    box-shadow: none !important;
    outline: none !important;
  }

  .palette-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.15rem;
    margin: 0.25rem 0 0.4rem 0.8rem;
  }

  .public-url {
    border-top: 0.1rem solid silver;
    border-bottom: 0.1rem solid silver;
    margin-bottom: 0.5rem;
    padding: 0.4rem 0;
    line-height: 1.2;
  }

  .public-url span,
  .public-url a {
    font-size: 0.8rem;
    font-weight: 300;
    word-break: break-all;
  }

  .public-url a {
    color: var(--fb-blue);
  }

  .public-url button {
    border: none;
    background: transparent;
    cursor: pointer;
    margin-left: 0.2rem;
    padding: 0;
    vertical-align: baseline;
  }

  .public-url .material-icons {
    font-size: 0.8rem;
    line-height: 0.8rem;
  }

  .panel-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 0.4rem 0;
  }

  .panel-header-rule,
  .panel-footer-rule {
    border: none;
    border-top: 0.1rem solid silver;
    margin: 0 0 0.5rem 0;
  }

  .panel-header-rule {
    border-top-color: black;
  }

  .panel-footer-rule {
    margin: 0.5rem 0 0.35rem 0;
  }

  .session-email {
    font-size: 0.8rem;
    font-weight: 300;
    margin-bottom: 0.35rem;
    word-break: break-all;
  }

  .json-popup-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.25);
  }

  .json-popup {
    display: flex;
    flex-direction: column;
    width: 70vw;
    height: 70vh;
    box-sizing: border-box;
    border: 0.1rem solid black;
    background: white;
    padding: 1rem;
  }

  .json-popup h2 {
    margin: 0 0 0.4rem 0;
    font-size: 1rem;
    font-weight: 500;
  }

  .json-editor {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    box-sizing: border-box;
    font-family: Consolas, 'Roboto Mono', monospace !important;
    font-size: 0.8rem;
    overflow: scroll;
    white-space: pre;
    resize: none;
  }

  .composer-error {
    color: var(--fb-red);
    font-size: 0.9rem;
    font-weight: 500;
  }

  @media (max-width: 900px) {
    .svelte-composer-body {
      grid-template-columns: 1fr;
    }

    .composer-preview-workspace {
      grid-template-columns: 1fr;
    }

    .composer-preview-nav {
      display: none;
    }
  }
</style>
