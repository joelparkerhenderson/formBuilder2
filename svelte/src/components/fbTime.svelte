<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let required = false;
  export let valueError = '';
  export let tooltip = '';
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};

  const dispatch = createEventDispatcher<{ change: string }>();

  function emitValue(nextValue: string) {
    value = nextValue;
    onChange(value);
    change(value);
    dispatch('change', value);
  }
</script>

<FbQuestion {label} {required} {valueError} {tooltip}>
  <input
    type="time"
    {id}
    {name}
    value={value || ''}
    oninput={(event) => emitValue((event.currentTarget as HTMLInputElement).value)}
  />
</FbQuestion>

<style>
  input {
    width: 100%;
    max-width: 10rem;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.3rem 0.5rem;
    box-sizing: border-box;
    font-size: 1rem;
  }
</style>
