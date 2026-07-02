<script lang="ts">
  import FbDateExact from './fbDateExact.svelte';
  import FbGridCell from './fbGridCell.svelte';
  import FbGridRow from './fbGridRow.svelte';
  import FbNumberInput from './fbNumberInput.svelte';
  import FbQuestion from './fbQuestion.svelte';
  import FbReadOnly from './fbReadOnly.svelte';
  import FbToolTip from './fbToolTip.svelte';
  import { calculateBmi } from '../lib/bmi';

  export let dateRecorded = '';
  export let heightCm = '';
  export let weightKg = '';
  export let onDateRecordedChange: (value: string) => void = () => {};
  export let onHeightCmChange: (value: string) => void = () => {};
  export let onWeightKgChange: (value: string) => void = () => {};

  $: bmi = calculateBmi(heightCm, weightKg);
</script>

<FbGridRow cols={4}>
  <FbGridCell>
    <FbQuestion label="Date recorded" subfield>
      <FbDateExact name="dateRecorded" value={dateRecorded} onChange={onDateRecordedChange} />
    </FbQuestion>
  </FbGridCell>
  <FbGridCell>
    <FbNumberInput label="Height" name="heightCm" value={heightCm} units="cm" subfield onChange={onHeightCmChange} />
  </FbGridCell>
  <FbGridCell>
    <FbNumberInput label="Weight" name="weightKg" value={weightKg} units="kg" subfield onChange={onWeightKgChange} />
  </FbGridCell>
  <FbGridCell>
    <FbToolTip text="This BMI calculation is not validated or certified for clinical use" as="div">
      <div class="fb-bmi-display">
        <FbReadOnly label="Uncertified calculated BMI (kg/m2)" value={bmi === null ? '' : String(bmi)} preserveGridSpace bigLabel />
      </div>
    </FbToolTip>
  </FbGridCell>
</FbGridRow>

<style>
  :global(.fb-bmi-display .fb-read-only-label) {
    font-size: 1rem;
  }
</style>
