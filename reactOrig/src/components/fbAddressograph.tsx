import React from 'react';

interface AddressographProps {
  patient?: Partial<{
    nhsNumber: string;
    nhs_number: string;
    surname: string;
    forenames: string;
    title: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    addressLine4: string;
    address_line1: string;
    address_line2: string;
    address_line3: string;
    address_line4: string;
    address_line_1: string;
    address_line_2: string;
    address_line_3: string;
    address_line_4: string;
    hospitalNumber: string;
    hospital_number: string;
    crn: string;
    dateOfBirth: string | Date;
    date_of_birth: string | Date;
    sex: string;
  }>;
  nhsNumber?: string;
  surname?: string;
  forenames?: string;
  title?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  hospitalNumber?: string;
  /** @deprecated Use hospitalNumber internally; crn is accepted as a legacy synonym. */
  crn?: string;
  dateOfBirth?: string | Date;
  sex?: string;
}

export const fbAddressograph: React.FC<AddressographProps> = ({
  patient,
  nhsNumber,
  surname,
  forenames,
  title,
  addressLine1,
  addressLine2,
  addressLine3,
  addressLine4,
  hospitalNumber,
  crn,
  dateOfBirth,
  sex
}) => {
  const resolved = {
    nhsNumber: nhsNumber ?? patient?.nhsNumber ?? patient?.nhs_number ?? '123 456 7890',
    surname: surname ?? patient?.surname ?? 'DUCK',
    forenames: forenames ?? patient?.forenames ?? 'Donald',
    title: title ?? patient?.title ?? 'Mr',
    addressLine1: addressLine1 ?? patient?.addressLine1 ?? patient?.address_line1 ?? patient?.address_line_1 ?? 'Duck House',
    addressLine2: addressLine2 ?? patient?.addressLine2 ?? patient?.address_line2 ?? patient?.address_line_2 ?? '1 Duck Close',
    addressLine3: addressLine3 ?? patient?.addressLine3 ?? patient?.address_line3 ?? patient?.address_line_3 ?? 'Fantasyland',
    addressLine4: addressLine4 ?? patient?.addressLine4 ?? patient?.address_line4 ?? patient?.address_line_4 ?? 'Disneyworld, FL3 1DC',
    hospitalNumber: hospitalNumber ?? patient?.hospitalNumber ?? patient?.hospital_number ?? crn ?? patient?.crn ?? '012345678',
    dateOfBirth: dateOfBirth ?? patient?.dateOfBirth ?? patient?.date_of_birth ?? new Date(1956, 3, 12),
    sex: sex ?? patient?.sex ?? 'Male',
  };

  const parseDate = (value: string | Date): Date | null => {
    const parsed = typeof value === 'string' ? new Date(value) : value;
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateAge = (date: Date | null): number | null => {
    if (!date) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age -= 1;
    return age;
  };

  const formatSex = (value?: string): string => {
    const normalised = String(value || '').trim().toLowerCase();
    if (normalised === 'm' || normalised === 'male') return 'Male';
    if (normalised === 'f' || normalised === 'female') return 'Female';
    return 'Sex not specified';
  };

  const dobDate = parseDate(resolved.dateOfBirth);
  const formattedDOB = formatDate(dobDate);
  const age = calculateAge(dobDate);
  const sexDisplay = formatSex(resolved.sex);
  const addressLines = [resolved.addressLine1, resolved.addressLine2, resolved.addressLine3, resolved.addressLine4].filter(Boolean);
  const displaySurname = String(resolved.surname || '').toLocaleUpperCase('en-GB');
  const nameText = `${displaySurname}${resolved.forenames ? `, ${resolved.forenames}` : ''}${resolved.title ? ` (${resolved.title})` : ''}`;

  const fieldBase: React.CSSProperties = {
    transition: 'background-color 0.5s ease-out',
    padding: '0.15mm 0.25mm',
    minWidth: 0,
    textAlign: 'left',
  };

  const highlightHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = '#ffffcc';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    },
  };

  return (
    <div className="fb-addressograph-card" style={{
      width: '90mm',
      height: '34mm',
      boxSizing: 'border-box',
      overflow: 'hidden',
      padding: '1.1mm',
      border: '0.1rem solid silver',
      borderRadius: '0.4rem',
      backgroundColor: 'white',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11pt',
      lineHeight: 1.08,
      color: 'black',
      flex: '0 0 90mm',
      textAlign: 'left',
    }}>
      <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', height: '100%', minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: '1mm', minWidth: 0 }}>
          <div className="fb-addressograph-field" data-tooltip="NHS Number" title="NHS Number" style={{ ...fieldBase, fontWeight: 'bold' }} {...highlightHandlers}>
            {resolved.nhsNumber}
          </div>
          <div className="fb-addressograph-field" data-tooltip="CRN" title="CRN" style={{ ...fieldBase, textAlign: 'right', whiteSpace: 'nowrap' }} {...highlightHandlers}>
            {resolved.hospitalNumber ? `CRN ${resolved.hospitalNumber}` : null}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: '1mm', minWidth: 0 }}>
          <div
            className="fb-addressograph-field fb-addressograph-name"
            data-tooltip="Surname, first names (title)"
            title={nameText}
            style={{ ...fieldBase, flex: '1 1 0', minWidth: '45mm', overflowWrap: 'anywhere', wordBreak: 'normal' }}
            {...highlightHandlers}
          >
            <span style={{ fontWeight: 'bold' }} title="Surname">{displaySurname}</span>{resolved.forenames ? <>, <span title="First name(s)">{resolved.forenames}</span></> : null}{resolved.title ? <> <span title="Title">({resolved.title})</span></> : null}
          </div>
          <div className="fb-addressograph-field" data-tooltip="Date of birth" style={{ ...fieldBase, marginLeft: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }} {...highlightHandlers}>
            <span title="Date of birth">{formattedDOB}</span>{age !== null ? <> <span title="Age">({age}y)</span></> : null}
          </div>
        </div>
        <div className="fb-addressograph-field" data-tooltip="Address" title="Address" style={{ ...fieldBase, overflow: 'hidden', minHeight: 0 }} {...highlightHandlers}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: '1mm', minWidth: 0 }}>
            <div style={{ overflowWrap: 'anywhere' }}>{addressLines[0] ?? ''}</div>
            <div title="Sex" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{sexDisplay}</div>
          </div>
          {addressLines.slice(1).map((line, index) => (
            <div key={`${line}-${index + 1}`} style={{ overflowWrap: 'anywhere' }}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
