<script lang="ts">
  export let title = '';
</script>

<span class="material-icons fbcnt-tag" {title} aria-label={title || 'Tagged'}>sell</span>

<style>
  .fbcnt-tag {
    color: #1b6ec2;
    background-color: white;
    font-family: 'Material Icons';
    font-size: 1rem;
    line-height: 1;
    display: inline-block;
    vertical-align: middle;
  }
</style>
