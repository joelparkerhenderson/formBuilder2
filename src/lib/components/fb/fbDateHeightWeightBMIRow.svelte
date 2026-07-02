<script lang="ts">
  import FbDateExact from './fbDateExact.svelte';
  import FbGridCell from './fbGridCell.svelte';
  import FbGridRow from './fbGridRow.svelte';
  import FbNumberInputWithUnits from './fbNumberInputWithUnits.svelte';
  import FbQuestion from './fbQuestion.svelte';
  import FbReadOnly from './fbReadOnly.svelte';
  import { calculateBmi } from '$lib/utils/bmi';

  let {
    dateRecorded = $bindable(''),
    heightCm = $bindable(''),
    weightKg = $bindable(''),
    readonly = false,
    onDateRecordedChange,
    onHeightCmChange,
    onWeightKgChange
  }: {
    dateRecorded?: string;
    heightCm?: string;
    weightKg?: string;
    readonly?: boolean;
    onDateRecordedChange?: (value: string) => void;
    onHeightCmChange?: (value: string) => void;
    onWeightKgChange?: (value: string) => void;
  } = $props();

  const bmi = $derived(calculateBmi(heightCm, weightKg));
</script>

<FbGridRow cols={4}>
  <FbGridCell>
    <FbQuestion label="Date recorded" subfield>
      <FbDateExact name="dateRecorded" bind:value={dateRecorded} {readonly} onChange={onDateRecordedChange} />
    </FbQuestion>
  </FbGridCell>
  <FbGridCell>
    <FbNumberInputWithUnits label="Height" subfield bind:value={heightCm} units="cm" {readonly} onChange={onHeightCmChange} />
  </FbGridCell>
  <FbGridCell>
    <FbNumberInputWithUnits label="Weight" subfield bind:value={weightKg} units="kg" {readonly} onChange={onWeightKgChange} />
  </FbGridCell>
  <FbGridCell>
    <div title="This BMI calculation is not validated or certified for clinical use">
      <FbReadOnly label="Uncertified calculated BMI (kg/m2)" value={bmi === null ? '' : String(bmi)} preserveGridSpace bigLabel />
    </div>
  </FbGridCell>
</FbGridRow>
