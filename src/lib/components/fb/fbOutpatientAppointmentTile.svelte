<script lang="ts">
  import FbHoverTooltipField from './fbHoverTooltipField.svelte';

  let {
    dateTime,
    clinicName,
    speciality,
    src
  }: {
    dateTime: string;
    clinicName: string;
    speciality: string;
    src: string;
  } = $props();
</script>

<div class="fb-outpatient-appointment-tile" data-lily-reference-component="description-list">
  <FbHoverTooltipField tooltipText="Appointment Date & Time">
    <div class="fb-outpatient-appointment-tile-light">{dateTime}</div>
  </FbHoverTooltipField>
  <div class="fb-outpatient-appointment-tile-title">Outpatient appointment</div>
  {#if clinicName}
    <FbHoverTooltipField tooltipText="Clinic Name">
      <div class="fb-outpatient-appointment-tile-light">{clinicName}</div>
    </FbHoverTooltipField>
  {/if}
  {#if speciality}
    <FbHoverTooltipField tooltipText="Speciality">
      <div class="fb-outpatient-appointment-tile-light">{speciality}</div>
    </FbHoverTooltipField>
  {/if}
  {#if src}
    <FbHoverTooltipField tooltipText="Senior Responsible Clinician">
      <div class="fb-outpatient-appointment-tile-light">{src}</div>
    </FbHoverTooltipField>
  {/if}
</div>

<style>
  .fb-outpatient-appointment-tile {
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: 'Roboto', sans-serif;
    color: black;
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.15;
    text-align: left;
  }

  .fb-outpatient-appointment-tile-title {
    font-weight: 500;
  }

  .fb-outpatient-appointment-tile-light {
    font-weight: 300;
  }
</style>
