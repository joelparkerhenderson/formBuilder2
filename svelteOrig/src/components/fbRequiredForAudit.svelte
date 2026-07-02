<script lang="ts">
  import FbToolTip from './fbToolTip.svelte';
</script>

<FbToolTip text="Required for audit" as="span" className="fb-required-for-audit" ariaLabel="Required for audit" tabindex={0}>RfA</FbToolTip>

<style>
  :global(.fb-required-for-audit) {
    display: inline-block;
    margin-left: 0.1rem;
    padding: 0.05rem 0.2rem;
    background: var(--fb-orange);
    color: white;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    vertical-align: baseline;
    white-space: nowrap;
  }
</style>
