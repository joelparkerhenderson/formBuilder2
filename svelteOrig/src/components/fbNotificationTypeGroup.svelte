<script lang="ts">
  import FbGroup from './fbGroup.svelte';
  import FbRadio from './fbRadio.svelte';
  import FbToolTip from './fbToolTip.svelte';

  export let value = '';
  export let name = 'notificationType';
  export let subfield = false;
  export let onChange: (value: string) => void = () => {};
</script>

<FbGroup label="Notification type" required {subfield} tooltip="WCP results notifications are in pilot and are not switched on for all consultants">
  <FbToolTip text="For tests that should usually be actioned by ward doctors" as="div">
    <FbRadio {name} value="inpatient-ed-non-specialist" checked={value === 'inpatient-ed-non-specialist'} label="Inpatient / ED / non-specialist" onChange={() => onChange('inpatient-ed-non-specialist')} />
  </FbToolTip>
  <FbToolTip text="For tests that should usually be actioned by consultants" as="div">
    <FbRadio {name} value="outpatient-specialist" checked={value === 'outpatient-specialist'} label="Outpatient / specialist" onChange={() => onChange('outpatient-specialist')} />
  </FbToolTip>
  <FbRadio name={`${name}Personal`} value="personal-notification" checked={value === 'personal-notification'} label="Personal notification" onChange={() => onChange('personal-notification')} />
</FbGroup>
