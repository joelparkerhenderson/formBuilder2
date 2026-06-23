<script lang="ts">
  import FbToolTip from '../components/fbToolTip.svelte';
  import type { CntUser } from './cntStore';

  export let user: CntUser;

  $: initials = user ? `${user.firstNames.charAt(0)}${user.surname.charAt(0)}`.toUpperCase() : '';
  $: tooltipText = user ? [
    `${user.surname.toUpperCase()}, ${user.firstNames}, ${user.title}`,
    user.role,
    user.facility,
    user.nadexId,
  ].join('\n') : '';
</script>

{#if user}
  <FbToolTip as="span" className="fbcnt-user-badge" text={tooltipText} tabindex={0}>
    {initials}: {user.nadexId}
  </FbToolTip>
{/if}

<style>
  :global(.fbcnt-user-badge) {
    display: inline-block;
    border-radius: 0.2rem;
    padding: 0.05rem 0.2rem;
    outline-offset: 0.1rem;
  }

  :global(.fbcnt-user-badge:hover),
  :global(.fbcnt-user-badge:focus),
  :global(.fbcnt-user-badge:focus-within) {
    background-color: #fee715;
  }
</style>
