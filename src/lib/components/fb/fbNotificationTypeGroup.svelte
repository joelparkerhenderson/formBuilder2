<script lang="ts">
  import FbGroup from './fbGroup.svelte';
  import FbCheck from './fbCheck.svelte';
  import FbRadio from './fbRadio.svelte';

  let {
    value = $bindable(''),
    name = 'notificationType',
    subfield = false,
    readonly = false,
    onChange
  }: {
    value?: string;
    name?: string;
    subfield?: boolean;
    readonly?: boolean;
    onChange?: (value: string) => void;
  } = $props();

  function setValue(nextValue: string) {
    if (readonly) return;
    value = nextValue;
    onChange?.(nextValue);
  }
</script>

<FbGroup
  label="Notification type"
  required
  {subfield}
  tooltip="WCP results notifications are in pilot and are not switched on for all consultants"
>
  <div title="For tests that should usually be actioned by ward doctors">
    <FbRadio name={name} value="inpatient-ed-non-specialist" checked={value === 'inpatient-ed-non-specialist'} disabled={readonly} onChange={() => setValue('inpatient-ed-non-specialist')} label="Inpatient / ED / non-specialist" />
  </div>
  <div title="For tests that should usually be actioned by consultants">
    <FbRadio name={name} value="outpatient-specialist" checked={value === 'outpatient-specialist'} disabled={readonly} onChange={() => setValue('outpatient-specialist')} label="Outpatient / specialist" />
  </div>
  <FbCheck
    name={`${name}Personal`}
    value="personal-notification"
    checked={value === 'personal-notification'}
    disabled={readonly}
    onChange={(checked) => setValue(checked ? 'personal-notification' : '')}
    label="Personal notification"
  />
</FbGroup>
