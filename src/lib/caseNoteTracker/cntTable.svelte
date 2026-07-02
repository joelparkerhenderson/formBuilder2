<script lang="ts">
  import FbTable from '$lib/components/fb/fbTable.svelte';

  let { marginTop = '' }: { marginTop?: string } = $props();

  let wrapper: HTMLDivElement | undefined;
  const wrapperStyle = $derived([
    'width: 100%',
    'overflow: auto',
    marginTop ? `margin-top: ${marginTop}` : ''
  ].filter(Boolean).join('; '));
  const headerDeclarations = {
    padding: '0.4rem',
    textAlign: 'left',
    color: '#555',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    fontWeight: '300',
    background: 'white',
    verticalAlign: 'bottom'
  };
  const cellDeclarations = {
    padding: '0.4rem',
    borderBottom: '0.1rem solid silver',
    verticalAlign: 'top',
    background: 'white'
  };

  function decorateTable() {
    if (!wrapper) return;
    for (const header of wrapper.querySelectorAll('th')) {
      Object.assign((header as HTMLElement).style, headerDeclarations);
    }
    for (const row of wrapper.querySelectorAll('tr')) {
      (row as HTMLElement).style.borderBottom = '0.1rem solid silver';
    }
    for (const cell of wrapper.querySelectorAll('td')) {
      const element = cell as HTMLElement;
      Object.assign(element.style, cellDeclarations);
      element.onmouseenter = () => {
        element.style.background = '#ffffcc';
      };
      element.onmouseleave = () => {
        element.style.background = 'white';
      };
      element.onfocusin = () => {
        element.style.background = '#ffffcc';
      };
      element.onfocusout = () => {
        element.style.background = 'white';
      };
    }
  }

  $effect(() => {
    decorateTable();
  });
</script>

<div bind:this={wrapper} class="table-wrap" style={wrapperStyle}>
  <FbTable>
    <slot />
  </FbTable>
</div>
