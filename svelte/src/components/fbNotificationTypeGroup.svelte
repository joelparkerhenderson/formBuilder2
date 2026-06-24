<script lang="ts">
  import FbGroup from './fbGroup.svelte';
  import FbRadio from './fbRadio.svelte';
  import FbToolTip from './fbToolTip.svelte';

  export let value = '';
  export let name = 'notificationType';
  export let subfield = false;
  export let onChange: (value: string) => void = () => {};
</script>

<FbGroup label="Notification type" {subfield}>
  <FbToolTip text="The department will contact the requester using the usual clinical communication route." as="div">
    <FbRadio {name} value="routine" checked={value === 'routine'} label="Routine notification" onChange={() => onChange('routine')} />
  </FbToolTip>
  <FbToolTip text="Use only where a prompt clinical response is needed and the request has been discussed with the receiving department." as="div">
    <FbRadio {name} value="urgent" checked={value === 'urgent'} label="Urgent notification" onChange={() => onChange('urgent')} />
  </FbToolTip>
</FbGroup>
