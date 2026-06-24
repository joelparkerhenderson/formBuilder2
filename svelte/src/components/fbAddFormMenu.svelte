<script lang="ts">
  export let onSelectFormType: (formType: string) => void = () => {};
  export let onCancel: () => void = () => {};

  const items = [
    { value: 'outpatient_outcome', label: 'Outpatient outcome form' },
    { value: 'waiting_list', label: 'Waiting list card' },
    { value: 'treatment_summary', label: 'Treatment summary' },
    { value: 'operation_note', label: 'Operation note' },
    { value: 'cardiology_test_request', label: 'Cardiology test request' },
  ];
</script>

<button type="button" class="fb-add-menu-overlay" aria-label="Close new form menu" onclick={onCancel}></button>
<div class="fb-add-form-menu" role="menu" aria-label="New form or document">
  {#each items as item}
    <button type="button" role="menuitem" onclick={() => onSelectFormType(item.value)}>{item.label}</button>
  {/each}
  <div class="fb-add-form-menu-rule"></div>
  <button type="button" role="menuitem" onclick={onCancel}>Cancel</button>
</div>

<style>
  .fb-add-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 1999;
    border: 0;
    background: transparent;
  }

  .fb-add-form-menu {
    position: absolute;
    left: 0;
    bottom: calc(100% + 0.4rem);
    min-width: 200px;
    padding: 0.5rem;
    border: 0.2rem solid var(--fb-blue);
    border-radius: 0.4rem;
    background: white;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    z-index: 2000;
  }

  .fb-add-form-menu button {
    width: 100%;
    padding: 0.5rem;
    border: 0;
    background: white;
    cursor: pointer;
    text-align: left;
    font-size: 1rem;
    font-weight: 400;
  }

  .fb-add-form-menu button:hover,
  .fb-add-form-menu button:focus {
    background: #e3f2fd;
  }

  .fb-add-form-menu-rule {
    border-top: 0.1rem solid silver;
    margin: 0.5rem 0;
  }
</style>
