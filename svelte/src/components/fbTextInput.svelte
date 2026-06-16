<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let readonly = false;
  export let subfield = false;
  export let valueError = '';
  export let tooltip = '';
  export let coded: boolean | undefined = undefined;
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};

  const dispatch = createEventDispatcher<{ change: string; codedChange: boolean }>();

  function emitValue(nextValue: string) {
    value = nextValue;
    onChange(value);
    change(value);
    dispatch('change', value);
    if (coded !== undefined) dispatch('codedChange', false);
  }
</script>

<FbQuestion {label} {required} {subfield} {valueError} {tooltip}>
  <input
    {id}
    {name}
    {placeholder}
    {readonly}
    value={value || ''}
    oninput={(event) => emitValue((event.currentTarget as HTMLInputElement).value)}
  />
</FbQuestion>

<style>
  input {
    width: 100%;
    max-width: 20rem;
    min-height: 1.8rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem 0.4rem;
    box-sizing: border-box;
    font-size: 1rem;
  }
</style>
