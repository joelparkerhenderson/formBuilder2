<script lang="ts">
  export let nhsNumber = '123 456 7890';
  export let surname = 'DUCK';
  export let forenames = 'Donald';
  export let title = 'Mr';
  export let addressLine1 = 'Duck House';
  export let addressLine2 = '1 Duck Close';
  export let addressLine3 = 'Fantasyland';
  export let addressLine4 = 'Disneyworld, FL3 1DC';
  export let crn = '012345678';
  export let dateOfBirth: string | Date = new Date(1956, 3, 12);
  export let sex = 'Male';

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  $: dobDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  $: age = (() => {
    const today = new Date();
    let calculated = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) calculated -= 1;
    return calculated;
  })();
  $: formattedDOB = `${String(dobDate.getDate()).padStart(2, '0')}-${monthNames[dobDate.getMonth()]}-${dobDate.getFullYear()}`;
</script>

<div class="fb-addressograph-card">
  <div class="fb-addressograph-grid">
    <div style="text-align: left;">
      <div class="fb-addressograph-field" title="NHS Number" style="font-weight: bold;">{nhsNumber}</div>
      <div class="fb-addressograph-field" data-tooltip="Surname, First names (Title)">
        <span style="font-weight: bold;" title="Surname">{surname}</span>, <span title="First name(s)">{forenames}</span> <span title="Title">({title})</span>
      </div>
      <div class="fb-addressograph-field" title="Address">
        <div>{addressLine1}</div>
        <div>{addressLine2}</div>
        <div>{addressLine3}</div>
        <div>{addressLine4}</div>
      </div>
    </div>
    <div style="text-align: right;">
      <div class="fb-addressograph-field" title="CRN">CRN {crn}</div>
      <div class="fb-addressograph-field"><span title="Date of birth">{formattedDOB}</span> <span title="Age">({age}y)</span></div>
      <div class="fb-addressograph-field" title="Sex">{sex}</div>
    </div>
  </div>
</div>

<style>
  .fb-addressograph-card {
    padding: 0.4rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background-color: white;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    width: 90mm;
  }

  .fb-addressograph-grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.2rem 1rem;
  }

  .fb-addressograph-field {
    transition: background-color 0.5s ease-out;
    padding: 0.1rem;
  }

  .fb-addressograph-field:hover,
  .fb-addressograph-field:focus-within {
    background-color: #ffffcc;
  }
</style>
