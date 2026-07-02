<script lang="ts">
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbModal from '$lib/components/fb/fbModal.svelte';
  import type { CntVolume } from './cntStore';
  import FbcntSelectedVolumesReceived from './FbcntSelectedVolumesReceived.svelte';

  export let volumes: CntVolume[] = [];
  export let checkedVolumeUuids: string[] = [];
  export let toggleVolume: (volumeUuid: string) => void = () => {};
  export let onOk: () => void = () => {};
  export let onCancel: () => void = () => {};
</script>

<FbModal title="Received">
  <FbcntSelectedVolumesReceived {volumes} {checkedVolumeUuids} {toggleVolume} />
  <div class="popup-footer">
    <FbButton variant="success" onClick={onOk}>Ok</FbButton>
    <FbButton variant="danger" onClick={onCancel}>Cancel</FbButton>
  </div>
</FbModal>

<style>
  .popup-footer { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
</style>
