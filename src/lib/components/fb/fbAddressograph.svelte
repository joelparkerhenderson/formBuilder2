<script lang="ts">
  type AddressographPatient = Partial<{
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

  type Props = {
    patient?: AddressographPatient;
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
  };

  let {
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
  }: Props = $props();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function parseDate(value: string | Date): Date | null {
    const parsed = typeof value === 'string' ? new Date(value) : value;
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }

  function formatDate(value: string | Date): string {
    const date = parseDate(value);
    if (!date) return '';
    return `${String(date.getDate()).padStart(2, '0')}-${monthNames[date.getMonth()]}-${date.getFullYear()}`;
  }

  function calculateAge(value: string | Date): number | null {
    const date = parseDate(value);
    if (!date) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age -= 1;
    return age;
  }

  function formatSex(value: string | undefined): string {
    const normalised = String(value || '').trim().toLowerCase();
    if (normalised === 'm' || normalised === 'male') return 'Male';
    if (normalised === 'f' || normalised === 'female') return 'Female';
    return 'Sex not specified';
  }

  const resolvedNhsNumber = $derived(nhsNumber ?? patient?.nhsNumber ?? patient?.nhs_number ?? '123 456 7890');
  const resolvedSurname = $derived(surname ?? patient?.surname ?? 'DUCK');
  const resolvedForenames = $derived(forenames ?? patient?.forenames ?? 'Donald');
  const resolvedTitle = $derived(title ?? patient?.title ?? 'Mr');
  const resolvedAddressLine1 = $derived(addressLine1 ?? patient?.addressLine1 ?? patient?.address_line1 ?? patient?.address_line_1 ?? 'Duck House');
  const resolvedAddressLine2 = $derived(addressLine2 ?? patient?.addressLine2 ?? patient?.address_line2 ?? patient?.address_line_2 ?? '1 Duck Close');
  const resolvedAddressLine3 = $derived(addressLine3 ?? patient?.addressLine3 ?? patient?.address_line3 ?? patient?.address_line_3 ?? 'Fantasyland');
  const resolvedAddressLine4 = $derived(addressLine4 ?? patient?.addressLine4 ?? patient?.address_line4 ?? patient?.address_line_4 ?? 'Disneyworld, FL3 1DC');
  const resolvedHospitalNumber = $derived(hospitalNumber ?? patient?.hospitalNumber ?? patient?.hospital_number ?? crn ?? patient?.crn ?? '012345678');
  const resolvedDateOfBirth = $derived(dateOfBirth ?? patient?.dateOfBirth ?? patient?.date_of_birth ?? new Date(1956, 3, 12));
  const resolvedSex = $derived(formatSex(sex ?? patient?.sex ?? 'Male'));
  const formattedDOB = $derived(formatDate(resolvedDateOfBirth));
  const age = $derived(calculateAge(resolvedDateOfBirth));
  const addressLines = $derived([resolvedAddressLine1, resolvedAddressLine2, resolvedAddressLine3, resolvedAddressLine4].filter(Boolean));
  const displaySurname = $derived(String(resolvedSurname || '').toLocaleUpperCase('en-GB'));
  const nameText = $derived(`${displaySurname}${resolvedForenames ? `, ${resolvedForenames}` : ''}${resolvedTitle ? ` (${resolvedTitle})` : ''}`);
</script>

<div class="fb-addressograph-card" data-lily-reference-component="person">
  <div class="fb-addressograph-grid">
    <div class="fb-addressograph-top-row">
      <div class="fb-addressograph-field fb-addressograph-nhs" data-tooltip="NHS Number" title="NHS Number">{resolvedNhsNumber}</div>
      <div class="fb-addressograph-field fb-addressograph-hospital-number" data-tooltip="CRN" title="CRN">{#if resolvedHospitalNumber}CRN {resolvedHospitalNumber}{/if}</div>
    </div>
    <div class="fb-addressograph-name-row">
      <div class="fb-addressograph-field fb-addressograph-name" data-tooltip="Surname, first names (title)" title={nameText}>
        <span class="fb-addressograph-surname" title="Surname">{displaySurname}</span>{#if resolvedForenames}, <span title="First name(s)">{resolvedForenames}</span>{/if}{#if resolvedTitle}{' '}<span title="Title">({resolvedTitle})</span>{/if}
      </div>
      <div class="fb-addressograph-field fb-addressograph-dob" data-tooltip="Date of birth">
        <span title="Date of birth">{formattedDOB}</span>{#if age !== null}{' '}<span title="Age">({age}y)</span>{/if}
      </div>
    </div>
    <div class="fb-addressograph-field fb-addressograph-address" title="Address">
      <div class="fb-addressograph-address-sex-row">
        <div>{addressLines[0] ?? ''}</div>
        <div class="fb-addressograph-sex" title="Sex">{resolvedSex}</div>
      </div>
      {#each addressLines.slice(1) as line}
        <div>{line}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .fb-addressograph-card {
    width: 90mm;
    height: 34mm;
    box-sizing: border-box;
    overflow: hidden;
    padding: 1.1mm;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background-color: white;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.08;
    color: black;
    flex: 0 0 90mm;
    text-align: left;
  }

  .fb-addressograph-grid {
    display: grid;
    grid-template-rows: auto auto 1fr;
    height: 100%;
    min-height: 0;
  }

  .fb-addressograph-top-row,
  .fb-addressograph-name-row {
    column-gap: 1mm;
    min-width: 0;
  }

  .fb-addressograph-top-row {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  .fb-addressograph-name-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
  }

  .fb-addressograph-field {
    transition: background-color 0.5s ease-out;
    padding: 0.15mm 0.25mm;
    min-width: 0;
    text-align: left;
  }

  .fb-addressograph-nhs,
  .fb-addressograph-surname {
    font-weight: bold;
  }

  .fb-addressograph-hospital-number,
  .fb-addressograph-dob {
    text-align: right;
    white-space: nowrap;
  }

  .fb-addressograph-dob {
    margin-left: auto;
  }

  .fb-addressograph-name {
    flex: 1 1 0;
    min-width: 45mm;
  }

  .fb-addressograph-name,
  .fb-addressograph-address div {
    text-align: left;
    overflow-wrap: anywhere;
    word-break: normal;
  }

  .fb-addressograph-address {
    overflow: hidden;
    min-height: 0;
  }

  .fb-addressograph-address-sex-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 1mm;
    min-width: 0;
  }

  .fb-addressograph-sex {
    text-align: right;
    white-space: nowrap;
  }

  .fb-addressograph-field:hover,
  .fb-addressograph-field:focus-within {
    background-color: #ffffcc;
  }
</style>
