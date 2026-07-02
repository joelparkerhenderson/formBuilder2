<script lang="ts">
  import { fbBlue } from './cntStyles';
  export let onClick: () => void = () => {};
</script>

<button type="button" class="fbcnt-small-button" onclick={onClick}>
  <slot />
</button>

<style>
  .fbcnt-small-button {
    border: 0;
    border-radius: 0.4rem;
    background-color: #1b6ec2;
    color: white;
    padding: 0.2rem 0.44rem;
    font-family: 'Roboto', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
  }

  .fbcnt-small-button:hover,
  .fbcnt-small-button:focus {
    background-color: #fee715;
    color: black;
    outline: 0.1rem solid #111;
    outline-offset: 0.05rem;
  }
</style>
