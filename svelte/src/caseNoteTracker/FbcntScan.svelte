<script lang="ts">
  import FbButton from '../components/fbButton.svelte';

  export let value = '';
  export let onChange: (value: string) => void = () => {};
  export let onOpen: () => void = () => {};
  export let onRfid: () => void = () => {};
  export let onCameraScan: () => void = () => {};
</script>

<section class="scan-bar" aria-label="Scan or enter identifier">
  <input
    value={value}
    oninput={(event) => onChange((event.currentTarget as HTMLInputElement).value)}
    onkeydown={(event) => {
      if (event.key === 'Enter') onOpen();
    }}
    placeholder="Scan NHS number, hospital number, volume barcode, RFID, batch or location"
  />
  <FbButton variant="primary" onClick={onOpen}>Open</FbButton>
  <button type="button" class="rfid-button" onclick={onRfid}>RFID</button>
  <FbButton variant="primary" onClick={onCameraScan}>Camera scan</FbButton>
</section>

<style>
  .scan-bar {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  input {
    flex: 1;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.45rem;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
  }

  .rfid-button {
    background-color: #8cd2e7;
    color: black;
    border: 0.2rem solid #fd8a10;
    border-radius: 0.4rem;
    padding: 0.35rem 1rem;
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    cursor: pointer;
  }
</style>
