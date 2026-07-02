<script lang="ts">
  import FbToolTip from './fbToolTip.svelte';

  export let user: {
    surname: string;
    firstNames: string;
    title: string;
    role: string;
    facility: string;
    nadexId: string;
  } | undefined = undefined;

  $: initials = user ? `${user.firstNames.charAt(0)}${user.surname.charAt(0)}`.toUpperCase() : '';
  $: tooltipText = user ? [
    `${user.surname.toUpperCase()}, ${user.firstNames}, ${user.title}`,
    user.role,
    user.facility,
    user.nadexId,
  ].join('\n') : '';
</script>

{#if user}
  <FbToolTip as="span" className="fb-tooltip-user" text={tooltipText} tabindex={0}>
    {initials}: {user.nadexId}
  </FbToolTip>
{/if}

<style>
  :global(.fb-tooltip-user) {
    display: inline-block;
    border-radius: 0.2rem;
    padding: 0.05rem 0.2rem;
    outline-offset: 0.1rem;
  }

  :global(.fb-tooltip-user:hover),
  :global(.fb-tooltip-user:focus),
  :global(.fb-tooltip-user:focus-within) {
    background-color: #fee715;
  }
</style>
