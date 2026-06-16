import type { SimpleClinicalSpec } from './simpleClinicalTypes';
import { specialities } from './constants';

const yesNoUnknown = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown or not recorded' },
];

const laterality = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'not_applicable', label: 'Not applicable' },
];

export const operationNoteSpec: SimpleClinicalSpec = {
  title: 'Operation note',
  formType: 'operation_note',
  filename: 'operationNote.html',
  sections: [
    {
      id: 'section-basic-information',
      name: 'Basic information',
      requiredFields: ['organisation', 'speciality', 'hospital', 'urgency', 'date'],
      rows: [
        { cells: [
          { fields: [{ key: 'organisation', type: 'dropdown', label: 'Organisation', required: true, options: [
            { value: 'aneurin-bevan', label: 'Aneurin Bevan' },
            { value: 'betsi-cadwaladr', label: 'Betsi Cadwaladr' },
            { value: 'cardiff-vale', label: 'Cardiff & Vale' },
            { value: 'cwm-taf', label: 'Cwm Taf Morgannwg' },
            { value: 'hywel-dda', label: 'Hywel Dda' },
            { value: 'powys', label: 'Powys' },
            { value: 'swansea-bay', label: 'Swansea Bay' },
            { value: 'velindre', label: 'Velindre' },
          ] }] },
          { fields: [{ key: 'speciality', type: 'dropdown', label: 'Speciality', required: true, options: specialities }] },
          { fields: [{ key: 'hospital', type: 'dropdown', label: 'Hospital', required: true, options: [
            { value: 'prince-charles', label: 'Prince Charles Hospital, Merthyr Tydfil' },
            { value: 'royal-glamorgan', label: 'Royal Glamorgan Hospital, Llantrisant' },
            { value: 'princess-wales', label: 'Princess of Wales Hospital, Bridgend' },
          ] }] },
          { fields: [] },
        ] },
        { cells: [
          { fields: [{ key: 'urgency', type: 'urgencyGroup', label: 'Urgency', required: true }] },
          { fields: [{ key: 'date', type: 'date', label: 'Date of operation', required: true, tooltip: 'Knife to skin' }] },
          { fields: [{ key: 'startTime', type: 'time', label: 'Start', tooltip: 'Knife to skin' }] },
          { fields: [{ key: 'endTime', type: 'time', label: 'End', tooltip: 'Dressings applied' }] },
        ] },
      ],
    },
    {
      id: 'section-surgeons-anaesthetists',
      name: 'Surgeons and anaesthetists',
      requiredFields: ['leadSurgeon', 'surgeonSRC', 'leadAnaesthetist', 'anaesthetistSRC'],
      rows: [
        { cells: [
          { span: 2, fields: [{ key: 'surgeons', type: 'surgeonGroup', label: 'Surgeons' }] },
          { span: 2, fields: [{ key: 'anaesthetists', type: 'anaesthetistGroup', label: 'Anaesthetists' }] },
        ] },
      ],
    },
    {
      id: 'section-prophylaxis',
      name: 'Prophylaxis and other specific preop or intraop medication',
      rows: [
        { cells: [
          { fields: [{ key: 'antibioticProphylaxis', type: 'textarea', label: 'Antibiotic prophylaxis' }] },
          { fields: [{ key: 'vteProphylaxis', type: 'textarea', label: 'Venous thromboembolism prophylaxis' }] },
          { fields: [{ key: 'otherMedication', type: 'textarea', label: 'Other' }] },
        ] },
      ],
    },
    {
      id: 'section-procedures',
      name: 'Procedure(s)',
      requiredFields: ['procedures'],
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'procedures', type: 'procedureTable', label: 'Procedure(s)', required: true }] },
        ] },
      ],
    },
    {
      id: 'section-detail',
      name: 'Detail',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'indication', type: 'textarea', label: 'Indication', rows: 4, fullWidth: true }] },
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'incision', type: 'textarea', label: 'Incision' }] },
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'findings', type: 'textarea', label: 'Findings', rows: 4, fullWidth: true }] },
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'diagnoses', type: 'diagnosisTable', label: 'Operative diagnoses', tooltip: 'if different' }] },
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'procedureDescription', type: 'textarea', label: 'Procedure description', rows: 4, fullWidth: true }] },
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'extraProcedures', type: 'textarea', label: 'Extra procedures undertaken', rows: 4, fullWidth: true }] },
        ] },
        { cells: [
          { fields: [{ key: 'bloodLoss', type: 'number', label: 'Estimated blood loss', units: 'ml' }] },
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'problems', type: 'textarea', label: 'Specific surgical intraoperative problems encountered', rows: 4, fullWidth: true }] },
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'closure', type: 'textarea', label: 'Closure', rows: 4, fullWidth: true }] },
        ] },
        { noGrid: true, cells: [
          { fields: [{ key: 'postOpInstructions', type: 'textarea', label: 'Post-op instructions', rows: 4, fullWidth: true }] },
        ] },
        { noGrid: true, cells: [
          { fields: [{ key: 'followUp', type: 'textarea', label: 'Follow-up', rows: 4, fullWidth: true }] },
        ] },
      ],
    },
    {
      id: 'section-specimens',
      name: 'Tissue removed and pathological specimens',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'specimens', type: 'specimenTable', label: 'Specimen lists and biopsies' }] },
        ] },
      ],
    },
    {
      id: 'section-images',
      name: 'Images',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'imagesNotice', type: 'boxedInfo', label: '', text: 'Image thumbnail blocks are shown here in the React form. Upload support remains a Svelte transition item.' }] },
        ] },
      ],
    },
    {
      id: 'section-implants',
      name: 'Implants - Scan for safety',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'implants', type: 'implantTable', label: 'Implants list' }] },
        ] },
      ],
    },
  ],
};

export const outpatientOutcomeSpec: SimpleClinicalSpec = {
  title: 'Outpatient outcome',
  formType: 'outpatient_outcome',
  filename: 'outpatientOutcome.html',
  sections: [
    {
      id: 'section-appointment',
      name: 'Appointment',
      requiredFields: ['organisation', 'speciality', 'site', 'seniorClinician', 'clinicDate'],
      rows: [
        { cells: [
          { fields: [{ key: 'organisation', type: 'dropdown', label: 'Organisation', required: true, options: [
            { value: 'cwm-taf', label: 'Cwm Taf Morgannwg' },
            { value: 'cardiff-vale', label: 'Cardiff & Vale' },
            { value: 'swansea-bay', label: 'Swansea Bay' },
          ] }] },
          { fields: [{ key: 'speciality', type: 'dropdown', label: 'Speciality', required: true, options: [
            { value: 'colorectal', label: 'Colorectal' },
            { value: 'upper_gi', label: 'Upper GI' },
            { value: 'urology', label: 'Urology' },
          ] }] },
          { fields: [{ key: 'site', type: 'text', label: 'Site', required: true }] },
        ] },
        { cells: [
          { fields: [{ key: 'seniorClinician', type: 'msi', label: 'Senior Clinician', required: true }] },
          { fields: [{ key: 'clinicName', type: 'text', label: 'Clinic name' }] },
          { fields: [{ key: 'clinicDate', type: 'date', label: 'Date and Time', required: true }, { key: 'clinicTime', type: 'time', label: '' }] },
        ] },
      ],
    },
    {
      id: 'section-consultation-outcome',
      name: 'Consultation Outcome',
      requiredFields: ['attendance'],
      rows: [
        { cells: [
          { fields: [{ key: 'attendance', type: 'radioGroup', label: 'Attendance', required: true, options: [
            { value: 'attended', label: 'Attended' },
            { value: 'unable', label: 'Unable to attend' },
            { value: 'dna', label: 'Did not attend' },
          ] }] },
          { fields: [{ key: 'usc', type: 'radioGroup', label: 'Urgent suspected cancer', options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ] }] },
          { fields: [{ key: 'workingDiagnosis', type: 'sctDiagnosis', label: 'Working diagnosis' }] },
        ] },
        { cells: [
          { fields: [{ key: 'unableReason', type: 'text', label: 'Reason' }] },
          { fields: [{ key: 'anotherApptDate', type: 'partialDate', label: 'Another appointment date' }] },
          { fields: [{ key: 'letterPlan', type: 'radioGroup', label: 'Letter plan', options: [
            { value: 'system', label: 'Send system-generated letter to GP and patient' },
            { value: 'done', label: 'Letter to GP and patient done' },
          ] }] },
        ] },
      ],
    },
    {
      id: 'section-status-referrals',
      name: 'Status / Referrals',
      rows: [
        { cells: [
          { fields: [{ key: 'tierOneOutcome', type: 'checkGroup', label: 'Tier 1 outcome', options: [
            { value: 'discharge', label: 'Discharge' },
            { value: 'sos', label: 'See on symptom' },
            { value: 'pifu', label: 'Patient initiated follow-up' },
          ] }] },
          { fields: [{ key: 'tierTwoOutcome', type: 'checkGroup', label: 'Tier 2 outcome', options: [
            { value: 'remoteMonitoring', label: 'Remote monitoring' },
            { value: 'testsRequested', label: 'Tests requested' },
            { value: 'waitingList', label: 'Add to waiting list for surgery or other treatment' },
            { value: 'outpatientTreatment', label: 'Outpatient treatment planned' },
            { value: 'admitted', label: 'Admitted from clinic to ward or department' },
            { value: 'mdt', label: 'MDT review' },
            { value: 'followUp', label: 'Follow up appointment' },
          ] }] },
          { fields: [{ key: 'nonPathwayOutcome', type: 'checkGroup', label: 'Other outcomes', options: [
            { value: 'treatmentGiven', label: 'Treatment given in clinic today' },
            { value: 'therapies', label: 'Referred to therapies' },
            { value: 'consultantReferral', label: 'Referred to another consultant, speciality or hospital' },
          ] }] },
        ] },
        { cells: [
          { fields: [{ key: 'testsRequested', type: 'textarea', label: 'Tests requested' }] },
          { fields: [{ key: 'treatmentPlanned', type: 'textarea', label: 'Treatment planned' }] },
          { fields: [{ key: 'followUpDetails', type: 'textarea', label: 'Follow up appointment details' }] },
        ] },
        { cells: [
          { fields: [{ key: 'therapyDetails', type: 'textarea', label: 'Therapy or department' }] },
          { fields: [{ key: 'consultantDetails', type: 'text', label: 'Consultant, speciality or hospital' }] },
          { fields: [{ key: 'testsOnArrival', type: 'text', label: 'Tests to be done on arrival' }] },
        ] },
      ],
    },
  ],
};

export const treatmentSummarySpec: SimpleClinicalSpec = {
  title: 'Treatment summary',
  formType: 'treatment_summary',
  filename: 'treatmentSummary.html',
  sections: [
    {
      id: 'section-details',
      name: 'Details',
      requiredFields: ['patientCopy', 'patientSeen', 'speciality', 'seniorClinician'],
      rows: [
        { cells: [
          { fields: [{ key: 'patientCopy', type: 'radioGroup', label: 'Has the patient received a copy of this document?', required: true, options: yesNoUnknown }] },
          { fields: [{ key: 'patientSeen', type: 'radioGroup', label: 'Has the patient seen this document?', required: true, options: yesNoUnknown }] },
          { fields: [{ key: 'speciality', type: 'dropdown', label: 'Speciality', required: true, options: [
            { value: 'oncology', label: 'Oncology' },
            { value: 'haematology', label: 'Haematology' },
            { value: 'surgery', label: 'Surgery' },
          ] }] },
        ] },
        { cells: [
          { fields: [{ key: 'seniorClinician', type: 'msi', label: 'Senior responsible clinician', required: true }] },
          { fields: [{ key: 'cns', type: 'msi', label: 'Clinical nurse specialist' }] },
          { fields: [{ key: 'daytimePhone', type: 'text', label: "Daytime 'phone number" }] },
        ] },
      ],
    },
    {
      id: 'section-diagnosis',
      name: 'Diagnosis',
      requiredFields: ['diagnosis'],
      rows: [
        { cells: [
          { span: 2, fields: [{ key: 'diagnosis', type: 'sctDiagnosis', label: 'Diagnosis', required: true }] },
          { fields: [{ key: 'staging', type: 'text', label: 'Staging' }] },
        ] },
        { cells: [
          { span: 2, fields: [{ key: 'diagnosisComments', type: 'textarea', label: 'Diagnosis comments' }] },
          { fields: [{ key: 'summaryAlert', type: 'boxedAlert', label: '', text: 'Confirm coded diagnosis and staging before finalising the treatment summary.' }] },
        ] },
      ],
    },
    {
      id: 'section-treatment',
      name: 'Treatment',
      requiredFields: ['treatment', 'treatmentAim'],
      rows: [
        { cells: [
          { span: 2, fields: [{ key: 'treatment', type: 'textarea', label: 'Treatment', required: true }] },
          { fields: [{ key: 'treatmentAim', type: 'dropdown', label: 'Treatment aim', required: true, options: [
            { value: 'curative', label: 'Curative' },
            { value: 'palliative', label: 'Palliative / disease control' },
            { value: 'adjuvant', label: 'Adjuvant' },
            { value: 'neoadjuvant', label: 'Neo-adjuvant' },
            { value: 'unknown', label: 'Unknown' },
          ] }] },
        ] },
        { cells: [
          { span: 2, fields: [{ key: 'treatmentComments', type: 'textarea', label: 'Treatment aim comments' }] },
          { fields: [{ key: 'toxicity', type: 'textarea', label: 'Side effects of treatment' }] },
        ] },
      ],
    },
    {
      id: 'section-follow-up',
      name: 'Follow-up',
      rows: [
        { cells: [
          { fields: [{ key: 'followUpPlan', type: 'dropdown', label: 'Follow-up plan', options: [
            { value: 'consultant', label: 'Consultant led' },
            { value: 'nurse', label: 'Nurse led' },
            { value: 'pifu', label: 'PIFU: Patient-initiated follow-up' },
            { value: 'primary_care', label: 'Primary care' },
          ] }] },
          { span: 2, fields: [{ key: 'followUpComments', type: 'textarea', label: 'Comments' }] },
        ] },
      ],
    },
  ],
};
