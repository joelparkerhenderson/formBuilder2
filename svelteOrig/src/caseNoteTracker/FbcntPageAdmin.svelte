<script lang="ts">
  import FbBoxedInfo from '../components/fbBoxedInfo.svelte';
  export let store: any;
</script>

<section class="admin-page">
  <FbBoxedInfo text="Admin workflows are available to prototype CNT administrators." />
  <div class="admin-grid">
    <div><strong>{store.users?.length || 0}</strong><span>Users</span></div>
    <div><strong>{store.locations?.length || 0}</strong><span>Locations</span></div>
    <div><strong>{store.volumes?.length || 0}</strong><span>Volumes</span></div>
    <div><strong>{store.requests?.length || 0}</strong><span>Requests</span></div>
  </div>
</section>

<style>
  .admin-page { display: grid; gap: 0.8rem; }
  .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 0.8rem; }
  .admin-grid div { border: 0.1rem solid silver; border-radius: 0.4rem; padding: 0.8rem; }
  strong, span { display: block; }
</style>
