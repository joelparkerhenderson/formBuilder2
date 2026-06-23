<script lang="ts">
  import FbModal from '../components/fbModal.svelte';
  import FbButton from '../components/fbButton.svelte';
  import BatchSelectedModalContent from './fbcntModalBatchSelectedContent.svelte';

  export let store: any;
  export let batches: any[] = [];
  export let selectBatch: (batchUuid: string) => void = () => {};
  export let cancel: () => void = () => {};
</script>

<FbModal title="Batch selected volumes">
  <BatchSelectedModalContent {store} {batches} {selectBatch} />
  <div class="footer"><FbButton variant="secondary" onClick={cancel}>Cancel</FbButton></div>
</FbModal>

<style>
  .footer { display: flex; justify-content: flex-end; margin-top: 1rem; }
</style>
