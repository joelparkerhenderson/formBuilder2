<script lang="ts">
  export let type: 'button' | 'submit' = 'button';
  export let disabled = false;
  export let onClick: () => void = () => {};
</script>

<button {type} {disabled} onclick={onClick}>
  <slot />
</button>

<style>
  button {
    height: auto;
    line-height: normal;
    padding: 0.15rem 0.45rem;
    border: 0.1rem solid #1b6ec2;
    border-radius: 0.25rem;
    background: #1b6ec2;
    color: white;
    font-family: 'Roboto', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
