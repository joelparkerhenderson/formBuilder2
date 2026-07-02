<script lang="ts">
  import FbSCTSelector from './fbSCTSelector.svelte';

  let {
    id = '',
    name,
    label = '',
    value = $bindable(''),
    required = false,
    requiredForAudit = false,
    coded,
    valueError = '',
    subfield = false,
    placeholder = 'Type to search SNOMED CT',
    readonly = false,
    onChange,
    change
  }: {
    id?: string;
    name: string;
    label?: string;
    value?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    coded?: boolean;
    valueError?: string;
    subfield?: boolean;
    placeholder?: string;
    readonly?: boolean;
    onChange?: (value: string, coded: boolean) => void;
    change?: (value: string, coded: boolean) => void;
  } = $props();
</script>

<FbSCTSelector
  {id}
  {name}
  {label}
  bind:value
  {required}
  {requiredForAudit}
  {coded}
  {valueError}
  {subfield}
  {placeholder}
  {readonly}
  searchCommand="findProcedure"
  mode="procedure"
  inputClassName="fb-sct-procedure-selector-input"
  {onChange}
  {change}
/>
