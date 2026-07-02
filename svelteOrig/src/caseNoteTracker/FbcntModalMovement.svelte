<script lang="ts">
  import FbModal from '../components/fbModal.svelte';
  import FbButton from '../components/fbButton.svelte';
  import MovementModalContent from './fbcntModalMovementContent.svelte';

  export let store: any;
  export let volumes: any[] = [];
  export let mode: 'send' | 'receive' = 'send';
  export let sourceUuid = '';
  export let destinationUuid = '';
  export let setSourceUuid: (value: string) => void = () => {};
  export let setDestinationUuid: (value: string) => void = () => {};
  export let confirm: () => void = () => {};
  export let cancel: () => void = () => {};
</script>

<FbModal title={mode === 'send' ? 'Send selected volumes' : 'Receive selected volumes'}>
  <MovementModalContent {store} {volumes} {mode} {sourceUuid} {destinationUuid} {setSourceUuid} {setDestinationUuid} />
  <div class="footer"><FbButton variant="success" onClick={confirm}>Ok</FbButton><FbButton variant="secondary" onClick={cancel}>Cancel</FbButton></div>
</FbModal>

<style>
  .footer { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1rem; }
</style>
