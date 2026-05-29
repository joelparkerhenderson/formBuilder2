import React from 'react';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbDraftBadge as DraftBadge } from './components/fbDraftBadge';
import { fbButton as FbButton } from './components/fbButton';

interface Patient {
  uuid: string;
  nhs_number: string;
  surname: string;
  forenames: string;
  title: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  address_line4: string;
  crn: string;
  date_of_birth: string;
  sex: string;
}

interface OutpatientOutcomeRoVProps {
  patient: Patient | null;
  formState: Record<string, any>;
  discharged: boolean;
  sos: boolean;
  pifu: boolean;
  remoteMonitoring: boolean;
  testsReq: boolean;
  waitListed: boolean;
  oprxPlanned: boolean;
  admitted: boolean;
  mdtReview: boolean;
  rxGiven: boolean;
  refToTherapies: boolean;
  refToConsultant: boolean;
  fuOPA: boolean;
  finalChecked: boolean;
  formStatus: string;
  openedFromPatientRecord: boolean;
  username: string;
  onSwitchToEV: () => void;
  onBack: () => void;
}

export function OutpatientOutcomeRoV(props: OutpatientOutcomeRoVProps) {
  const {
    patient,
    formState,
    discharged,
    sos,
    pifu,
    remoteMonitoring,
    testsReq,
    waitListed,
    oprxPlanned,
    admitted,
    mdtReview,
    rxGiven,
    refToTherapies,
    refToConsultant,
    fuOPA,
    finalChecked,
    formStatus,
    openedFromPatientRecord,
    username,
    onSwitchToEV,
    onBack
  } = props;

  // Helper to render a read-only field
  const renderField = (label: string, value: any) => {
    if (!value || value === '' || value === 'select') {
      return <div></div>;
    }
    return (
      <div className="space-y-2 question-container">
        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>{label}</label>
        <div style={{ fontWeight: 500, marginLeft: '0.4rem', whiteSpace: 'pre-line' }}>{value}</div>
      </div>
    );
  };

  // Human-readable labels for specific options
  const getAttendanceLabel = (option: string) => {
    if (option === 'attended') return 'Attended';
    if (option === 'unableToAttend') return 'Unable to attend';
    if (option === 'didNotAttend') return 'Did not attend';
    return option;
  };

  const getDnaActionLabel = (option: string) => {
    if (option === 'sendAnother') return 'Send another appointment';
    if (option === 'noFurther') return 'No further appointment';
    return option;
  };

  const getDnaLetterLabel = (option: string) => {
    if (option === 'sendLetter') return 'Send system-generated letter to GP and patient';
    if (option === 'letterDone') return 'Letter to GP and patient done';
    return option;
  };

  const getWlOptionLabel = (option: string) => {
    if (option === 'dayCase') return 'Day case';
    if (option === 'inpatient') return 'Inpatient';
    return option;
  };

  const getRxPriorityLabel = (option: string) => {
    if (option === 'routine') return 'Routine';
    if (option === 'urgent') return 'Urgent';
    if (option === 'usc') return 'Urgent suspected cancer';
    return option;
  };

  const getConsultationTypeLabel = (option: string) => {
    if (option === 'faceToFace') return 'Face to face';
    if (option === 'telephone') return 'Telephone consultation';
    if (option === 'videoCall') return 'Video call';
    if (option === 'caseReview') return 'Case review (patient not required to attend)';
    return option;
  };

  const getFuApptPriorityLabel = (option: string) => {
    if (option === 'overbook') return 'A* : Overbook';
    if (option === 'doNotPostpone') return 'A : Do not postpone appointment';
    if (option === 'fourWeeks') return 'B : Do not postpone appointment for more than four weeks';
    if (option === 'afterTests') return 'D : After test results';
    if (option === 'treatmentWL') return 'T : Add to outpatient treatment waiting list';
    return option;
  };

  const getSosIntervalLabel = (option: string) => {
    if (option === 'sixMonths') return 'Six months';
    if (option === 'twelveMonths') return 'Twelve months';
    return option;
  };

  const getTestsReasonLabel = (option: string) => {
    if (option === 'beforeTreatment') return 'Result required before deciding treatment';
    if (option === 'afterTreatment') return 'Result required for monitoring or after treatment';
    return option;
  };

  return (
    <div className="bg-white flex flex-col h-screen" style={{ height: '100vh', fontWeight: 300, lineHeight: 1.1 }}>
        <div className="flex flex-col h-full">
          {/* Fixed Top Section */}
          <div style={{ borderBottom: '0.2rem solid rgb(27, 110, 194)', marginBottom: '0.2rem', padding: '0.4rem' }}>
            <div className="flex justify-between items-center">
              <div>
                {formStatus === 'draft' && (
                  <>
                    <DraftBadge />
                    <br />
                  </>
                )}
                <h1 style={{ fontSize: '2rem', fontWeight: 500 }}>Outpatient outcome</h1>
              </div>

              {/* Addressograph */}
              {patient ? (
                <Addressograph
                  nhsNumber={patient.nhs_number}
                  surname={patient.surname}
                  forenames={patient.forenames}
                  title={patient.title}
                  addressLine1={patient.address_line1}
                  addressLine2={patient.address_line2}
                  addressLine3={patient.address_line3}
                  addressLine4={patient.address_line4}
                  crn={patient.crn}
                  dateOfBirth={patient.date_of_birth}
                  sex={patient.sex}
                />
              ) : (
                <Addressograph />
              )}
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth', minHeight: 0 }}>
            <div className="space-y-4" style={{ padding: '0.4rem' }}>

              {/* Appointment details */}
              <div className="question-container">
                <label style={{ fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0 }}>Appointment</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginTop: '0.4rem' }}>
                  {renderField('Organisation', formState.organisation)}
                  {renderField('Speciality', formState.speciality)}
                  {renderField('Site', formState.site)}
                  {renderField('Senior responsible clinician', formState.seniorClinician)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginTop: '0.4rem' }}>
                  {renderField('Clinic name', formState.clinicName)}
                  {renderField('Date', formState.date)}
                  {renderField('Time', formState.time)}
                </div>
              </div>

              {/* Attendance */}
              {formState.attendedOption && (
                <div className="question-container">
                  <label style={{ fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0 }}>Attendance</label>
                  <div style={{ fontWeight: 500, marginLeft: '0.4rem', marginTop: '0.4rem' }}>
                    ● {getAttendanceLabel(formState.attendedOption)}
                  </div>

                  {/* Unable to Attend details */}
                  {formState.attendedOption === 'unableToAttend' && (
                    <div style={{ marginLeft: '1.5rem', marginTop: '0.4rem' }} className="space-y-4">
                      {formState.unableReason && renderField('Reason', formState.unableReason)}
                      {formState.unableAction && (
                        <div className="space-y-2">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Action</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {formState.unableAction === 'anotherMade' ? 'Another appointment already made' : formState.unableAction === 'sendAnother' ? 'Send another appointment' : 'No further appointment'}
                          </div>
                        </div>
                      )}
                      {formState.unableAction === 'anotherMade' && formState.anotherApptDate && renderField('Date', formState.anotherApptDate)}
                      {formState.unableAction === 'noFurther' && formState.letterAction && (
                        <div className="space-y-2">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Letter Action</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {formState.letterAction === 'sendLetter' ? 'Send system-generated letter to GP and patient' : 'Letter to GP and patient done'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Did Not Attend details */}
                  {formState.attendedOption === 'didNotAttend' && (
                    <div style={{ marginLeft: '1.5rem', marginTop: '0.4rem' }} className="space-y-4">
                      {formState.wasNotBrought && (
                        <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                          ● Was not brought
                        </div>
                      )}
                      {formState.dnaAction && (
                        <div className="space-y-2">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Action</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {getDnaActionLabel(formState.dnaAction)}
                          </div>
                        </div>
                      )}
                      {formState.dnaAction === 'noFurther' && formState.dnaLetterAction && (
                        <div className="space-y-2">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Letter Action</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {getDnaLetterLabel(formState.dnaLetterAction)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Attended specific details */}
              {formState.attendedOption === 'attended' && (
                <>
                  {/* Urgent Suspected Cancer */}
                  {formState.usc && (
                    <div className="question-container">
                      <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Urgent suspected cancer</label>
                      <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                        ● {formState.usc === 'yes' ? 'Yes' : 'No'}
                      </div>
                    </div>
                  )}

                  {/* Working Diagnosis */}
                  {formState.workingDiagnosis && renderField('Working diagnosis', formState.workingDiagnosis)}

                  {/* Outcomes details */}
                  <div className="question-container">
                    <label style={{ fontWeight: 500, fontSize: '1rem', display: 'block', marginBottom: 0 }}>Outcome</label>
                    <div className="space-y-4" style={{ marginLeft: '0.4rem', marginTop: '0.4rem' }}>

                      {discharged && (
                        <div style={{ fontWeight: 500 }}>● Discharge</div>
                      )}

                      {sos && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● See on symptom</div>
                          {formState.sosInterval && (
                            <div style={{ marginLeft: '1.5rem' }}>
                              {renderField('Interval', getSosIntervalLabel(formState.sosInterval))}
                            </div>
                          )}
                        </div>
                      )}

                      {pifu && (
                        <div style={{ fontWeight: 500 }}>● Patient initiated follow-up</div>
                      )}

                      {remoteMonitoring && (
                        <div style={{ fontWeight: 500 }}>● Remote monitoring</div>
                      )}

                      {testsReq && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● Tests requested</div>
                          <div style={{ marginLeft: '1.5rem' }} className="space-y-2">
                            {formState.testsReason && renderField('Reason', getTestsReasonLabel(formState.testsReason))}
                            {formState.testsRequested && renderField('Tests requested description', formState.testsRequested)}
                          </div>
                        </div>
                      )}

                      {waitListed && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● Add to waiting list for surgery or other treatment</div>
                          <div style={{ marginLeft: '1.5rem' }} className="space-y-2">
                            {formState.wlOptions && renderField('Waiting list', getWlOptionLabel(formState.wlOptions))}
                            {formState.treatmentPlanned && renderField('Treatment planned', formState.treatmentPlanned)}
                          </div>
                        </div>
                      )}

                      {oprxPlanned && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● Outpatient treatment planned</div>
                          <div style={{ marginLeft: '1.5rem' }} className="space-y-2">
                            {formState.oprxTreatmentPlanned && renderField('Treatment planned', formState.oprxTreatmentPlanned)}
                            {formState.rxPriority && renderField('Priority', getRxPriorityLabel(formState.rxPriority))}
                          </div>
                        </div>
                      )}

                      {admitted && (
                        <div style={{ fontWeight: 500 }}>● Admitted from clinic to ward or department</div>
                      )}

                      {mdtReview && (
                        <div style={{ fontWeight: 500 }}>● MDT review</div>
                      )}

                      {rxGiven && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● Treatment given in clinic today</div>
                          {formState.treatmentGiven && (
                            <div style={{ marginLeft: '1.5rem' }}>
                              {renderField('Treatment details', formState.treatmentGiven)}
                            </div>
                          )}
                        </div>
                      )}

                      {formState.stopRefClock && (
                        <div style={{ fontWeight: 500 }}>● Stop referral to treatment clock</div>
                      )}

                      {refToTherapies && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● Referred to therapies</div>
                          {formState.therapyDetails && (
                            <div style={{ marginLeft: '1.5rem' }}>
                              {renderField('Therapy details', formState.therapyDetails)}
                            </div>
                          )}
                        </div>
                      )}

                      {refToConsultant && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● Referred to another consultant, speciality or hospital</div>
                          {formState.consultantDetails && (
                            <div style={{ marginLeft: '1.5rem' }}>
                              {renderField('Consultant details', formState.consultantDetails)}
                            </div>
                          )}
                        </div>
                      )}

                      {fuOPA && (
                        <div className="space-y-2">
                          <div style={{ fontWeight: 500 }}>● Follow up appointment</div>
                          <div style={{ marginLeft: '1.5rem' }} className="space-y-4">
                            {formState.cancerPathway && (
                              <div style={{ fontWeight: 500 }}>● Patient to remain on cancer pathway</div>
                            )}
                            {formState.interval && renderField('Interval', formState.interval)}
                            {formState.sameClinic && (
                              <div style={{ fontWeight: 500 }}>● Must be seen in the same clinic</div>
                            )}
                            {formState.sameClinician && (
                              <div style={{ fontWeight: 500 }}>● Must be seen by the same senior responsible clinician</div>
                            )}
                            {formState.consultationType && (
                              <div className="space-y-2">
                                {renderField('Consultation type', getConsultationTypeLabel(formState.consultationType))}
                                {formState.consultationType === 'faceToFace' && formState.hospitalDifferent && renderField('Hospital (if different)', formState.hospitalDifferent)}
                              </div>
                            )}
                            {formState.fuApptPriority && renderField('Priority (appointment directive)', getFuApptPriorityLabel(formState.fuApptPriority))}
                            {formState.testsOnArrival && renderField('Tests to be done on arrival', formState.testsOnArrival)}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {formState.notes && renderField('Notes', formState.notes)}

            </div>
          </div>

          {/* Fixed Bottom Section */}
          <div style={{ borderTop: '0.2rem solid rgb(27, 110, 194)', marginTop: '0.2rem', paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: 0, paddingRight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="flex-1"></div>
              <div
                style={{
                  display: 'inline-block',
                  height: '2.0rem',
                  lineHeight: '2rem',
                  marginLeft: '0.2rem',
                  padding: '0 0.5rem',
                  border: '0.1rem solid silver',
                  borderRadius: '0.4rem',
                  backgroundColor: 'white',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 400,
                  color: 'black'
                }}
              >
                {username}
              </div>
              <FbButton
                variant="primary"
                onClick={onSwitchToEV}
                style={{ marginLeft: '0.4rem' }}
              >
                Edit
              </FbButton>
              <FbButton
                variant="primary"
                onClick={onBack}
                style={{ marginLeft: '0.4rem' }}
              >
                Back
              </FbButton>
            </div>
          </div>

        </div>
      </div>
  );
}
