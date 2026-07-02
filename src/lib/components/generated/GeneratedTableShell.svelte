<script lang="ts">
  import type { Snippet } from 'svelte';
  import FbTable from '$lib/components/fb/fbTable.svelte';
  import FbTableBody from '$lib/components/fb/fbTableBody.svelte';
  import FbTableCell from '$lib/components/fb/fbTableCell.svelte';
  import FbTableHeader from '$lib/components/fb/fbTableHeader.svelte';
  import FbTableHeaderCell from '$lib/components/fb/fbTableHeaderCell.svelte';
  import FbTableRow from '$lib/components/fb/fbTableRow.svelte';

  type Column = { id: string; label: string };

  let {
    label = '',
    columns = [],
    useFullWidth = true,
    includeDragHandles = false,
    includeRowDeleteButtons = false,
    requireAtLeastOneRow = false,
    requireAtLeastOneRowText = 'Enter at least one row',
    includeAddButton = false,
    addButtonLabel = 'Add row',
    onAddRow,
    children
  }: {
    label?: string;
    columns?: Column[];
    useFullWidth?: boolean;
    includeDragHandles?: boolean;
    includeRowDeleteButtons?: boolean;
    requireAtLeastOneRow?: boolean;
    requireAtLeastOneRowText?: string;
    includeAddButton?: boolean;
    addButtonLabel?: string;
    onAddRow?: () => void;
    children?: Snippet;
  } = $props();

  const totalColumns = $derived(columns.length + (includeDragHandles ? 1 : 0) + (includeRowDeleteButtons ? 1 : 0));
</script>

{#if label}
  <div class="fb-generated-table-label">{label}</div>
{/if}
<div class="fb-generated-table-wrap">
  <FbTable style={useFullWidth ? 'width: 100%;' : 'width: auto;'}>
    <FbTableHeader>
      <FbTableRow>
        {#if includeDragHandles}<FbTableHeaderCell width="2rem" aria-label="Row drag handles" />{/if}
        {#each columns as column (column.id)}
          <FbTableHeaderCell>{column.label}</FbTableHeaderCell>
        {/each}
        {#if includeRowDeleteButtons}<FbTableHeaderCell width="2rem" aria-label="Row delete buttons" />{/if}
      </FbTableRow>
    </FbTableHeader>
    <FbTableBody>
      {#if requireAtLeastOneRow}
        <FbTableRow>
          <FbTableCell className="fb-table-required-row" style="color: #d50000; font-size: 0.8rem; font-style: italic; font-weight: 500;" colspan={totalColumns}>{requireAtLeastOneRowText}</FbTableCell>
        </FbTableRow>
      {/if}
      {@render children?.()}
    </FbTableBody>
  </FbTable>
  {#if includeAddButton}
    <div class="fb-generated-table-add-row"><button type="button" class="fb-generated-add-row-button" onclick={onAddRow}>{addButtonLabel}</button></div>
  {/if}
</div>

<style>
  .fb-generated-table-label {
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    margin: 0.3rem 0;
  }

  .fb-generated-table-wrap {
    margin-bottom: 0.6rem;
  }

  .fb-generated-table-add-row {
    margin-top: 0.4rem;
  }

  .fb-generated-add-row-button {
    background: white;
    color: #1b6ec2;
    border: 0.1rem solid #1b6ec2;
    border-radius: 0.4rem;
    height: 2rem;
    padding: 0 0.8rem;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 300;
    cursor: pointer;
  }
</style>
