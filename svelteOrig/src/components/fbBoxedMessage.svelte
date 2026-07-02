<script lang="ts">
  export let text = '';
  export let variant: 'warning' | 'alert' | 'info' = 'info';

  $: colour = variant === 'warning' ? 'var(--fb-orange)' : variant === 'alert' ? 'var(--fb-red)' : 'var(--fb-blue)';
  $: icon = variant === 'warning' ? 'warning' : variant === 'alert' ? 'error' : 'info';
</script>

<div class="fb-boxed-message" style={`--message-colour: ${colour};`} role={variant === 'info' ? 'note' : 'alert'}>
  <span class="material-icons" aria-hidden="true">{icon}</span>
  <div>{text}</div>
</div>

<style>
  .fb-boxed-message {
    width: 100%;
    border: 0.2rem solid var(--message-colour);
    border-radius: 0.4rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.6rem 0.8rem;
    color: var(--message-colour);
    background: white;
    font-weight: 500;
    text-align: left;
  }

  .material-icons {
    color: var(--message-colour);
    font-size: 4rem;
    line-height: 1;
    flex: 0 0 auto;
  }
</style>
