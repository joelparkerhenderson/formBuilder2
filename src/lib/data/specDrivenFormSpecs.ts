import type { SpecDrivenFormSpec } from './specDrivenFormTypes';
import { facilities, healthBoards } from './clinicalDestinations';
import { specialities } from './specialities';

export const operationNoteSpec: SpecDrivenFormSpec = {
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
          { fields: [{ key: 'organisation', type: 'hbSelector', label: 'Organisation', required: true, options: healthBoards }] },
          { fields: [{ key: 'speciality', type: 'smartDropdown', label: 'Speciality', required: true, options: specialities }] },
          { fields: [{ key: 'hospital', type: 'dropdown', label: 'Hospital', required: true, options: facilities.map(({ value, label }) => ({ value, label })) }] },
          { fields: [] }
        ] },
        { cells: [
          { fields: [{ key: 'urgency', type: 'urgencyGroup', label: 'Urgency', required: true }] },
          { fields: [{ key: 'date', type: 'date', label: 'Date of operation', required: true, tooltip: 'Knife to skin' }] },
          { fields: [{ key: 'startTime', type: 'time', label: 'Start', tooltip: 'Knife to skin' }] },
          { fields: [{ key: 'endTime', type: 'time', label: 'End', tooltip: 'Dressings applied' }] }
        ] }
      ]
    },
    {
      id: 'section-surgeons-anaesthetists',
      name: 'Surgeons and anaesthetists',
      requiredFields: ['leadSurgeon', 'surgeonSRC', 'leadAnaesthetist', 'anaesthetistSRC'],
      rows: [
        { cells: [
          { span: 2, fields: [{ key: 'surgeons', type: 'surgeonGroup', label: 'Surgeons' }] },
          { span: 2, fields: [{ key: 'anaesthetists', type: 'anaesthetistGroup', label: 'Anaesthetists' }] }
        ] }
      ]
    },
    {
      id: 'section-prophylaxis',
      name: 'Prophylaxis and other specific preop or intraop medication',
      rows: [
        { cells: [
          { fields: [{ key: 'antibioticProphylaxis', type: 'textarea', label: 'Antibiotic prophylaxis' }] },
          { fields: [{ key: 'vteProphylaxis', type: 'textarea', label: 'Venous thromboembolism prophylaxis' }] },
          { fields: [{ key: 'otherMedication', type: 'textarea', label: 'Other' }] }
        ] }
      ]
    },
    {
      id: 'section-procedures',
      name: 'Procedure(s)',
      requiredFields: ['procedures'],
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'procedures', type: 'procedureTable', label: 'Procedure(s)', required: true }] }
        ] }
      ]
    },
    {
      id: 'section-detail',
      name: 'Detail',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'indication', type: 'textarea', label: 'Indication', rows: 4, fullWidth: true }] }
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'incision', type: 'textarea', label: 'Incision' }] }
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'findings', type: 'textarea', label: 'Findings', rows: 4, fullWidth: true }] }
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'diagnoses', type: 'diagnosisTable', label: 'Operative diagnoses', tooltip: 'if different' }] }
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'procedureDescription', type: 'textarea', label: 'Procedure description', rows: 4, fullWidth: true }] }
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'extraProcedures', type: 'textarea', label: 'Extra procedures undertaken', rows: 4, fullWidth: true }] }
        ] },
        { cells: [
          { fields: [{ key: 'bloodLoss', type: 'numberWithUnits', label: 'Estimated blood loss', units: 'ml' }] }
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'problems', type: 'textarea', label: 'Specific surgical intraoperative problems encountered', rows: 4, fullWidth: true }] }
        ] },
        { cells: [
          { span: 3, fields: [{ key: 'closure', type: 'textarea', label: 'Closure', rows: 4, fullWidth: true }] }
        ] },
        { noGrid: true, cells: [
          { fields: [{ key: 'postOpInstructions', type: 'textarea', label: 'Post-op instructions', rows: 4, fullWidth: true }] }
        ] },
        { noGrid: true, cells: [
          { fields: [{ key: 'followUp', type: 'textarea', label: 'Follow-up', rows: 4, fullWidth: true }] }
        ] }
      ]
    },
    {
      id: 'section-specimens',
      name: 'Tissue removed and pathological specimens',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'specimens', type: 'specimenTable', label: 'Specimen lists and biopsies' }] }
        ] }
      ]
    },
    {
      id: 'section-images',
      name: 'Images',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'images', type: 'imageTiles', label: '' }] }
        ] }
      ]
    },
    {
      id: 'section-implants',
      name: 'Implants - Scan for safety',
      rows: [
        { cells: [
          { span: 3, fields: [{ key: 'implants', type: 'implantTable', label: 'Implants list' }] }
        ] }
      ]
    }
  ]
};
