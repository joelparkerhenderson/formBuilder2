<script lang="ts">
  import type { CntUser } from './cntStore';

  export let user: CntUser | undefined = undefined;
</script>

{#if user}
  <div class="user-header">
    {user.surname.toUpperCase()}, {user.firstNames}, {user.title} (NADEX:{user.nadexId}), {user.role}, {user.facility}
  </div>
{/if}

<style>
  .user-header {
    font-size: 1rem;
    font-weight: 500;
    color: #333;
  }
</style>
