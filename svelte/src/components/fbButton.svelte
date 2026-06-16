<script lang="ts">
  import { fbActiveDarkerYellow, fbBlack, fbBlue, fbGreen, fbRed, fbSilver, fbWhite } from '../lib/constants';

  export let type: 'button' | 'submit' = 'button';
  export let disabled = false;
  export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'yellow' | 'blue' | 'green' | 'silver' = 'primary';
  export let ariaLabel = '';
  export let onClick: () => void = () => {};

  $: normalisedVariant = variant === 'blue' ? 'primary' : variant === 'green' ? 'success' : variant === 'silver' ? 'secondary' : variant;
</script>

<button
  {type}
  {disabled}
  class:primary={normalisedVariant === 'primary'}
  class:secondary={normalisedVariant === 'secondary'}
  class:success={normalisedVariant === 'success'}
  class:danger={normalisedVariant === 'danger'}
  class:yellow={normalisedVariant === 'yellow'}
  aria-label={ariaLabel || undefined}
  onclick={onClick}
>
  <slot />
</button>

<style>
  button {
    min-height: 2rem;
    padding: 0 1rem;
    border-radius: 0.4rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }

  button:disabled {
    border: 0.1rem solid silver;
    background: #c0c0c0;
    color: white;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .primary {
    border: none;
    background: #1b6ec2;
    color: white;
  }

  .secondary {
    border: 0.1rem solid #1b6ec2;
    background: white;
    color: #1b6ec2;
  }

  .success {
    border: none;
    background: #008000;
    color: white;
  }

  .danger {
    border: none;
    background: #d50000;
    color: white;
  }

  .yellow {
    border: 0.1rem solid #111;
    background: #fee715;
    color: #111;
  }

  button:not(:disabled):hover,
  button:not(:disabled):focus {
    border-color: #111;
    background: #fee715;
    color: #111;
  }
</style>
