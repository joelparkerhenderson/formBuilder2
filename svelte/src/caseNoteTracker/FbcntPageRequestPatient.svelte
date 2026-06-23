<script lang="ts">
  import PatientChooser from './fbcntPatientChooser.svelte';
  export let store: any;
  export let selectPatient: (patientUuid: string) => void = () => {};
</script>

<PatientChooser {store} {selectPatient} />
