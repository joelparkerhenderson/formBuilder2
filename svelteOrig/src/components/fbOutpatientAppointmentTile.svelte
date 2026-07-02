<script lang="ts">
  export let dateTime = '';
  export let clinicName = '';
  export let speciality = '';
  export let src = '';
</script>

<div class="fb-record-tile">
  <div class="fb-tooltip-field" title="Appointment Date & Time">{dateTime}</div>
  <div class="fb-record-tile-title">Outpatient appointment</div>
  {#if clinicName}<div class="fb-tooltip-field" title="Clinic Name">{clinicName}</div>{/if}
  {#if speciality}<div class="fb-tooltip-field" title="Speciality">{speciality}</div>{/if}
  {#if src}<div class="fb-tooltip-field" title="Senior Responsible Clinician">{src}</div>{/if}
</div>

<style>
  .fb-record-tile {
    display: flex;
    flex-direction: column;
    gap: 0;
    color: black;
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.15;
    text-align: left;
  }

  .fb-record-tile-title {
    font-weight: 500;
  }

  .fb-tooltip-field {
    width: fit-content;
  }
</style>
