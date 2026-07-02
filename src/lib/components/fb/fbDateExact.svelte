<script lang="ts">
  import type { Snippet } from 'svelte';
  import FbDatePartial from './fbDatePartial.svelte';

  let {
    name = '',
    value = $bindable(''),
    required = false,
    requiredForAudit = false,
    showRequiredMarkers = true,
    readonly = false,
    children,
    onChange,
    change
  }: {
    name?: string;
    value?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    showRequiredMarkers?: boolean;
    readonly?: boolean;
    children?: Snippet;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
  } = $props();
</script>

<FbDatePartial {name} bind:value {required} {requiredForAudit} {showRequiredMarkers} exactOnly={true} {readonly} {onChange} {change}>
  {#if children}{@render children()}{/if}
</FbDatePartial>
