<script lang="ts">
  export let id = 'username-input';
  export let value = '';
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};

  function emitValue(nextValue: string) {
    value = nextValue;
    onChange(value);
    change(value);
  }
</script>

<input
  type="text"
  {id}
  name="username"
  bind:value
  placeholder="Enter username"
  class="fb-bottom-control-username"
  oninput={(event) => emitValue((event.currentTarget as HTMLInputElement).value)}
/>

<style>
  input {
    display: inline-block;
    height: 2rem;
    line-height: 2rem;
    padding: 0 0.5rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    font-size: 1rem;
    font-weight: 400;
    color: black;
    box-sizing: border-box;
    background: white;
    outline: none;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  input:hover,
  input:focus {
    background: var(--fb-active-darker-yellow) !important;
  }
</style>
