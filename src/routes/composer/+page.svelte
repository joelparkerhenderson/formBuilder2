<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import FbcActions from '$lib/components/fbc/fbcActions.svelte';
  import FbcBreadcrumbs from '$lib/components/fbc/fbcBreadcrumbs.svelte';
  import FbcButton from '$lib/components/fbc/fbcButton.svelte';
  import FbcModal from '$lib/components/fbc/fbcModal.svelte';
  import FbcOptions from '$lib/components/fbc/fbcOptions.svelte';
  import FbcPanel from '$lib/components/fbc/fbcPanel.svelte';
  import FbcProperties from '$lib/components/fbc/fbcProperties.svelte';
  import ComposerJsonModal from '$lib/components/composer/ComposerJsonModal.svelte';
  import FbAddButton from '$lib/components/fb/fbAddButton.svelte';
  import FbAddressograph from '$lib/components/fb/fbAddressograph.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbLayoutNav from '$lib/components/fb/fbLayoutNav.svelte';
  import FbTable from '$lib/components/fb/fbTable.svelte';
  import FbTableBody from '$lib/components/fb/fbTableBody.svelte';
  import FbTableCell from '$lib/components/fb/fbTableCell.svelte';
  import FbTableHeader from '$lib/components/fb/fbTableHeader.svelte';
  import FbTableHeaderCell from '$lib/components/fb/fbTableHeaderCell.svelte';
  import FbTableRow from '$lib/components/fb/fbTableRow.svelte';
  import FbNumberInput from '$lib/components/fb/fbNumberInput.svelte';
  import FbDateHeightWeightBMIRow from '$lib/components/fb/fbDateHeightWeightBMIRow.svelte';
  import FbDateExact from '$lib/components/fb/fbDateExact.svelte';
  import FbDatePartial from '$lib/components/fb/fbDatePartial.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbMSISelector from '$lib/components/fb/fbMSISelector.svelte';
  import FbNotificationTypeGroup from '$lib/components/fb/fbNotificationTypeGroup.svelte';
  import FbReadOnly from '$lib/components/fb/fbReadOnly.svelte';
  import FbSCTDiagnosis from '$lib/components/fb/fbSCTDiagnosis.svelte';
  import FbSCTProcedure from '$lib/components/fb/fbSCTProcedure.svelte';
  import FbSmartDropdown from '$lib/components/fb/fbSmartDropdown.svelte';
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import FbTime from '$lib/components/fb/fbTime.svelte';
  import FbToolTip from '$lib/components/fb/fbToolTip.svelte';
  import FbcpCheck from '$lib/components/fbcp/fbcpCheck.svelte';
  import FbcpDropdown from '$lib/components/fbcp/fbcpDropdown.svelte';
  import FbcpTextInput from '$lib/components/fbcp/fbcpTextInput.svelte';
  import FbcpTextarea from '$lib/components/fbcp/fbcpTextarea.svelte';
  import { composerAuth, deleteDesign, listDesignsBySession, saveComposerPrefs, saveDesign } from '$lib/api/legacy';

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

  type ActionModal = {
    title: string;
    types?: string[];
    action?: 'add' | 'below' | 'right' | 'tableCell' | 'separator' | 'afterSelected' | 'singleBelowRow' | 'rowBelow' | 'rowEnd' | 'cellBelow' | 'componentBelow' | 'groupOption' | 'subquestion' | 'questionBelow';
    parentId?: string;
    deleteTarget?: 'form' | 'component' | 'separatorParent';
    deleteTargetId?: string;
    deleteTargetLabel?: string;
    deleteTargetSelectId?: string;
  };

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
    'fbReadOnly',
    'fbDropdown',
    'fbSmartDropdown',
    'fbGroup',
    'fbRadio',
    'fbCheck',
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
    'fbReadOnly',
    'fbDropdown',
    'fbSmartDropdown',
    'fbNumberInput',
    'fbNumberInputWithUnits',
    'fbDateHeightWeightBMIRow',
    'fbNotificationTypeGroup',
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
  const messageTypes = ['fbBoxedWarning', 'fbBoxedAlert', 'fbBoxedInfo'];
  const formOrSectionComponentTypes = ['fbTable', ...messageTypes, ...questionTypes];
  const propertyTypeChoices = [...paletteTypes, 'fbInverseSubq', 'fbSubqForOption'];
  const typeLabels: Record<string, string> = {
    fbSection: 'Section',
    fbGridRow: 'Grid row',
    fbGridCell: 'Grid cell',
    fbTable: 'Table',
    fbTextInput: 'Text input',
    fbTextArea: 'Text area',
    fbReadOnly: 'Read only',
    fbDropdown: 'Dropdown',
    fbSmartDropdown: 'Dropdown with partial matching',
    fbGroup: 'Group',
    fbRadio: 'Radio button',
    fbCheck: 'Checkbox',
    fbInverseSubq: 'Inverse subq',
    fbSubqForOption: 'subq for option',
    fbNumberInput: 'Number input',
    fbNumberInputWithUnits: 'Number input with units',
    fbDateHeightWeightBMIRow: 'Height, weight and BMI',
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
  let selectedOptionsDraft = '';
  let selectedOptionsDraftKey = '';
  let draggedId: string | null = null;
  let draggedTableColumn: { tableId: string; columnIndex: number } | null = null;
  let draggedTableRow: { tableId: string; rowIndex: number } | null = null;
  let dragDropProblemVisible = false;
  let dragDropProblemTimer: number | null = null;
  let previewValues: Record<string, string> = {};
  let previewCoded: Record<string, boolean> = {};
  let leftPreviewElement: HTMLDivElement | undefined;
  let pendingLeftScrollTop: number | null = null;
  let actionModal: ActionModal | null = null;
  let previousActionSelectionKey = '';

  $: publicUrl = activeDesign.publicId ? `${window.location.origin}${base}/userForm.html#${activeDesign.publicId}` : '';
  $: selectedComponent = selectedId === 'form' ? null : findComponent(activeDesign.components, selectedId);
  $: selectedPath = selectedId === 'form' ? [] : componentPath(activeDesign.components, selectedId);
  $: selectedParent = selectedPath.length > 1 ? selectedPath[selectedPath.length - 2] : null;
  $: selectedTable = selectedTableTarget ? findComponent(activeDesign.components, selectedTableTarget.tableId) : null;
  $: selectedTableTemplate = selectedTableTarget?.kind === 'cell' && selectedTable
    ? normaliseTableTemplates(selectedTable)[selectedTableTarget.columnIndex]
    : null;
  $: selectedSeparatorDeleteTarget = emptyGridCellSeparatorDeleteTarget(selectedSeparator, activeDesign.components);
  $: propertyComponent = selectedTableTemplate || selectedComponent;
  $: selectedColSpanCell = selectedComponent?.type === 'fbGridCell' ? selectedComponent : selectedParent?.type === 'fbGridCell' ? selectedParent : null;
  $: selectedDirectCell = selectedParent?.type === 'fbGridCell' ? selectedParent : null;
  $: selectedDirectCellRow = selectedDirectCell && selectedPath.length > 2 ? selectedPath[selectedPath.length - 3] : null;
  $: canRemoveEnclosingRowAndCell = Boolean(
    selectedComponent
    && selectedDirectCell
    && selectedDirectCellRow?.type === 'fbGridRow'
    && (selectedDirectCell.children || []).length === 1
    && (selectedDirectCellRow.children || []).length === 1
  );
  $: selectedLabel = propertyComponent?.text ?? propertyComponent?.label ?? '';
  $: selectedOptionsText = propertyComponent?.options?.map((option) => `${option.value}|${option.label}`).join('\n') || '';
  $: if ((propertyComponent?.type === 'fbDropdown' || propertyComponent?.type === 'fbSmartDropdown') && propertyComponent.id !== selectedOptionsDraftKey) {
    selectedOptionsDraftKey = propertyComponent.id;
    selectedOptionsDraft = selectedOptionsText;
  } else if (propertyComponent?.type !== 'fbDropdown' && propertyComponent?.type !== 'fbSmartDropdown' && selectedOptionsDraftKey) {
    selectedOptionsDraftKey = '';
    selectedOptionsDraft = '';
  }
  $: selectedTableColumnsText = selectedComponent?.tableColumns?.map((column: any) => `${column.id || column.label}|${column.label || column.id || ''}`).join('\n') || '';
  $: selectedTableRowCount = selectedComponent?.tableRows?.length || 0;
  $: actionSelectionKey = `${selectedId}|${selectedSeparator?.id || ''}|${selectedTableTarget ? JSON.stringify(selectedTableTarget) : ''}`;
  $: if (previousActionSelectionKey && previousActionSelectionKey !== actionSelectionKey) {
    previousActionSelectionKey = actionSelectionKey;
    actionModal = null;
  } else if (!previousActionSelectionKey) {
    previousActionSelectionKey = actionSelectionKey;
  }
  $: composerUnlocked = Boolean(sessionToken) || devComposerBypass;
  $: greenBarsVisible = composerUnlocked && !showingDesignList && !isReadOnlyPreview && showGreenBars;
  $: activeDesignDirty = composerReady && lastSavedDesignSignature !== JSON.stringify(activeDesign);
  $: saveButtonState = savingDesign ? 'saving' : activeDesignDirty ? 'dirty' : 'saved';
  $: saveButtonLabel = saveButtonState === 'saved' ? 'Saved' : saveButtonState === 'saving' ? 'Saving...' : 'Save';
  $: breadcrumbItems = showingDesignList
    ? [{ id: 'form', label: 'Forms' }]
    : selectedId === 'form'
    ? [{ id: 'form', label: 'Forms' }, { id: 'form', label: activeDesign.title || 'Untitled form' }]
    : [{ id: 'form', label: 'Forms' }, { id: 'form', label: activeDesign.title || 'Untitled form' }, ...selectedPath.map((component) => ({ id: component.id, label: breadcrumbLabel(component) })).filter((item) => item.label)];
  $: composerNavItems = activeDesign.components
    .filter((component) => component.type === 'fbSection')
    .map((section, index) => {
      const incomplete = incompleteRequiredCount(section);
      return {
        id: section.id,
        label: section.label || `Section ${index + 1}`,
        isActive: selectedId === section.id || Boolean(findComponent(section.children || [], selectedId)),
        isComplete: incomplete === 0,
        incomplete,
        onClick: () => {
          selectedId = section.id;
        },
      };
    });
  $: if (composerReady && prefsReady && sessionToken) {
    activeDesign.id;
    showRowsAndCellsInBreadcrumbs;
    showSelectedPurpleBoxes;
    showAllPurpleBoxes;
    showGreenBars;
    schedulePrefsSave();
  }

  $: if (leftPreviewElement && pendingLeftScrollTop !== null) {
    leftPreviewElement.scrollTop = pendingLeftScrollTop;
    pendingLeftScrollTop = null;
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
    readOnly = isReadOnlyPreview,
    tableTarget = selectedTableTarget,
  ) {
    const selectionShown = isSelectionShown(component, currentSelectedId, showAll, showSelected, tableTarget);
    return [
      'preview-component',
      selectionShown ? 'selected' : '',
      readOnly ? 'read-only' : '',
      component.type === 'fbSection' ? 'preview-section-component' : '',
      component.type === 'fbGridRow' ? 'preview-grid-row-component' : '',
      component.type === 'fbGridCell' ? 'preview-grid-cell-component' : '',
      component.type === 'fbRadio' || component.type === 'fbCheck' ? 'preview-choice-component' : '',
      component.type === 'fbGroup' ? 'fb-radio-checkbox-group-container' : '',
      questionTypes.includes(component.type) && !['fbRadio', 'fbCheck'].includes(component.type) ? 'fb-question-container' : '',
    ].filter(Boolean).join(' ');
  }

  function previewComponentStyle(component: ComposerComponent, rowContext: ComposerComponent | null) {
    const selectionShown = isSelectionShown(component, selectedId, showAllPurpleBoxes, showSelectedPurpleBoxes, selectedTableTarget);
    return [
      'position: relative',
      component.type === 'fbRadio' || component.type === 'fbCheck' ? 'margin: 0' : 'margin: 0.15rem 0',
      component.type === 'fbRadio' || component.type === 'fbCheck' ? 'padding: 0' : 'padding: 0.15rem 0.25rem',
      selectionShown && ['fbSection', 'fbGridRow', 'fbGridCell'].includes(component.type) ? 'padding: 0.4rem' : '',
      selectionShown ? 'outline: 0.12rem solid purple' : 'outline: 0.1rem solid transparent',
      selectionShown ? 'outline-offset: -0.12rem' : 'outline-offset: -0.1rem',
      selectionShown ? 'box-shadow: inset 0 0 0 0.05rem purple' : '',
      'cursor: pointer',
      component.type === 'fbGridCell' ? previewGridCellStyle(component, rowContext) : ''
    ].filter(Boolean).join('; ');
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
    if (type === 'fbReadOnly') return { ...base, label: `Read only ${sameTypeCount}`, defaultValue: 'Read only value', units: '' };
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
    const seenKeys = new Set<string>();
    const nextUniqueKey = (preferredKey: string) => {
      let candidate = preferredKey || 'field';
      let suffix = 2;
      while (seenKeys.has(candidate)) {
        candidate = `${preferredKey || 'field'}-${suffix}`;
        suffix += 1;
      }
      seenKeys.add(candidate);
      return candidate;
    };
    const repair = (component: any): ComposerComponent => {
      const type = component?.type || 'fbTextInput';
      const fallbackId = nextUniqueComponentId(type, Array.from(seen).map((id) => ({ id, type: 'existing' } as ComposerComponent)));
      let id = String(component?.id || fallbackId);
      if (seen.has(id)) id = fallbackId;
      seen.add(id);
      const existingKey = String(component?.key || id);
      const key = nextUniqueKey(existingKey);
      const next: ComposerComponent = { ...component, id, key, type };
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

  function componentHasValue(component: ComposerComponent) {
    if (component.type === 'fbDateHeightWeightBMIRow') {
      return Boolean(previewValues[`${component.id}-dateRecorded`] || previewValues[`${component.id}-heightCm`] || previewValues[`${component.id}-weightKg`]);
    }
    if (component.type === 'fbRadio' || component.type === 'fbCheck') return isChoiceChecked(component);
    const value = previewValues[component.id] ?? component.defaultValue ?? '';
    return String(value).trim().length > 0;
  }

  function previewValue(component: ComposerComponent, id = component.id) {
    return previewValues[id] ?? component.defaultValue ?? '';
  }

  function optionLookup(component: ComposerComponent) {
    return Object.fromEntries((component.options || []).map((option) => [option.value, option.label]));
  }

  function codedValue(component: ComposerComponent, id = component.id) {
    if (!['fbMSISelector', 'fbSCTDiagnosis', 'fbSCTProcedure'].includes(component.type)) return undefined;
    const value = String(previewValue(component, id)).trim();
    return previewCoded[id] ?? (value ? true : undefined);
  }

  function isChoiceChecked(component: ComposerComponent) {
    const path = componentPath(activeDesign.components, component.id);
    const parent = path.length > 1 ? path[path.length - 2] : null;
    if (component.type === 'fbRadio' && parent?.type === 'fbGroup') {
      return previewValues[parent.id] === component.id || component.defaultValue === 'checked';
    }
    if (component.type === 'fbRadio') return (previewValues[component.id] ?? component.defaultValue ?? '') === component.id || component.defaultValue === 'checked';
    if (component.type === 'fbCheck') return (previewValues[component.id] ?? component.defaultValue ?? '') === 'checked';
    return false;
  }

  function checkPreviewChoice(id: string) {
    const component = findComponent(activeDesign.components, id);
    if (!component) return;
    const path = componentPath(activeDesign.components, id);
    const parent = path.length > 1 ? path[path.length - 2] : null;
    if (component.type === 'fbCheck') setPreviewValue(component.id, 'checked');
    if (component.type === 'fbRadio' && parent?.type === 'fbGroup') setPreviewValue(parent.id, component.id);
    else if (component.type === 'fbRadio') setPreviewValue(component.id, component.id);
  }

  function setChoiceChecked(component: ComposerComponent, checked: boolean) {
    const path = componentPath(activeDesign.components, component.id);
    const parent = path.length > 1 ? path[path.length - 2] : null;
    if (component.type === 'fbRadio' && parent?.type === 'fbGroup') setPreviewValue(parent.id, checked ? component.id : '');
    else if (component.type === 'fbRadio') setPreviewValue(component.id, checked ? component.id : '');
    else if (component.type === 'fbCheck') setPreviewValue(component.id, checked ? 'checked' : '');
  }

  function choiceGroupName(component: ComposerComponent) {
    const path = componentPath(activeDesign.components, component.id);
    const parent = path.length > 1 ? path[path.length - 2] : null;
    return component.type === 'fbRadio' && parent?.type === 'fbGroup' ? parent.id : component.id;
  }

  function isInSubquestion(component: ComposerComponent) {
    return componentPath(activeDesign.components, component.id).some((part) => part.id !== component.id && (part.type === 'fbRadio' || part.type === 'fbCheck' || part.type === 'fbInverseSubq' || part.type === 'fbSubqForOption'));
  }

  function componentLabelIsSubfield(component: ComposerComponent) {
    return !component.boldOverride && (!!component.plainOverride || isInSubquestion(component));
  }

  function componentHasRoVData(component: ComposerComponent): boolean {
    if (component.showInRoVIfEmpty) return true;
    if (component.type === 'fbTable') return true;
    if (['fbSection', 'fbGridRow', 'fbGridCell', 'fbGroup', 'fbSubqForOption'].includes(component.type)) {
      return (component.children || []).some(componentHasRoVData);
    }
    if (component.type === 'fbRadio' || component.type === 'fbCheck') {
      const checked = isChoiceChecked(component);
      const normalChildren = (component.children || []).filter((child) => child.type !== 'fbInverseSubq');
      const inverseChildren = (component.children || []).filter((child) => child.type === 'fbInverseSubq');
      return checked || (checked ? normalChildren : inverseChildren).some(componentHasRoVData);
    }
    if (component.type === 'fbInverseSubq') return (component.children || []).some(componentHasRoVData);
    return componentHasValue(component) || (component.children || []).some(componentHasRoVData);
  }

  function incompleteRequiredCount(component: ComposerComponent): number {
    const structuralTypes = new Set(['fbSection', 'fbGridRow', 'fbGridCell', 'fbGroup', 'fbSubqForOption', 'fbInverseSubq', 'fbTable']);
    const ownCount = component.required && !structuralTypes.has(component.type) && !componentHasValue(component) ? 1 : 0;
    return ownCount + (component.children || []).reduce((total, child) => total + incompleteRequiredCount(child), 0);
  }

  function openActionPalette(title: string, types: string[], action: ActionModal['action'], parentId = selectedId) {
    actionModal = { title, types, action, parentId };
  }

  function runAction(action: () => void) {
    action();
    actionModal = null;
  }

  function runModalPaletteAction(type: string) {
    if (!actionModal) return;
    const action = actionModal.action;
    if (action === 'subquestion' && actionModal.parentId) checkPreviewChoice(actionModal.parentId);
    if (action === 'tableCell') addComponentToSelectedTableCell(type);
    else if (action === 'below' || action === 'componentBelow' || action === 'questionBelow') addComponentBelow(type);
    else if (action === 'right') addComponentRight(type);
    else if (action === 'separator') addPaletteComponent(type);
    else if (action === 'afterSelected') insertAfterSelected(makeComponent(type));
    else if (action === 'singleBelowRow') insertAfterSelected(makeComponent(type));
    else if (action === 'rowBelow') addComponentBelow(type);
    else if (action === 'rowEnd') addComponent(type, actionModal.parentId || selectedId);
    else if (action === 'cellBelow') addComponentToSelectedCell(type);
    else if (action === 'groupOption' || action === 'subquestion') addComponent(type, actionModal.parentId || selectedId);
    else addComponent(type, actionModal.parentId || selectedId);
    actionModal = null;
  }

  function runDeleteAction() {
    if (actionModal?.deleteTarget === 'form') removeDesign();
    if (actionModal?.deleteTarget === 'component') removeSelected();
    if (actionModal?.deleteTarget === 'separatorParent' && actionModal.deleteTargetId) removeSeparatorDeleteTarget(actionModal.deleteTargetId, actionModal.deleteTargetSelectId || 'form');
    actionModal = null;
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
    selectedTableTarget = null;
    selectedSeparator = null;
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
    selectedTableTarget = null;
    selectedSeparator = null;
    syncJson();
  }

  function addComponentToSelectedCell(type: string) {
    const cell = selectedComponent?.type === 'fbGridCell' ? selectedComponent : selectedParent?.type === 'fbGridCell' ? selectedParent : null;
    if (!cell) {
      addComponentBelow(type);
      return;
    }
    const component = makeComponent(type);
    insertChild(cell.id, component);
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
    selectedTableTarget = null;
    selectedSeparator = null;
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
    selectedTableTarget = null;
    selectedSeparator = null;
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
    selectedTableTarget = null;
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

  function removeEnclosingRowAndCell() {
    if (!selectedComponent || !selectedDirectCellRow || !canRemoveEnclosingRowAndCell) return;
    const selected = selectedComponent;
    const rowId = selectedDirectCellRow.id;
    const replaceRow = (components: ComposerComponent[]): ComposerComponent[] => components.flatMap((component) => {
      if (component.id === rowId) return [selected];
      return [{ ...component, children: component.children ? replaceRow(component.children) : component.children }];
    });
    activeDesign = { ...activeDesign, components: replaceRow(activeDesign.components) };
    selectedId = selected.id;
    selectedSeparator = null;
    selectedTableTarget = null;
    syncJson();
  }

  function emptyGridCellSeparatorDeleteTarget(separator: SeparatorTarget | null, components: ComposerComponent[]) {
    if (!separator || separator.parentId === 'form') return null;
    const parentPath = componentPath(components, separator.parentId);
    const emptyParent = parentPath[parentPath.length - 1];
    if (!emptyParent || !['fbSection', 'fbGridRow', 'fbGridCell'].includes(emptyParent.type) || (emptyParent.children || []).length !== 0) return null;
    if (emptyParent.type !== 'fbGridCell') {
      return {
        id: emptyParent.id,
        label: emptyParent.type === 'fbSection' ? 'section' : 'grid row',
        buttonLabel: emptyParent.type === 'fbSection' ? 'Delete section' : 'Delete grid row',
        selectId: parentPath.length > 1 ? parentPath[parentPath.length - 2].id : 'form',
      };
    }
    const emptyCell = emptyParent;
    const row = parentPath.length > 1 ? parentPath[parentPath.length - 2] : null;
    if (row?.type === 'fbGridRow' && (row.children || []).filter((child) => child.type === 'fbGridCell').length === 1) {
      const rowParent = parentPath.length > 2 ? parentPath[parentPath.length - 3] : null;
      return {
        id: row.id,
        label: 'grid row',
        buttonLabel: 'Delete grid row',
        selectId: rowParent?.id || 'form',
      };
    }
    return {
      id: emptyCell.id,
      label: 'grid cell',
      buttonLabel: 'Delete grid cell',
      selectId: row?.id || 'form',
    };
  }

  function removeSeparatorDeleteTarget(targetId: string, selectId: string) {
    activeDesign = { ...activeDesign, components: removeComponentTree(activeDesign.components, targetId) };
    selectedId = selectId;
    selectedSeparator = null;
    selectedTableTarget = null;
    syncJson();
  }

  function updateSelectedText(value: string) {
    if (!propertyComponent) return;
    const key = propertyComponent.type.startsWith('fbBoxed') ? 'text' : 'label';
    updatePropertyComponent({ [key]: value });
  }

  function updateSelectedOptions(value: string) {
    if (!propertyComponent) return;
    const options = value.split(/\r?\n/).filter(Boolean).map((line, index) => {
      const [optionValue, ...optionLabelParts] = line.split('|');
      const cleanValue = (optionValue || '').trim() || `option${index + 1}`;
      const cleanLabel = optionLabelParts.join('|').trim() || cleanValue;
      return { value: cleanValue, label: cleanLabel };
    });
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

  function tableRowScope(row: { id?: string }, rowIndex: number) {
    return row.id || `row${rowIndex + 1}`;
  }

  function nextTableRowId(table: ComposerComponent, rows: Array<{ id?: string }>) {
    const used = new Set(rows.map((row) => row.id).filter(Boolean));
    let index = rows.length + 1;
    let id = `${table.id}-row${index}`;
    while (used.has(id)) {
      index += 1;
      id = `${table.id}-row${index}`;
    }
    return id;
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
      return { ...table, tableRows: [...rows, { id: nextTableRowId(table, rows) }] };
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

  function hasTableColumnDragPayload(event: DragEvent) {
    return Array.from(event.dataTransfer?.types || []).includes('text/composer-table-column');
  }

  function handleTableColumnDragOver(event: DragEvent) {
    if (hasTableColumnDragPayload(event)) {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    }
  }

  function handleTableColumnDrop(event: DragEvent, tableId: string, separatorIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    const payloadIndex = Number(event.dataTransfer?.getData('text/composer-table-column'));
    const fromIndex = draggedTableColumn?.tableId === tableId ? draggedTableColumn.columnIndex : payloadIndex;
    if (Number.isInteger(fromIndex)) moveTableColumnToSeparator(tableId, fromIndex, separatorIndex);
    draggedTableColumn = null;
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
    if (typeof prefs.leftScrollTop === 'number') {
      pendingLeftScrollTop = prefs.leftScrollTop;
      window.setTimeout(() => {
        if (leftPreviewElement && pendingLeftScrollTop !== null) {
          leftPreviewElement.scrollTop = pendingLeftScrollTop;
          pendingLeftScrollTop = null;
        }
      }, 0);
    }
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
        leftScrollTop: leftPreviewElement?.scrollTop || 0,
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
      await loadDesigns(session.prefs?.activeDesignId, false);
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
      await loadDesigns(session.prefs?.activeDesignId, false);
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
      await loadDesigns(session.prefs?.activeDesignId, false);
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
        showingDesignList = showList && !preferredDesignId;
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
      designs = designs.some((design) => design.id === activeDesign.id)
        ? designs.map((design) => design.id === activeDesign.id ? activeDesign : design)
        : [activeDesign, ...designs];
      markDesignClean();
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
    }
  }

  function isSelectionShown(
    component: ComposerComponent,
    currentSelectedId = selectedId,
    showAll = showAllPurpleBoxes,
    showSelected = showSelectedPurpleBoxes,
    tableTarget = selectedTableTarget,
  ) {
    const tableSubSelectionActive = component.type === 'fbTable' && tableTarget?.tableId === component.id;
    if (tableSubSelectionActive && !showAll) return false;
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

  function setPreviewValueWithCoding(id: string, value: string, coded?: boolean, nadexId?: string) {
    previewValues = {
      ...previewValues,
      [id]: value,
      ...(nadexId !== undefined ? { [`${id}_text`]: value, [`${id}_NADEXId`]: nadexId || '' } : {}),
    };
    if (coded !== undefined) previewCoded = { ...previewCoded, [id]: coded };
  }

  function supportsDefaultValue(component: ComposerComponent) {
    return questionTypes.includes(component.type) && !['fbGroup', 'fbDateHeightWeightBMIRow'].includes(component.type);
  }

  function supportsPlaceholder(component: ComposerComponent) {
    return ['fbTextInput', 'fbTime', 'fbTextArea', 'fbSmartDropdown'].includes(component.type);
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
      class:plain-override={!!component.plainOverride}
      class:subquestion-label={componentLabelIsSubfield(component)}
      class:read-only-group-label={isReadOnlyPreview && component.type === 'fbGroup'}
      class="preview-label"
      contenteditable={!isReadOnlyPreview}
      suppressContentEditableWarning
      role="textbox"
      tabindex="0"
      onblur={(event) => updateComponent(component.id, { label: event.currentTarget.textContent?.trim() || component.label })}
      onclick={(event) => handlePreviewSelect(event, component.id)}
      onkeydowncapture={(event) => { if (event.key === ' ') event.stopPropagation(); }}
      onkeydown={(event) => { if (event.key === 'Escape') (event.currentTarget as HTMLElement).blur(); }}
    >{component.label}{@render requiredMark(component)}</div>
  {/if}
{/snippet}

{#snippet tableTemplateLabel(template: ComposerComponent, tableId: string, columnIndex: number, rowIndex: number)}
  {#if template.label}
    <div
      class:plain-override={!!template.plainOverride}
      class="preview-label"
      contenteditable={!isReadOnlyPreview}
      role="textbox"
      tabindex="0"
      onblur={(event) => updateTableCellTemplate(tableId, columnIndex, { label: event.currentTarget.textContent?.trim() || template.label })}
      onclick={(event) => { event.stopPropagation(); selectTableCell(tableId, rowIndex, columnIndex); }}
      onfocus={() => { if (!isReadOnlyPreview) selectTableCell(tableId, rowIndex, columnIndex); }}
      onkeydowncapture={(event) => { if (event.key === ' ') event.stopPropagation(); }}
      onkeydown={(event) => { if (event.key === 'Escape') (event.currentTarget as HTMLElement).blur(); }}
    >{template.label}{@render requiredMark(template)}</div>
  {/if}
{/snippet}

{#snippet renderTableCellTemplate(template: ComposerComponent, tableId: string, columnIndex: number, rowIndex: number, rowScope: string)}
  {@const previewId = `${template.id}-${rowScope}`}
  <div class="preview-table-cell-template">
    {#if isReadOnlyPreview && ['fbTextArea', 'fbTextInput', 'fbDropdown', 'fbSmartDropdown', 'fbNumberInput', 'fbNumberInputWithUnits', 'fbDateExact', 'fbDatePartial', 'fbTime', 'fbMSISelector', 'fbSCTProcedure', 'fbSCTDiagnosis'].includes(template.type)}
      <FbReadOnly
        label={template.label || ''}
        value={previewValue(template, previewId)}
        lookupTable={template.type === 'fbDropdown' || template.type === 'fbSmartDropdown' ? optionLookup(template) : undefined}
        units={template.type === 'fbNumberInputWithUnits' ? template.units || 'units' : ''}
        coded={codedValue(template, previewId)}
        bigLabel={!!template.bigLabel}
        boldLabel={!!template.boldLabel}
        preserveGridSpace
      />
    {:else if template.type === 'fbRadio'}
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
        subfield={!!template.plainOverride}
        onChange={(value) => setPreviewValue(previewId, value)}
      />
    {:else if template.type === 'fbDropdown'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <FbDropdown
        id={previewId}
        name={template.key || previewId}
        value={previewValues[previewId] ?? template.defaultValue ?? ''}
        options={template.options || []}
        required={false}
        readonly={isReadOnlyPreview}
        fullWidth={template.fullWidth}
        noWidthConstraint={template.noWidthConstraint}
        subfield={!!template.plainOverride}
        onChange={(value) => setPreviewValue(previewId, value)}
      />
    {:else if template.type === 'fbNumberInput' || template.type === 'fbNumberInputWithUnits'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <FbNumberInput
        id={previewId}
        name={template.key || previewId}
        value={previewValues[previewId] ?? template.defaultValue ?? ''}
        units={template.type === 'fbNumberInputWithUnits' ? template.units || 'units' : ''}
        placeholder={template.placeholder || ''}
        readonly={isReadOnlyPreview}
        subfield={!!template.plainOverride}
        onChange={(value) => setPreviewValue(previewId, value)}
        unitEditable={template.type === 'fbNumberInputWithUnits' && !isReadOnlyPreview}
        onUnitClick={(event) => event.stopPropagation()}
        onUnitBlur={(value) => updateTableCellTemplate(tableId, columnIndex, { units: value })}
      />
    {:else if template.type === 'fbDateExact' || template.type === 'fbDatePartial'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      {#if template.type === 'fbDateExact'}
        <FbDateExact name={template.key || previewId} value={previewValues[previewId] ?? template.defaultValue ?? ''} required={false} readonly={isReadOnlyPreview} onChange={(value) => setPreviewValue(previewId, value)} />
      {:else}
        <FbDatePartial name={template.key || previewId} value={previewValues[previewId] ?? template.defaultValue ?? ''} placeholder={template.placeholder || 'dd-Mmm-yyyy'} required={false} readonly={isReadOnlyPreview} onChange={(value) => setPreviewValue(previewId, value)} />
      {/if}
    {:else if template.type === 'fbTime'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      <FbTime id={previewId} name={template.key || previewId} value={previewValues[previewId] ?? template.defaultValue ?? ''} required={false} readonly={isReadOnlyPreview} subfield={!!template.plainOverride} onChange={(value) => setPreviewValue(previewId, value)} />
    {:else if template.type === 'fbMSISelector' || template.type === 'fbSCTProcedure' || template.type === 'fbSCTDiagnosis'}
      {@render tableTemplateLabel(template, tableId, columnIndex, rowIndex)}
      {#if template.type === 'fbMSISelector'}
        <FbMSISelector id={previewId} name={template.key || previewId} value={previewValues[previewId] ?? template.defaultValue ?? ''} placeholder={template.placeholder || 'Type to search staff index'} required={false} readonly={isReadOnlyPreview} coded={previewCoded[previewId]} subfield={!!template.plainOverride} onChange={(value, coded, nadexId) => setPreviewValueWithCoding(previewId, value, coded, nadexId)} />
      {:else if template.type === 'fbSCTDiagnosis'}
        <FbSCTDiagnosis id={previewId} name={template.key || previewId} value={previewValues[previewId] ?? template.defaultValue ?? ''} placeholder={template.placeholder || 'Type to search SNOMED CT'} required={false} readonly={isReadOnlyPreview} coded={previewCoded[previewId]} subfield={!!template.plainOverride} onChange={(value, coded) => setPreviewValueWithCoding(previewId, value, coded)} />
      {:else}
        <FbSCTProcedure id={previewId} name={template.key || previewId} value={previewValues[previewId] ?? template.defaultValue ?? ''} placeholder={template.placeholder || 'Type to search SNOMED CT'} required={false} readonly={isReadOnlyPreview} coded={previewCoded[previewId]} subfield={!!template.plainOverride} onChange={(value, coded) => setPreviewValueWithCoding(previewId, value, coded)} />
      {/if}
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
        subfield={!!template.plainOverride}
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
      {#if component.type === 'fbRadio' || component.type === 'fbCheck'}
        {@const checked = isChoiceChecked(component)}
        {#if checked}
          {@render renderStackedChildren(component.id, component.children.filter((child) => child.type !== 'fbInverseSubq'))}
        {/if}
        {#if !checked}
          {@render renderStackedChildren(component.id, component.children.filter((child) => child.type === 'fbInverseSubq'))}
        {/if}
      {:else if component.type === 'fbDropdown' || component.type === 'fbSmartDropdown'}
        {@render renderStackedChildren(component.id, component.children.filter((child) => child.type !== 'fbSubqForOption' || child.optionValue === (previewValues[component.id] ?? component.defaultValue ?? '') || selectedId === child.id))}
      {:else}
        {@render renderStackedChildren(component.id, component.children)}
      {/if}
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
    className={previewComponentClass(component, selectedId, showAllPurpleBoxes, showSelectedPurpleBoxes, isReadOnlyPreview, selectedTableTarget)}
    style={previewComponentStyle(component, rowContext)}
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

    {#if isReadOnlyPreview && !componentHasRoVData(component)}
    {:else if component.type === 'fbSection'}
      <section class="preview-section">
        <h2
          contenteditable={!isReadOnlyPreview}
          suppressContentEditableWarning
          onkeydowncapture={(event) => { if (event.key === ' ') event.stopPropagation(); }}
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
                  ondragover={handleTableColumnDragOver}
                  ondrop={(event) => handleTableColumnDrop(event, component.id, 0)}
                ><span class="fbSeparatorTall"></span></FbTableHeaderCell>
              {/if}
              {#each columns as column, index (column.id)}
                {#if greenBarsVisible && index > 0}
                  <FbTableHeaderCell
                    className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === index ? 'fb-composer-table-selected' : ''}`}
                    style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                    aria-label={`Column drop target ${index}`}
                    onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, index); }}
                    ondragover={handleTableColumnDragOver}
                    ondrop={(event) => handleTableColumnDrop(event, component.id, index)}
                  ><span class="fbSeparatorTall"></span></FbTableHeaderCell>
                {/if}
                <FbTableHeaderCell
                  className={selectedHeaderIndex === index ? 'fb-composer-table-selected' : ''}
                  onclick={(event) => { event.stopPropagation(); selectTableHeader(component.id, index); }}
                >
                  <div class="fb-composer-table-column-header-content">
                    {#if selectedHeaderIndex === index && greenBarsVisible && columns.length > 1}
                      <div
                        class="fb-composer-table-column-drag-handle"
                        aria-label={`Drag column ${index + 1}`}
                        title="Drag column"
                        role="button"
                        tabindex="0"
                        draggable="true"
                        onclick={(event) => event.stopPropagation()}
                        ondragstart={(event) => {
                          event.stopPropagation();
                          draggedTableColumn = { tableId: component.id, columnIndex: index };
                          if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer?.setData('text/composer-table-column', String(index));
                        }}
                        ondragend={() => (draggedTableColumn = null)}
                      ><span class="material-icons" aria-hidden="true">drag_indicator</span></div>
                    {/if}
                    <span
                      class="fb-composer-table-header-label"
                      contenteditable={!isReadOnlyPreview}
                      suppressContentEditableWarning
                      onkeydowncapture={(event) => { if (event.key === ' ') event.stopPropagation(); }}
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
                  ondragover={handleTableColumnDragOver}
                  ondrop={(event) => handleTableColumnDrop(event, component.id, columns.length)}
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
                  ondragover={handleTableColumnDragOver}
                  ondrop={(event) => handleTableColumnDrop(event, component.id, 0)}
                ><span class="fbSeparatorTall"></span></FbTableCell>
              {/if}
              {#each columns as column, columnIndex (column.id)}
                {#if greenBarsVisible && columnIndex > 0}
                  <FbTableCell
                    className={`fb-composer-table-separator-cell ${selectedSeparatorIndex === columnIndex ? 'fb-composer-table-selected' : ''}`}
                    style="width: 0.4rem; padding: 0; border: none; background: transparent;"
                    aria-label={`Column drop target ${columnIndex}`}
                    onclick={(event) => { event.stopPropagation(); selectTableSeparator(component.id, columnIndex); }}
                    ondragover={handleTableColumnDragOver}
                    ondrop={(event) => handleTableColumnDrop(event, component.id, columnIndex)}
                  ><span class="fbSeparatorTall"></span></FbTableCell>
                {/if}
                <FbTableCell
                  className={selectedTableTarget?.kind === 'cell' && selectedTableTarget.tableId === component.id && selectedTableTarget.rowIndex === rowIndex && selectedTableTarget.columnIndex === columnIndex ? 'fb-composer-table-selected' : ''}
                  style="min-width: 6rem;"
                  onclick={(event) => { event.stopPropagation(); selectTableCell(component.id, rowIndex, columnIndex); }}
                >
                  {#if templates[columnIndex]}
                    {@render renderTableCellTemplate(templates[columnIndex], component.id, columnIndex, rowIndex, tableRowScope(row, rowIndex))}
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
                  ondragover={handleTableColumnDragOver}
                  ondrop={(event) => handleTableColumnDrop(event, component.id, columns.length)}
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
      {@const checked = isChoiceChecked(component)}
      {#if isReadOnlyPreview}
        <div class="preview-choice-readonly">
          <div class="preview-choice-readonly-label"><span aria-hidden="true">•</span><span>{controlLabel(component)}</span></div>
          {#if (component.children || []).filter(componentHasRoVData).length > 0}
            {@render renderChildren(component)}
          {/if}
        </div>
      {:else}
        <label class="preview-choice fb-radio-checkbox-item"><input type="radio" name={choiceGroupName(component)} checked={checked} onchange={(event) => setChoiceChecked(component, event.currentTarget.checked)} /> <span>{controlLabel(component)}</span>{@render requiredMark(component)}</label>
        {@render renderChildren(component)}
      {/if}
    {:else if component.type === 'fbCheck'}
      {@const checked = isChoiceChecked(component)}
      {#if isReadOnlyPreview}
        <div class="preview-choice-readonly">
          <div class="preview-choice-readonly-label"><span aria-hidden="true">•</span><span>{controlLabel(component)}</span></div>
          {#if (component.children || []).filter(componentHasRoVData).length > 0}
            {@render renderChildren(component)}
          {/if}
        </div>
      {:else}
        <label class="preview-choice fb-radio-checkbox-item"><input type="checkbox" checked={checked} onchange={(event) => setChoiceChecked(component, event.currentTarget.checked)} /> <span>{controlLabel(component)}</span>{@render requiredMark(component)}</label>
        {@render renderChildren(component)}
      {/if}
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
    {:else if isReadOnlyPreview && ['fbTextArea', 'fbTextInput', 'fbDropdown', 'fbSmartDropdown', 'fbNumberInput', 'fbNumberInputWithUnits', 'fbDateExact', 'fbDatePartial', 'fbTime', 'fbMSISelector', 'fbSCTProcedure', 'fbSCTDiagnosis'].includes(component.type)}
      <FbReadOnly
        label={component.label || ''}
        value={previewValue(component)}
        lookupTable={component.type === 'fbDropdown' || component.type === 'fbSmartDropdown' ? optionLookup(component) : undefined}
        units={component.type === 'fbNumberInputWithUnits' ? component.units || 'units' : ''}
        coded={codedValue(component)}
        bigLabel={!!component.bigLabel}
        boldLabel={!!component.boldLabel}
        preserveGridSpace
      />
      {#if component.type === 'fbDropdown' || component.type === 'fbSmartDropdown'}
        {@render renderChildren(component)}
      {/if}
    {:else if component.type === 'fbTextArea'}
      {@render editableLabel(component)}
      <FbTextArea
        id={component.id}
        name={component.key || component.id}
        placeholder={component.placeholder || ''}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        fullWidth={component.fullWidth}
        readonly={isReadOnlyPreview}
        subfield={componentLabelIsSubfield(component)}
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
        subfield={componentLabelIsSubfield(component)}
        onChange={(value) => setPreviewValue(component.id, value)}
      />
    {:else if component.type === 'fbDropdown'}
      {@render editableLabel(component)}
      <FbDropdown
        id={component.id}
        name={component.key || component.id}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        options={component.options || []}
        required={false}
        readonly={isReadOnlyPreview}
        fullWidth={component.fullWidth}
        noWidthConstraint={component.noWidthConstraint}
        subfield={componentLabelIsSubfield(component)}
        onChange={(value) => setPreviewValue(component.id, value)}
      />
      {@render renderChildren(component)}
    {:else if component.type === 'fbSmartDropdown'}
      <FbSmartDropdown
        label={component.label || ''}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        options={component.options || []}
        placeholder={component.placeholder || 'Type here to search'}
        fullWidth={component.fullWidth}
        noWidthConstraint={component.noWidthConstraint}
        readonly={isReadOnlyPreview}
        subfield={componentLabelIsSubfield(component)}
        onChange={(value) => setPreviewValue(component.id, value)}
      />
      {@render renderChildren(component)}
    {:else if component.type === 'fbReadOnly'}
      <FbReadOnly
        label={component.label || ''}
        value={previewValues[component.id] ?? component.defaultValue ?? 'Read only value'}
        units={component.units || ''}
        bigLabel={!!component.bigLabel}
        boldLabel={!!component.boldLabel}
        preserveGridSpace
      />
    {:else if component.type === 'fbDateHeightWeightBMIRow'}
      <FbDateHeightWeightBMIRow
        dateRecorded={previewValues[`${component.id}-dateRecorded`] || ''}
        heightCm={previewValues[`${component.id}-heightCm`] || ''}
        weightKg={previewValues[`${component.id}-weightKg`] || ''}
        readonly={isReadOnlyPreview}
        onDateRecordedChange={(value) => setPreviewValue(`${component.id}-dateRecorded`, value)}
        onHeightCmChange={(value) => setPreviewValue(`${component.id}-heightCm`, value)}
        onWeightKgChange={(value) => setPreviewValue(`${component.id}-weightKg`, value)}
      />
    {:else if component.type === 'fbNotificationTypeGroup'}
      <FbNotificationTypeGroup
        value={previewValues[component.id] ?? component.defaultValue ?? 'inpatient-ed-non-specialist'}
        readonly={isReadOnlyPreview}
        onChange={(value) => setPreviewValue(component.id, value)}
        subfield={componentLabelIsSubfield(component)}
      />
    {:else if component.type === 'fbNumberInput' || component.type === 'fbNumberInputWithUnits'}
      {@render editableLabel(component)}
      <FbNumberInput
        id={component.id}
        name={component.key || component.id}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        units={component.type === 'fbNumberInputWithUnits' ? component.units || 'units' : ''}
        placeholder={component.placeholder || ''}
        required={false}
        readonly={isReadOnlyPreview}
        subfield={componentLabelIsSubfield(component)}
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
      {#if component.type === 'fbDateExact'}
        <FbDateExact
          name={component.key || component.id}
          value={previewValues[component.id] ?? component.defaultValue ?? ''}
          required={false}
          readonly={isReadOnlyPreview}
          onChange={(value) => setPreviewValue(component.id, value)}
        />
      {:else}
        <FbDatePartial
          name={component.key || component.id}
          value={previewValues[component.id] ?? component.defaultValue ?? ''}
          placeholder={component.placeholder || 'dd-Mmm-yyyy'}
          required={false}
          readonly={isReadOnlyPreview}
          onChange={(value) => setPreviewValue(component.id, value)}
        />
      {/if}
    {:else if component.type === 'fbTime'}
      {@render editableLabel(component)}
      <FbTime
        id={component.id}
        name={component.key || component.id}
        value={previewValues[component.id] ?? component.defaultValue ?? ''}
        required={false}
        readonly={isReadOnlyPreview}
        subfield={componentLabelIsSubfield(component)}
        onChange={(value) => setPreviewValue(component.id, value)}
      />
    {:else if component.type === 'fbMSISelector' || component.type === 'fbSCTProcedure' || component.type === 'fbSCTDiagnosis'}
      {@render editableLabel(component)}
      {#if component.type === 'fbMSISelector'}
        <FbMSISelector
          id={component.id}
          name={component.key || component.id}
          value={previewValues[component.id] ?? component.defaultValue ?? ''}
          placeholder={component.placeholder || 'Type to search staff index'}
          required={false}
          readonly={isReadOnlyPreview}
          coded={previewCoded[component.id]}
          subfield={componentLabelIsSubfield(component)}
          onChange={(value, coded, nadexId) => setPreviewValueWithCoding(component.id, value, coded, nadexId)}
        />
      {:else if component.type === 'fbSCTDiagnosis'}
        <FbSCTDiagnosis
          id={component.id}
          name={component.key || component.id}
          value={previewValues[component.id] ?? component.defaultValue ?? ''}
          placeholder={component.placeholder || 'Type to search SNOMED CT'}
          required={false}
          readonly={isReadOnlyPreview}
          coded={previewCoded[component.id]}
          subfield={componentLabelIsSubfield(component)}
          onChange={(value, coded) => setPreviewValueWithCoding(component.id, value, coded)}
        />
      {:else}
        <FbSCTProcedure
          id={component.id}
          name={component.key || component.id}
          value={previewValues[component.id] ?? component.defaultValue ?? ''}
          placeholder={component.placeholder || 'Type to search SNOMED CT'}
          required={false}
          readonly={isReadOnlyPreview}
          coded={previewCoded[component.id]}
          subfield={componentLabelIsSubfield(component)}
          onChange={(value, coded) => setPreviewValueWithCoding(component.id, value, coded)}
        />
      {/if}
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
    {#if !composerUnlocked}
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
            bind:this={leftPreviewElement}
            role="button"
            tabindex="0"
            onscroll={() => schedulePrefsSave()}
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
          <FbButton type="button" variant="primary" class="fb-bottom-control-btn-rov" style="margin-left: 0.2rem; padding: 0 0.5rem" onclick={() => (isReadOnlyPreview = !isReadOnlyPreview)}>
            {isReadOnlyPreview ? 'EV' : 'RoV'}
          </FbButton>
        </div>
      </section>
    {/if}

      <FbcPanel>
        <div slot="header">
          <div class="panel-title">formBuilder2</div>
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
                    }
                  }}
                >
                  {part.label}
                </button>
              {/each}
            </FbcBreadcrumbs>
            <hr class="panel-header-rule" />
            {#if !showingDesignList}
              <FbcOptions>
                <label><FbcpCheck checked={showRowsAndCellsInBreadcrumbs} onChange={(checked) => (showRowsAndCellsInBreadcrumbs = checked)} /> Show rows and cells in breadcrumbs</label>
                <label><FbcpCheck checked={showSelectedPurpleBoxes} onChange={(checked) => (showSelectedPurpleBoxes = checked)} /> Show selected purple boxes</label>
                <label><FbcpCheck checked={showAllPurpleBoxes} onChange={(checked) => (showAllPurpleBoxes = checked)} /> Show all purple boxes</label>
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
                    <tr><th scope="row">Type</th><td><FbcpDropdown value={propertyComponent.type} options={propertyTypeChoices.map((type) => ({ value: type, label: typeLabels[type] || type }))} onChange={(value) => updatePropertyComponent({ type: value, label: propertyComponent.label || componentLabel(value) })} /></td></tr>
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
                    {#if propertyComponent.type === 'fbNumberInputWithUnits' || propertyComponent.type === 'fbReadOnly'}
                      <tr><th scope="row">Units</th><td><FbcpTextInput value={propertyComponent.units || ''} onInput={(value) => updatePropertyComponent({ units: value })} /></td></tr>
                    {/if}
                    {#if propertyComponent.type === 'fbReadOnly'}
                      <tr><th scope="row">Big label</th><td><FbcpCheck checked={!!propertyComponent.bigLabel} onChange={(checked) => updatePropertyComponent({ bigLabel: checked })} /></td></tr>
                      <tr><th scope="row">Bold label</th><td><FbcpCheck checked={!!propertyComponent.boldLabel} onChange={(checked) => updatePropertyComponent({ boldLabel: checked })} /></td></tr>
                    {/if}
                    {#if propertyComponent.type === 'fbSubqForOption'}
                      <tr><th scope="row">Option</th><td>
                        {#if selectedParent?.options?.length}
                          <FbcpDropdown value={propertyComponent.optionValue || ''} options={selectedParent.options.map((option) => ({ value: option.value, label: option.label || option.value }))} onChange={(value) => updatePropertyComponent({ optionValue: value })} />
                        {:else}
                          <FbcpTextInput value={propertyComponent.optionValue || ''} onInput={(value) => updatePropertyComponent({ optionValue: value })} />
                        {/if}
                      </td></tr>
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
                    {#if propertyComponent.type === 'fbTextArea' || propertyComponent.type === 'fbDropdown' || propertyComponent.type === 'fbSmartDropdown'}
                      <tr><th scope="row">Full width</th><td><FbcpCheck checked={!!propertyComponent.fullWidth} onChange={(checked) => updatePropertyComponent({ fullWidth: checked })} /></td></tr>
                    {/if}
                    {#if propertyComponent.type === 'fbDropdown' || propertyComponent.type === 'fbSmartDropdown'}
                      <tr><th scope="row">No width constraint</th><td><FbcpCheck checked={!!propertyComponent.noWidthConstraint} onChange={(checked) => updatePropertyComponent({ noWidthConstraint: checked })} /></td></tr>
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
                    {#if propertyComponent.type === 'fbDropdown' || propertyComponent.type === 'fbSmartDropdown'}
                      <tr><th scope="row">Options</th><td><FbcpTextarea value={selectedOptionsDraft} onInput={(value) => selectedOptionsDraft = value} onBlur={updateSelectedOptions} placeholder="value|Label" /></td></tr>
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
              <div class="fbc-action-button-stack">
                {#if selectedSeparator}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component here', componentTypesForSeparator(selectedSeparator!), 'separator')}>Add component here</FbcButton>
                  {#if selectedSeparatorDeleteTarget}
                    <FbcButton
                      fullWidth
                      danger
                      onClick={() => actionModal = {
                        title: selectedSeparatorDeleteTarget!.buttonLabel,
                        deleteTarget: 'separatorParent',
                        deleteTargetId: selectedSeparatorDeleteTarget!.id,
                        deleteTargetLabel: selectedSeparatorDeleteTarget!.label,
                        deleteTargetSelectId: selectedSeparatorDeleteTarget!.selectId,
                      }}
                    >{selectedSeparatorDeleteTarget.buttonLabel}</FbcButton>
                  {/if}
                {:else if selectedTableTarget?.kind === 'header' && selectedComponent?.type === 'fbTable'}
                  <FbcButton fullWidth onClick={() => runAction(() => addTableColumn(selectedTableTarget!.tableId, selectedTableTarget!.columnIndex + 1))}>Add column to right</FbcButton>
                  {#if tableColumns(selectedComponent).length > 1}
                    <FbcButton fullWidth danger onClick={() => runAction(() => deleteTableColumn(selectedTableTarget!.tableId, selectedTableTarget!.columnIndex))}>Delete column</FbcButton>
                  {/if}
                {:else if selectedTableTarget?.kind === 'row' && selectedComponent?.type === 'fbTable'}
                  {#if tableRows(selectedComponent).length > 1}
                    <FbcButton fullWidth danger onClick={() => runAction(() => deleteTableRow(selectedTableTarget!.tableId, selectedTableTarget!.rowIndex))}>Delete row</FbcButton>
                  {/if}
                {:else if selectedTableTarget?.kind === 'cell' && selectedComponent?.type === 'fbTable'}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component here', questionTypes, 'tableCell')}>Add component here</FbcButton>
                {:else if selectedTableTarget?.kind === 'separator' && selectedComponent?.type === 'fbTable'}
                  <FbcButton fullWidth onClick={() => runAction(() => addTableColumn(selectedTableTarget!.tableId, selectedTableTarget!.separatorIndex))}>Add column here</FbcButton>
                {:else if !selectedComponent}
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbSection', 'form'))}>Add section to form</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbGridRow', 'form'))}>Add Grid row to form</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add single component to form', formOrSectionComponentTypes, 'add', 'form')}>Add single component to form</FbcButton>
                  <FbcButton fullWidth danger onClick={() => actionModal = { title: 'Delete form', deleteTarget: 'form' }}>Delete</FbcButton>
                {:else if selectedComponent.type === 'fbSection'}
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbGridRow', selectedId))}>Add Grid row to section</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add single component to section', formOrSectionComponentTypes, 'add', selectedId)}>Add single component to section</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => insertAfterSelected(makeComponent('fbSection')))}>Add another section</FbcButton>
                {:else if selectedComponent.type === 'fbGridRow'}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component at end of row', questionTypes, 'rowEnd', selectedId)}>Add component at end of row</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add a single question below this row', questionTypes, 'singleBelowRow')}>Add a single question below this row</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponentBelow('fbGridRow'))}>Add another row of questions below this row</FbcButton>
                {:else if selectedComponent.type === 'fbGridCell'}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component to right', questionTypes, 'right')}>Add component to right</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component below', questionTypes, 'cellBelow')}>Add component below</FbcButton>
                {:else if selectedParent?.type === 'fbGridCell'}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component to right', questionTypes, 'right')}>Add component to right</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component below', questionTypes, 'componentBelow')}>Add component below</FbcButton>
                {:else if selectedComponent.type === 'fbGroup'}
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbRadio', selectedId))}>Add radiobutton to group</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbCheck', selectedId))}>Add check box to group</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component below', questionTypes, 'below')}>Add component below</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponentBelow('fbGridRow'))}>Add a row of questions below</FbcButton>
                {:else if selectedComponent.type === 'fbRadio'}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add a subquestion', questionTypes, 'add', selectedId)}>Add a subquestion</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbInverseSubq', selectedId))}>Add an inverse subcomponent</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponentBelow('fbRadio'))}>Add another radiobutton below</FbcButton>
                {:else if selectedComponent.type === 'fbCheck'}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add a subquestion', questionTypes, 'add', selectedId)}>Add a subquestion</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbInverseSubq', selectedId))}>Add an inverse subcomponent</FbcButton>
                  <FbcButton fullWidth onClick={() => runAction(() => addComponentBelow('fbCheck'))}>Add another check box below</FbcButton>
                {:else if selectedComponent.type === 'fbDropdown' || selectedComponent.type === 'fbSmartDropdown'}
                  <FbcButton fullWidth onClick={() => runAction(() => addComponent('fbSubqForOption', selectedId))}>Add an option subquestion</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component below', questionTypes, 'below')}>Add component below</FbcButton>
                {:else}
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component to right', questionTypes, 'right')}>Add component to right</FbcButton>
                  <FbcButton fullWidth onClick={() => openActionPalette('Add component below', questionTypes, 'below')}>Add component below</FbcButton>
                {/if}
                {#if canRemoveEnclosingRowAndCell}
                  <FbcButton fullWidth onClick={() => runAction(removeEnclosingRowAndCell)}>Remove enclosing row and cell components</FbcButton>
                {/if}
                {#if selectedComponent}
                  <FbcButton fullWidth danger onClick={() => actionModal = { title: 'Delete component', deleteTarget: 'component' }}>Delete selected component</FbcButton>
                {/if}
              </div>
              <FbcModal title={actionModal?.title || ''} visible={Boolean(actionModal)} onBack={() => actionModal = null} backLabel={actionModal?.deleteTarget ? 'Cancel' : 'Back'}>
                {#if actionModal?.types}
                  <div class="fbc-action-button-stack">
                    {#each actionModal.types as type}
                      <FbcButton fullWidth onClick={() => runModalPaletteAction(type)}>{typeLabels[type] || type}</FbcButton>
                    {/each}
                  </div>
                {:else if actionModal?.deleteTarget}
                  <FbcButton fullWidth danger onClick={runDeleteAction}>
                    {#if actionModal.deleteTarget === 'form'}
                      Confirm delete form
                    {:else if actionModal.deleteTarget === 'separatorParent'}
                      Confirm delete {actionModal.deleteTargetLabel}
                    {:else}
                      Confirm delete component
                    {/if}
                  </FbcButton>
                {/if}
              </FbcModal>
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
                saveState={saveButtonState}
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
    <ComposerJsonModal bind:jsonText {jsonError} {loading} onApplySave={() => applyJson(true)} onCancel={() => { showJson = false; syncJson(); }} />
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 1rem;
    min-height: 8.8rem;
    padding: 0.4rem 0.4rem 0.2rem 0.4rem;
    border-bottom: 0.2rem solid var(--fb-blue);
    box-sizing: border-box;
  }

  .composer-preview-header h1 {
    margin: 0;
    color: black;
    font-size: 2rem;
    font-weight: 500;
    outline: none;
    padding: 0.1rem;
    border: 0.1rem solid transparent;
    width: auto;
    min-height: 2.4rem;
  }

  .composer-preview-header h1.form-selected-title {
    border-color: purple;
  }

  .composer-preview-addressograph {
    min-width: 22rem;
    justify-self: end;
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
    margin: 0.15rem 0;
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
    height: auto;
  }

  :global(.fb-composer-table-header-label:focus),
  :global(.fb-composer-table-header-label:focus-visible) {
    outline: none;
    box-shadow: none;
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

  .preview-label.plain-override,
  .preview-label.subquestion-label,
  .preview-label.read-only-group-label {
    font-weight: 300;
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
    padding: 0;
    margin: 0;
    font-weight: 300;
  }

  .preview-choice-readonly {
    margin: 0 0 0 0.4rem;
    font-weight: 500;
    white-space: pre-line;
    line-height: 1.2;
  }

  .preview-choice-readonly-label {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .preview-choice + .preview-children,
  .preview-choice-readonly .preview-children,
  .preview-subq-for-option {
    margin-left: 1.5rem;
  }

  .preview-inverse-subq {
    margin-left: 0;
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

  .preview-boxed :global([contenteditable]:focus),
  .preview-boxed :global([contenteditable]:focus-visible) {
    outline: none;
    box-shadow: none;
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
    top: -0.35rem;
    left: -0.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    border: 0.1rem solid white;
    padding: 0;
    background: purple;
    cursor: grab;
    z-index: 2;
  }

  .fb-composer-table-column-drag-handle .material-icons {
    color: white;
    font-size: 1rem;
    line-height: 1;
    pointer-events: none;
  }

  .table-drag-icon {
    color: var(--fb-blue);
    cursor: grab;
    font-size: 1.2rem;
    line-height: 1;
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

  .fbc-action-button-stack {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0.35rem 0.4rem 0 0.4rem;
  }

  .composer-panel-button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.45rem;
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
    margin: 0.5rem 0;
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

  @media (max-width: 900px) {
    .svelte-composer-body {
      grid-template-rows: minmax(0, 1fr) minmax(14rem, 42vh);
      grid-template-columns: 1fr;
    }

    .composer-preview-header {
      grid-template-columns: 1fr;
      align-items: start;
      row-gap: 0.35rem;
      min-height: auto;
    }

    .composer-preview-addressograph {
      min-width: 0;
      max-width: 100%;
      justify-self: start;
    }

    .composer-preview-workspace {
      grid-template-columns: 1fr;
    }

    .composer-preview-nav {
      display: none;
    }

    .composer-preview-bottom-bar {
      flex-wrap: wrap;
    }

    :global(.fbc-panel) {
      min-height: 0;
      border-left: 0;
      border-top: 0.1rem solid black;
    }
  }
</style>
