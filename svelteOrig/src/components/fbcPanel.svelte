<aside class="fb-designer-panel fbc-panel">
  <div class="fbc-panel-header"><slot name="header" /></div>
  <div class="fbc-panel-body">
    <div class="fbc-panel-scroll fbc-panel-properties"><slot name="properties" /></div>
    <div class="fbc-panel-scroll fbc-panel-actions"><slot name="actions" /></div>
  </div>
  <div class="fbc-panel-footer"><slot name="footer" /></div>
</aside>

<style>
  .fbc-panel {
    border-left: 0.1rem solid black;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .fbc-panel-header {
    flex: 0 0 auto;
  }

  .fbc-panel-body {
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(14rem, 1fr) minmax(6rem, auto);
    gap: 0.5rem;
    padding-top: 0;
  }

  .fbc-panel-scroll {
    min-height: 0;
    overflow: auto;
  }

  .fbc-panel-actions {
    border-top: 0.1rem solid silver;
    padding-top: 0.5rem;
  }

  .fbc-panel-footer {
    flex: 0 0 auto;
    padding-top: 0.5rem;
  }

  @media (max-width: 900px) {
    .fbc-panel {
      border-left: 0;
      border-top: 0.1rem solid black;
    }
  }
</style>
