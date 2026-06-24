import React from 'react';
import { fbGroup as FbGroup } from './fbGroup';
import { fbRadio as FbRadio } from './fbRadio';

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
  <FbGroup label="Notification type" subfield={subfield}>
    <div title="The department will contact the requester using the usual clinical communication route.">
      <FbRadio name={name} value="routine" checked={value === 'routine'} onChange={() => onChange('routine')} label="Routine notification" />
    </div>
    <div title="Use only where a prompt clinical response is needed and the request has been discussed with the receiving department.">
      <FbRadio name={name} value="urgent" checked={value === 'urgent'} onChange={() => onChange('urgent')} label="Urgent notification" />
    </div>
  </FbGroup>
);
