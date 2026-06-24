import React from 'react';
import { fbGridRow as FbGridRow } from './fbGridRow';
import { fbGridCell as FbGridCell } from './fbGridCell';
import { fbQuestion as FbQuestion } from './fbQuestion';
import { fbDateExact as FbDateExact } from './fbDateExact';
import { fbNumberInputWithUnits as FbNumberInputWithUnits } from './fbNumberInputWithUnits';
import { fbRoVField as FbRoVField } from './fbRoVField';
import { calculateBmi } from '../utils/bmi';

interface fbDateHeightWeightBMIRowProps {
  dateRecorded: string;
  heightCm: string;
  weightKg: string;
  onDateRecordedChange: (value: string) => void;
  onHeightCmChange: (value: string) => void;
  onWeightKgChange: (value: string) => void;
}

export const fbDateHeightWeightBMIRow: React.FC<fbDateHeightWeightBMIRowProps> = ({
  dateRecorded,
  heightCm,
  weightKg,
  onDateRecordedChange,
  onHeightCmChange,
  onWeightKgChange,
}) => {
  const bmi = calculateBmi(heightCm, weightKg);
  return (
    <FbGridRow cols={4}>
      <FbGridCell>
        <FbQuestion label="Date recorded" labelStyle={{ fontWeight: 300 }}>
          <FbDateExact name="dateRecorded" value={dateRecorded} onChange={onDateRecordedChange} />
        </FbQuestion>
      </FbGridCell>
      <FbGridCell>
        <FbQuestion label="Height" labelStyle={{ fontWeight: 300 }}>
          <FbNumberInputWithUnits value={heightCm} onChange={onHeightCmChange} units="cm" />
        </FbQuestion>
      </FbGridCell>
      <FbGridCell>
        <FbQuestion label="Weight" labelStyle={{ fontWeight: 300 }}>
          <FbNumberInputWithUnits value={weightKg} onChange={onWeightKgChange} units="kg" />
        </FbQuestion>
      </FbGridCell>
      <FbGridCell>
        <div title="This BMI calculation is not validated or certified for clinical use">
          <FbRoVField label="Uncertified calculated BMI (kg/m2)" value={bmi === null ? '' : String(bmi)} preserveGridSpace labelProps={{ style: { fontSize: '1rem' } }} />
        </div>
      </FbGridCell>
    </FbGridRow>
  );
};
