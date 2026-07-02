<script lang="ts">
  let {
    checked = $bindable(false),
    label = 'Final',
    class: className = '',
    disabled = false,
    onChange
  }: {
    checked?: boolean;
    label?: string;
    class?: string;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
  } = $props();

  function update(event: Event) {
    checked = (event.currentTarget as HTMLInputElement).checked;
    onChange?.(checked);
  }
</script>

<div class={`${className} ${disabled ? 'disabled' : ''}`.trim()}>
  <label class="fb-final-control-label">
    <input type="checkbox" bind:checked onchange={update} {disabled} />
    <span>{label}</span>
  </label>
</div>

<style>
  div {
    display: inline-flex;
    align-items: center;
    height: 2rem;
    margin-left: 0.2rem;
    padding: 0 0.5rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background-color: white;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    color: black;
    user-select: none;
    pointer-events: auto;
    opacity: 1;
  }

  div.disabled {
    background-color: #c0c0c0;
    color: white;
    pointer-events: none;
  }

  .fb-final-control-label {
    margin: 0;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  div.disabled .fb-final-control-label {
    cursor: not-allowed;
  }

  input {
    margin: 0;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    outline: none;
    box-shadow: none;
  }

  div.disabled input {
    cursor: not-allowed;
  }
</style>
