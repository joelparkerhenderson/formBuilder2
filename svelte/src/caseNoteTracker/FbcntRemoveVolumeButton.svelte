<script lang="ts">
  import type { CntVolume } from './cntStore';

  export let volume: CntVolume;
  export let onClick: () => void = () => {};

  $: volumeDescription = volume ? `${volume.temporary ? 'temporary volume' : 'volume'} ${volume.volumeNumber}` : 'volume';
</script>

<button
  type="button"
  onclick={onClick}
  aria-label={`Remove ${volumeDescription}`}
  title={`Remove ${volumeDescription}`}
>
  <span class="material-icons" aria-hidden="true">cancel</span>
</button>

<style>
  button {
    background-color: white;
    color: #d50000;
    border: 0.1rem solid transparent;
    border-radius: 50%;
    width: 1.35rem;
    height: 1.35rem;
    padding: 0;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  span {
    color: #d50000;
    font-size: 1.15rem;
    line-height: 1;
  }
</style>
