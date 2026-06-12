export interface DesignerOption {
  value: string;
  label: string;
}

export interface DesignerComponentSpec {
  id: string;
  key?: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | boolean;
  fullWidth?: boolean;
  colSpan?: number;
  options?: DesignerOption[];
  children?: DesignerComponentSpec[];
}

export interface DesignerFormSpec {
  id: string;
  publicId: string;
  title: string;
  patientUuid?: string;
  components: DesignerComponentSpec[];
  savedAt?: string;
}

export const treatmentSummarySpec: DesignerFormSpec = {
  id: "f495e028-3895-4355-bd63-4cf9926f7c91",
  publicId: "c2d1a786",
  title: "Treatment summary",
  patientUuid: "fd55880a-7ada-47a8-adbb-65850af6f7e2",
  components: [
    {
      id: "section1",
      type: "fbSection",
      label: "Details",
      children: [
        {
          id: "row11",
          type: "fbGridRow",
          label: "Grid row 1",
          children: [
            {
              id: "cell9",
              type: "fbGridCell",
              label: "Grid cell 1",
              colSpan: 1,
              children: [{
                id: "group5",
                type: "fbGroup",
                label: "Has the patient received a copy of this document?",
                required: true,
                defaultValue: "field8",
                children: [
                  { id: "field6", type: "fbRadio", label: "Yes" },
                  { id: "field7", type: "fbRadio", label: "No" },
                  { id: "field8", type: "fbRadio", label: "Unknown or not recorded" },
                ],
              }],
            },
            {
              id: "cell10",
              type: "fbGridCell",
              label: "Grid cell 2",
              colSpan: 1,
              children: [{
                id: "field9",
                type: "fbGroup",
                label: "Has the patient seen this document?",
                required: true,
                defaultValue: "field15",
                children: [
                  { id: "field13", type: "fbRadio", label: "Yes" },
                  { id: "field14", type: "fbRadio", label: "No" },
                  { id: "field15", type: "fbRadio", label: "Unknown or not recorded" },
                ],
              }],
            },
            { id: "cell16", type: "fbGridCell", label: "Grid cell 3", colSpan: 1, children: [] },
          ],
        },
        {
          id: "row18",
          type: "fbGridRow",
          label: "Grid row 2",
          children: [
            { id: "cell19", type: "fbGridCell", label: "Grid cell 5", colSpan: 1, children: [{ id: "field19", type: "fbDropdown", label: "Speciality", required: true, options: [{ value: "option1", label: "Option 1" }] }] },
            { id: "cell21", type: "fbGridCell", label: "Grid cell 6", colSpan: 1, children: [{ id: "field21", type: "fbMSISelector", label: "Senior responsible clinician", required: true }] },
            { id: "cell23", type: "fbGridCell", label: "Grid cell 7", colSpan: 1, children: [{ id: "field23", type: "fbMSISelector", label: "Clinical nurse specialist", required: true }] },
          ],
        },
        {
          id: "row24",
          type: "fbGridRow",
          label: "Grid row 3",
          children: [
            { id: "cell25", type: "fbGridCell", label: "Grid cell 7", colSpan: 1, children: [{ id: "field25", type: "fbTextInput", label: "Daytime 'phone number", required: true, placeholder: "" }] },
            { id: "cell27", type: "fbGridCell", label: "Grid cell 8", colSpan: 1, children: [{ id: "field27", type: "fbTextInput", label: "Out of hours 'phone number", required: true, placeholder: "" }] },
            { id: "cell29", type: "fbGridCell", label: "Grid cell 9", colSpan: 1, children: [{ id: "field30", type: "fbTextArea", label: "Carer or emergency contact", required: true, placeholder: "" }] },
          ],
        },
      ],
    },
    {
      id: "section2",
      type: "fbSection",
      label: "Diagnosis",
      children: [
        {
          id: "row31",
          type: "fbGridRow",
          label: "Grid row 4",
          children: [
            { id: "cell32", type: "fbGridCell", label: "Grid cell 10", colSpan: 1, children: [{ id: "field32", type: "fbSCTDiagnosis", label: "Diagnosis", required: true }] },
            { id: "cell34", type: "fbGridCell", label: "Grid cell 11", colSpan: 1, children: [{ id: "field34", type: "fbTextInput", label: "Staging", required: false, placeholder: "" }] },
          ],
        },
        { id: "field36", type: "fbTextArea", label: "Diagnosis comments", required: false, placeholder: "" },
      ],
    },
    {
      id: "section3",
      type: "fbSection",
      label: "Treatment",
      children: [
        { id: "field37", type: "fbTextArea", label: "Treatment", required: true, placeholder: "" },
        { id: "field38", type: "fbDropdown", label: "Treatment aim", required: true, options: [
          { value: "option1", label: "Curative" },
          { value: "option2", label: "Palliative / disease control" },
          { value: "option3", label: "Adjuvant" },
          { value: "option4", label: "Neo-adjuvant" },
          { value: "option5", label: "To achieve or maintain remission (haematology only)" },
          { value: "option6", label: "Unknown" },
        ] },
        { id: "field39", type: "fbTextArea", label: "Treatment aim comments", required: false, placeholder: "" },
        { id: "field40", type: "fbTextArea", label: "Other important information (effects of the disease, side effects of treatment)", required: false, placeholder: "" },
      ],
    },
    {
      id: "section4",
      type: "fbSection",
      label: "Prognosis",
      children: [
        {
          id: "row41",
          type: "fbGridRow",
          label: "Grid row 5",
          children: [
            { id: "cell42", type: "fbGridCell", label: "Grid cell 12", colSpan: 2, children: [{ id: "field42", type: "fbDropdown", label: "Prognosis", required: true, options: [
              { value: "option1", label: "Active monitoring" },
              { value: "option2", label: "Life not expected to be shortened by cancer" },
              { value: "option3", label: "Life not expected to be shortened, but long-term physical effects" },
              { value: "option4", label: "Life may be shortened by cancer, may have symptoms of cancer or treatment side effects" },
              { value: "option5", label: "Life expectancy significantly reduced, <12 months" },
              { value: "option6", label: "Advanced disease, life shortened to weeks/months" },
              { value: "option7", label: "Final days/weeks of life" },
              { value: "option8", label: "Cancer is not the life-limiting condition" },
            ] }] },
            { id: "cell44", type: "fbGridCell", label: "Grid cell 13", colSpan: 1, children: [{ id: "field44", type: "fbDropdown", label: "Prognosis certainty", required: true, options: [
              { value: "option1", label: "Not at all certain" },
              { value: "option2", label: "Reasonably certain" },
              { value: "option3", label: "Beyond reasonable doubt" },
            ] }] },
          ],
        },
        { id: "field46", type: "fbTextArea", label: "Alert symptoms that require referral back to specialist team", required: false, placeholder: "" },
      ],
    },
    {
      id: "section47",
      type: "fbSection",
      label: "Referrals",
      children: [
        { id: "field49", type: "fbTextArea", label: "Primary care actions requested", required: false, placeholder: "" },
        { id: "field50", type: "fbTextArea", label: "Onward referrals made", required: false, placeholder: "" },
      ],
    },
    {
      id: "section48",
      type: "fbSection",
      label: "Follow-up",
      children: [{
        id: "row51",
        type: "fbGridRow",
        label: "Grid row 6",
        children: [
          { id: "cell52", type: "fbGridCell", label: "Grid cell 14", colSpan: 1, children: [{ id: "field52", type: "fbDropdown", label: "Follow-up plan", required: false, options: [
            { value: "option1", label: "Consultant led" },
            { value: "option2", label: "Nurse led" },
            { value: "option3", label: "PIFU: Patient-initiated follow-up" },
            { value: "option4", label: "Primary care" },
            { value: "option5", label: "Palliative care" },
            { value: "option6", label: "Not yet determined" },
          ] }] },
          { id: "cell54", type: "fbGridCell", label: "Grid cell 15", colSpan: 2, children: [{ id: "field54", type: "fbTextArea", label: "Comments", required: false, placeholder: "" }] },
        ],
      }],
    },
  ],
  savedAt: "2026-06-04T22:40:55.646Z",
};
