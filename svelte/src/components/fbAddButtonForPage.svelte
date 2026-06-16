<script lang="ts">
  export let label = '';
  export let id = '';
  export let onClick: () => void = () => {};
</script>

<button type="button" {id} class="fb-add-button-for-page" onclick={onClick}>{label}</button>

<style>
  .fb-add-button-for-page {
    height: 2rem;
    line-height: 1.8rem;
    padding: 0 0.8rem;
    border: 0.2rem solid var(--fb-blue);
    border-radius: 0.4rem;
    background: white;
    color: var(--fb-blue);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .fb-add-button-for-page:hover,
  .fb-add-button-for-page:focus {
    border-color: black;
    background: var(--fb-active-darker-yellow);
    color: black;
  }
</style>
