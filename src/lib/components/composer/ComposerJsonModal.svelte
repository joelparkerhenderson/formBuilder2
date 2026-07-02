<script lang="ts">
  import FbcButton from '$lib/components/fbc/fbcButton.svelte';

  let {
    jsonText = $bindable(''),
    jsonError = '',
    loading = false,
    onApplySave,
    onCancel
  }: {
    jsonText: string;
    jsonError?: string;
    loading?: boolean;
    onApplySave: () => void;
    onCancel: () => void;
  } = $props();
</script>

<div class="json-popup-backdrop" role="presentation">
  <div class="json-popup" role="dialog" aria-modal="true" aria-labelledby="json-popup-title">
    <h2 id="json-popup-title">JSON</h2>
    <textarea class="json-editor" bind:value={jsonText} spellcheck="false"></textarea>
    {#if jsonError}<div class="composer-error">{jsonError}</div>{/if}
    <div class="composer-panel-button-row">
      <FbcButton type="button" onClick={onApplySave} disabled={loading}>OK</FbcButton>
      <FbcButton type="button" onClick={onCancel}>Cancel</FbcButton>
    </div>
  </div>
</div>

<style>
  .json-popup-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 40%);
  }

  .json-popup {
    display: flex;
    flex-direction: column;
    width: 70vw;
    height: 70vh;
    box-sizing: border-box;
    border: 0.1rem solid black;
    background: white;
    padding: 0.5rem;
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
    font-family: Consolas, 'Roboto Mono', monospace;
    font-size: 0.8rem;
  }

  .composer-panel-button-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .composer-error {
    color: #d50000;
    font-size: 0.85rem;
    margin-top: 0.4rem;
  }
</style>
