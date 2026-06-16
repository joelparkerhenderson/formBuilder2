<script lang="ts">
  export let label = 'Add';
  export let editable = false;
  export let onLabelChange: ((label: string) => void) | undefined = undefined;
  export let onClick: (() => void) | undefined = undefined;
  export let onclick: (() => void) | undefined = undefined;

  function handleClick() {
    (onclick || onClick || (() => {}))();
  }

  function commitLabel(event: FocusEvent) {
    const target = event.currentTarget as HTMLElement;
    onLabelChange?.(target.textContent?.trim() || label);
  }
</script>

<button type="button" class="fb-add-button" onclick={handleClick}>
  {#if editable}
    <span
      contenteditable="true"
      role="textbox"
      tabindex="0"
      onblur={commitLabel}
      onclick={(event) => event.stopPropagation()}
      onmousedown={(event) => event.stopPropagation()}
      onkeydown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
          event.preventDefault();
          (event.currentTarget as HTMLElement).blur();
        }
      }}
    >{label}</span>
  {:else}
    {label}
  {/if}
</button>

<style>
  .fb-add-button {
    height: 2rem;
    line-height: 1.8rem;
    padding: 0 0.8rem;
    border: 0.1rem solid #1b6ec2;
    border-radius: 0.4rem;
    background: white;
    color: #1b6ec2;
    font-size: 1rem;
    font-weight: 300;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .fb-add-button:hover,
  .fb-add-button:focus {
    border-color: black;
    background: #fee715;
    color: black;
  }
</style>
