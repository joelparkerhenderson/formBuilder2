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
  let highlighted = false;
  $: userStyle = [
    'display: inline-block',
    'border-radius: 0.2rem',
    'padding: 0.05rem 0.2rem',
    'outline-offset: 0.1rem',
    highlighted ? 'background-color: #fee715' : ''
  ].filter(Boolean).join('; ');
</script>

{#if user}
  <FbToolTip
    as="span"
    className="fb-tooltip-user"
    text={tooltipText}
    tabindex={0}
    style={userStyle}
    onmouseenter={() => highlighted = true}
    onmouseleave={() => highlighted = false}
    onfocus={() => highlighted = true}
    onblur={() => highlighted = false}
  >
    {initials}: {user.nadexId}
  </FbToolTip>
{/if}
