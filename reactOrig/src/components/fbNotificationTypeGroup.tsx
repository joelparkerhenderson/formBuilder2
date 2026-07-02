import React from 'react';
import { fbGroup as FbGroup } from './fbGroup';
import { fbRadio as FbRadio } from './fbRadio';
import { fbCheck as FbCheck } from './fbCheck';

interface fbNotificationTypeGroupProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  subfield?: boolean;
}

export const fbNotificationTypeGroup: React.FC<fbNotificationTypeGroupProps> = ({
  value,
  onChange,
  name = 'notificationType',
  subfield = false,
}) => (
  <FbGroup
    label="Notification type"
    required
    subfield={subfield}
    tooltip="WCP results notifications are in pilot and are not switched on for all consultants"
  >
    <div title="For tests that should usually be actioned by ward doctors">
      <FbRadio name={name} value="inpatient-ed-non-specialist" checked={value === 'inpatient-ed-non-specialist'} onChange={() => onChange('inpatient-ed-non-specialist')} label="Inpatient / ED / non-specialist" />
    </div>
    <div title="For tests that should usually be actioned by consultants">
      <FbRadio name={name} value="outpatient-specialist" checked={value === 'outpatient-specialist'} onChange={() => onChange('outpatient-specialist')} label="Outpatient / specialist" />
    </div>
    <FbCheck
      name={`${name}Personal`}
      value="personal-notification"
      checked={value === 'personal-notification'}
      onChange={(event) => onChange(event.currentTarget.checked ? 'personal-notification' : '')}
      label="Personal notification"
    />
  </FbGroup>
);
