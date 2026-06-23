<script lang="ts">
  export let title: {
    kicker: string;
    title: string;
    details?: unknown;
    titleStyle?: string;
    detailsStyle?: string;
  };
</script>

<header class="fbcnt-header">
  <div class="title-block">
    <div class="kicker">{title.kicker}</div>
    <h1 style={title.titleStyle || ''}>{title.title}</h1>
    {#if title.details}
      <div class="title-details" style={title.detailsStyle || ''}>{title.details}</div>
    {/if}
  </div>
  <div class="header-right"><slot name="right" /></div>
</header>

<style>
  .fbcnt-header {
    background-color: white;
    border-bottom: 0.2rem solid #1b6ec2;
    padding: 0 0.8rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 4.2rem;
    gap: 1rem;
  }

  .title-block {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .kicker {
    font-size: 1rem;
    font-weight: 300;
    color: #333;
    line-height: 1.1;
  }

  h1 {
    font-size: 2rem;
    font-weight: 500;
    margin: 0;
    color: #333;
    line-height: 1.05;
  }

  .title-details {
    margin-top: 0.2rem;
    font-size: 0.9rem;
    font-weight: 300;
    color: #333;
    line-height: 1.05;
  }

  .header-right {
    font-weight: 500;
    color: #333;
  }
</style>
