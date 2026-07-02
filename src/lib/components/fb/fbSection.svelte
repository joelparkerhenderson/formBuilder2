<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    id,
    title,
    children,
    class: className = ''
  }: {
    id: string;
    title: string;
    children: Snippet;
    class?: string;
  } = $props();
</script>

<section {id} class={`fb-section-block ${className}`.trim()}>
  <h3 class="font-bold text-white shadow-sm">{title}</h3>
  <div class="bg-white fb-section-body">
    {@render children()}
  </div>
</section>

<style>
  .fb-section-block {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.8rem;
  }

  h3 {
    background-color: rgb(27 110 194);
    color: white;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.2rem;
    padding: 0.2rem 0.2rem 0.2rem 0.4rem;
    margin: 0;
    text-transform: none;
    border-radius: 0.2rem 0.2rem 0 0;
  }

  .fb-section-body {
    padding: 0.4rem 0;
    margin-top: 0.4rem;
    margin-bottom: 0.6rem;
  }
</style>
