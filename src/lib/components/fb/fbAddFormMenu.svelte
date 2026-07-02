<script lang="ts">
  type FormType =
    | 'outpatient_outcome'
    | 'waiting_list'
    | 'operation_note'
    | 'treatment_summary'
    | 'cardiology_test_request';

  let {
    anchor,
    onSelectFormType,
    onCancel
  }: {
    anchor?: HTMLElement;
    onSelectFormType: (formType: FormType) => void;
    onCancel: () => void;
  } = $props();

  let menuPosition = $state({ top: 0, left: 0 });

  const options: Array<{ value: FormType; label: string }> = [
    { value: 'outpatient_outcome', label: 'Outpatient outcome form' },
    { value: 'waiting_list', label: 'Waiting list card' },
    { value: 'treatment_summary', label: 'Treatment summary' },
    { value: 'cardiology_test_request', label: 'Cardiology test request' },
    { value: 'operation_note', label: 'Operation note' }
  ];

  $effect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    menuPosition = {
      top: rect.top - 4,
      left: rect.left
    };
  });
</script>

<button class="fb-add-form-menu-overlay" type="button" aria-label="Close add form menu" onclick={onCancel}></button>

<div
  class="fb-add-form-menu"
  data-lily-reference-component="menu"
  style={`top: ${menuPosition.top}px; left: ${menuPosition.left}px;`}
>
  {#each options as option}
    <button type="button" class="fb-add-form-menu-item" onclick={() => onSelectFormType(option.value)}>
      {option.label}
    </button>
  {/each}
  <div class="fb-add-form-menu-separator"></div>
  <button type="button" class="fb-add-form-menu-item" onclick={onCancel}>Cancel</button>
</div>

<style>
  .fb-add-form-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 1999;
    border: 0;
    background: transparent;
    padding: 0;
  }

  .fb-add-form-menu {
    position: fixed;
    transform: translateY(-100%);
    background-color: white;
    border: 0.2rem solid rgb(27 110 194);
    border-radius: 0.4rem;
    padding: 0.5rem;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    z-index: 2000;
    font-family: 'Roboto', sans-serif;
    min-width: 200px;
  }

  .fb-add-form-menu-item {
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    border: none;
    background-color: white;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    transition: background-color 0.2s ease-out;
  }

  .fb-add-form-menu-item:hover,
  .fb-add-form-menu-item:focus {
    background-color: #e3f2fd;
    outline: none;
  }

  .fb-add-form-menu-separator {
    border-top: 1px solid silver;
    margin: 0.5rem 0;
  }
</style>
