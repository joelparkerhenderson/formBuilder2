<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';

  interface DropdownOption {
    value: string;
    label: string;
  }

  type HbRegion = {
    key: string;
    label: string;
    colour: string;
    d: string;
    aliases: string[];
  };

  let {
    label,
    value = $bindable(''),
    options,
    required = false,
    requiredForAudit = false,
    id,
    name,
    class: className = '',
    placeholder,
    subfield = false,
    valueError = '',
    noWidthConstraint = false,
    fullWidth = false,
    children,
    onChange,
    change
  }: {
    label?: string;
    value?: string;
    options: Array<DropdownOption | string>;
    required?: boolean;
    requiredForAudit?: boolean;
    id?: string;
    name?: string;
    class?: string;
    placeholder?: string;
    subfield?: boolean;
    valueError?: string;
    noWidthConstraint?: boolean;
    fullWidth?: boolean;
    children?: Snippet;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
  } = $props();

  let showMap = $state(false);
  let wrapper: HTMLDivElement | undefined = $state();
  let selectElement: HTMLSelectElement | undefined = $state();
  let popupStyle = $state('left: 0px; top: 0px;');

  const regions: HbRegion[] = [
    {
      key: 'bae-glas',
      label: 'Bae Glas',
      colour: '#88d05f',
      d: 'M91 8 L112 5 L130 12 L136 22 L151 18 L169 29 L188 32 L206 43 L228 51 L246 70 L255 92 L248 111 L224 112 L209 126 L190 120 L175 133 L157 126 L143 139 L124 132 L111 146 L96 138 L82 151 L73 131 L81 116 L67 101 L72 82 L57 66 L64 51 L52 42 L67 31 L64 18 Z',
      aliases: ['bae glas', 'bae-glas']
    },
    {
      key: 'mynydd-y-mor',
      label: 'Mynydd Y Mor',
      colour: '#1b6ec2',
      d: 'M73 131 L82 151 L96 138 L111 146 L124 132 L143 139 L157 126 L175 133 L190 120 L209 126 L224 112 L235 123 L225 141 L231 163 L218 180 L224 202 L205 216 L197 238 L177 244 L162 228 L144 235 L130 218 L109 225 L96 206 L78 212 L68 194 L51 189 L44 167 L55 153 L50 139 L61 130 Z',
      aliases: ['mynydd y mor', 'mynydd-y-mor', 'mynydd']
    },
    {
      key: 'dyffryn-aur',
      label: 'Dyffryn Aur',
      colour: '#a49a23',
      d: 'M190 120 L209 126 L224 112 L245 119 L252 139 L242 158 L250 179 L240 198 L248 219 L236 239 L242 258 L229 276 L211 270 L197 282 L179 272 L162 282 L148 266 L130 272 L121 252 L130 218 L144 235 L162 228 L177 244 L197 238 L205 216 L224 202 L218 180 L231 163 L225 141 L235 123 L224 112 L209 126 Z',
      aliases: ['dyffryn aur', 'dyffryn-aur']
    },
    {
      key: 'cwm-hafan',
      label: 'Cwm Hafan',
      colour: '#e00000',
      d: 'M44 167 L51 189 L68 194 L78 212 L96 206 L109 225 L130 218 L121 252 L105 257 L94 273 L75 267 L62 282 L40 276 L25 288 L8 284 L3 265 L16 251 L33 250 L42 231 L33 215 L40 199 L31 181 Z',
      aliases: ['cwm hafan', 'cwm-hafan']
    },
    {
      key: 'tir-afon',
      label: 'Tir Afon',
      colour: '#fd8a10',
      d: 'M121 252 L130 272 L148 266 L162 282 L179 272 L197 282 L211 270 L229 276 L240 294 L232 315 L211 326 L194 348 L170 353 L148 345 L137 326 L116 322 L103 304 L78 300 L62 282 L75 267 L94 273 L105 257 Z',
      aliases: ['tir afon', 'tir-afon']
    }
  ];

  const parsedOptions = $derived(options.map((option) => typeof option === 'string' ? { value: option, label: option } : option));
  const mapRegions = $derived(regions.map((region) => ({ ...region, option: optionForRegion(region) })).filter((region) => region.option));

  onMount(() => {
    function closeForOutsideClick(event: MouseEvent) {
      if (!wrapper?.contains(event.target as Node)) showMap = false;
    }
    function repositionMap() {
      if (showMap) positionMapPopup();
    }
    document.addEventListener('mousedown', closeForOutsideClick);
    window.addEventListener('resize', repositionMap);
    window.addEventListener('scroll', repositionMap, true);
    return () => {
      document.removeEventListener('mousedown', closeForOutsideClick);
      window.removeEventListener('resize', repositionMap);
      window.removeEventListener('scroll', repositionMap, true);
    };
  });

  function normalise(value: string) {
    return value.toLowerCase().replace(/university|teaching|integrated|health|board/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function optionForRegion(region: HbRegion) {
    return parsedOptions.find((option) => {
      if (!option.value) return false;
      const optionText = `${normalise(option.value)} ${normalise(option.label)}`;
      return region.aliases.some((alias) => optionText.includes(normalise(alias)));
    });
  }

  function update(nextValue: string) {
    value = nextValue;
    onChange?.(nextValue);
    change?.(nextValue);
  }

  function positionMapPopup() {
    if (!selectElement) return;
    const rect = selectElement.getBoundingClientRect();
    const gap = 10;
    const popupWidth = 296;
    const popupHeight = 430;
    let left = rect.right + gap;
    if (left + popupWidth > window.innerWidth - 8) left = Math.max(8, rect.left - popupWidth - gap);
    let top = rect.top;
    if (top + popupHeight > window.innerHeight - 8) top = Math.max(8, window.innerHeight - popupHeight - 8);
    popupStyle = `left: ${left}px; top: ${top}px;`;
  }

  function openMap() {
    positionMapPopup();
    showMap = true;
  }

  function selectRegion(option: DropdownOption | undefined) {
    if (!option) return;
    update(option.value);
    showMap = false;
  }
</script>

{#snippet selectControl()}
  <div class="fb-hb-selector" bind:this={wrapper}>
    <select
      bind:this={selectElement}
      {id}
      {name}
      bind:value
      onfocus={openMap}
      onclick={openMap}
      onchange={(event) => update(event.currentTarget.value)}
      {required}
      class="w-full text-black"
      class:no-width-constraint={noWidthConstraint || fullWidth}
      data-lily-reference-component="select"
    >
      {#if placeholder !== undefined}
        <option value="">{placeholder}</option>
      {/if}
      {#each parsedOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>

    {#if showMap && mapRegions.length}
      <div class="fb-hb-map-popup" role="dialog" aria-label="Select health board from map" style={popupStyle}>
        <svg viewBox="0 0 260 360" role="img" aria-label="Low resolution map of Wales health boards">
          {#each mapRegions as region (region.key)}
            <g
              role="button"
              tabindex="0"
              class:selected={region.option?.value === value}
              aria-label={`Select ${region.option?.label || region.label}`}
              aria-pressed={region.option?.value === value}
              onkeydown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectRegion(region.option);
                }
              }}
              onclick={() => selectRegion(region.option)}
            >
              <title>{region.option?.label || region.label}</title>
              <path d={region.d} style={`fill: ${region.colour};`} />
            </g>
          {/each}
        </svg>
      </div>
    {/if}
    {#if children}{@render children()}{/if}
  </div>
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} class={className} {subfield} {valueError}>
    {@render selectControl()}
  </FbQuestion>
{:else if required || requiredForAudit}
  <div class="fb-unlabelled-required-control">
    <div>{@render selectControl()}</div>
    <span class="fb-unlabelled-required-markers">
      {#if requiredForAudit}<FbRequiredForAudit />{/if}
      {#if required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </div>
{:else}
  {@render selectControl()}
{/if}

<style>
  .fb-hb-selector {
    position: relative;
    width: 100%;
  }

  select {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-sizing: border-box;
    height: 2rem;
    padding: 0.2rem 0.4rem;
    background-color: white;
    width: 100%;
    max-width: 35rem;
  }

  select.no-width-constraint {
    max-width: none;
  }

  .fb-hb-map-popup {
    position: fixed;
    z-index: 2147483000;
    width: 18rem;
    padding: 0.4rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    box-shadow: 0 0.2rem 0.7rem rgba(0, 0, 0, 0.22);
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  g[role='button'] {
    cursor: pointer;
  }

  path {
    stroke: #ffffff;
    stroke-width: 2.4;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
    transition: filter 0.12s ease, stroke-width 0.12s ease;
  }

  g[role='button']:hover path,
  g[role='button']:focus path {
    filter: brightness(1.08);
    stroke-width: 3.4;
  }

  g[role='button'].selected path {
    filter: saturate(1.2);
  }

  .fb-unlabelled-required-control {
    display: flex;
    align-items: flex-start;
    gap: 0.2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .fb-unlabelled-required-control > div {
    flex: 1;
    width: 100%;
  }

  .fb-unlabelled-required-markers {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.1rem;
    margin-top: 0.15rem;
  }

  .fb-required-marker {
    color: #d50000;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.2rem;
    display: inline-block;
    user-select: none;
  }

  @media (max-width: 900px) {
    .fb-hb-map-popup {
      width: min(15rem, 100vw - 2rem);
    }
  }
</style>
