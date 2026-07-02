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

  export let patient: AddressographPatient | undefined = undefined;
  export let nhsNumber: string | undefined = undefined;
  export let surname: string | undefined = undefined;
  export let forenames: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let addressLine1: string | undefined = undefined;
  export let addressLine2: string | undefined = undefined;
  export let addressLine3: string | undefined = undefined;
  export let addressLine4: string | undefined = undefined;
  export let hospitalNumber: string | undefined = undefined;
  /** @deprecated Use hospitalNumber internally; crn is accepted as a legacy synonym. */
  export let crn: string | undefined = undefined;
  export let dateOfBirth: string | Date | undefined = undefined;
  export let sex: string | undefined = undefined;

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

  $: resolvedNhsNumber = nhsNumber ?? patient?.nhsNumber ?? patient?.nhs_number ?? '123 456 7890';
  $: resolvedSurname = surname ?? patient?.surname ?? 'DUCK';
  $: resolvedForenames = forenames ?? patient?.forenames ?? 'Donald';
  $: resolvedTitle = title ?? patient?.title ?? 'Mr';
  $: resolvedAddressLine1 = addressLine1 ?? patient?.addressLine1 ?? patient?.address_line_1 ?? 'Duck House';
  $: resolvedAddressLine2 = addressLine2 ?? patient?.addressLine2 ?? patient?.address_line_2 ?? '1 Duck Close';
  $: resolvedAddressLine3 = addressLine3 ?? patient?.addressLine3 ?? patient?.address_line_3 ?? 'Fantasyland';
  $: resolvedAddressLine4 = addressLine4 ?? patient?.addressLine4 ?? patient?.address_line_4 ?? 'Disneyworld, FL3 1DC';
  $: resolvedHospitalNumber = hospitalNumber ?? patient?.hospitalNumber ?? patient?.hospital_number ?? crn ?? patient?.crn ?? '012345678';
  $: resolvedDateOfBirth = dateOfBirth ?? patient?.dateOfBirth ?? patient?.date_of_birth ?? new Date(1956, 3, 12);
  $: resolvedSex = formatSex(sex ?? patient?.sex ?? 'Male');
  $: formattedDOB = formatDate(resolvedDateOfBirth);
  $: age = calculateAge(resolvedDateOfBirth);
  $: addressLines = [resolvedAddressLine1, resolvedAddressLine2, resolvedAddressLine3, resolvedAddressLine4].filter(Boolean);
  $: nameText = `${resolvedSurname}${resolvedForenames ? `, ${resolvedForenames}` : ''}${resolvedTitle ? ` (${resolvedTitle})` : ''}`;
</script>

<div class="fb-addressograph-card">
  <div class="fb-addressograph-grid">
    <div class="fb-addressograph-top-row">
      <div class="fb-addressograph-field fb-addressograph-nhs" title="NHS Number">{resolvedNhsNumber}</div>
      <div class="fb-addressograph-field fb-addressograph-hospital-number" title="CRN">{#if resolvedHospitalNumber}CRN {resolvedHospitalNumber}{/if}</div>
    </div>
    <div class="fb-addressograph-name-row">
      <div class="fb-addressograph-field fb-addressograph-name" data-tooltip="Surname, first names (title)" title={nameText}>
        <span class="fb-addressograph-surname" title="Surname">{resolvedSurname}</span>{#if resolvedForenames}, <span title="First name(s)">{resolvedForenames}</span>{/if}{#if resolvedTitle} <span title="Title">({resolvedTitle})</span>{/if}
      </div>
      <div class="fb-addressograph-field fb-addressograph-dob" data-tooltip="Date of birth"><span title="Date of birth">{formattedDOB}</span>{#if age !== null} <span title="Age">({age}y)</span>{/if}</div>
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
  }

  .fb-addressograph-grid {
    display: grid;
    grid-template-rows: auto auto 1fr;
    height: 100%;
    min-height: 0;
  }

  .fb-addressograph-top-row,
  .fb-addressograph-name-row {
    display: grid;
    column-gap: 1mm;
    min-width: 0;
  }

  .fb-addressograph-top-row {
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
