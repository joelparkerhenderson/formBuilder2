<script lang="ts">
  type Props = {
    value?: string;
    disabled?: boolean;
    id?: string;
    class?: string;
    onChange?: (value: string) => void;
  };

  let { value = $bindable('demoUser'), disabled = false, id = 'username-input', class: className = 'fb-bottom-control-username', onChange }: Props = $props();
  let hovering = $state(false);
  let focusing = $state(false);

  const inputStyle = $derived([
    'display: inline-block',
    'height: 2rem',
    'line-height: 2rem',
    'width: 9rem',
    'box-sizing: border-box',
    'border: 0.1rem solid silver',
    'border-radius: 0.4rem',
    'padding: 0 0.5rem',
    "font-family: 'Roboto', sans-serif",
    'font-size: 1rem',
    'font-weight: 400',
    'color: black',
    `background-color: ${hovering || focusing ? '#fee715' : 'white'}`,
    'outline: none',
    'transition: background-color 0.2s ease, border-color 0.2s ease'
  ].join('; '));

  function handleInput(event: Event) {
    const nextValue = (event.currentTarget as HTMLInputElement).value;
    value = nextValue;
    onChange?.(nextValue);
  }
</script>

<input
  class={`${className} fb-username-input`.trim()}
  {id}
  name="username"
  type="text"
  placeholder="Enter username"
  {disabled}
  bind:value
  oninput={handleInput}
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  onfocus={() => (focusing = true)}
  onblur={() => (focusing = false)}
  style={inputStyle}
  aria-label="User id"
  data-lily-reference-component="text-input"
/>
