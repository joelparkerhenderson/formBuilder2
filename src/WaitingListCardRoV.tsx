import React from 'react';
import { fbRoVField as FbRoVField, fbRoVTableCell as FbRoVTableCell } from './components/fbRoVField';
import { fbRoVFooter as FbRoVFooter, fbRoVHeader as FbRoVHeader } from './components/fbRoVShell';
import {
  fbTable as FbTable,
  fbTableHeader as FbTableHeader,
  fbTableBody as FbTableBody,
  fbTableRow as FbTableRow,
  fbTableHeaderCell as FbTableHeaderCell
} from "./components/fbTable";
import { fbQuestionRow as FbQuestionRow } from "./components/fbQuestionRow";
import { fbQuestionRowCell as FbQuestionRowCell } from "./components/fbQuestionRowCell";
import { hospitalLabels, organisationLabels, sideLabels, specialityLabels, yesNoUnknownLabels } from './data/formLabels';

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

export interface WaitingListCardRoVProps {
  patient: Patient | null;
  formState: Record<string, any>;
  procedures: Array<{id: number, side: string, procedure: string, additionalInfo: string, procedure_coded?: boolean}>;
  finalChecked: boolean;
  formStatus: string;
  openedFromPatientRecord: boolean;
  username: string;
  onSwitchToEV: () => void;
  onBack: () => void;
  reachedByRoVButton?: boolean;
}

export function WaitingListCardRoV(props: WaitingListCardRoVProps) {
  const {
    patient,
    formState,
    procedures,
    formStatus,
    openedFromPatientRecord,
    username,
    onSwitchToEV,
    onBack,
    reachedByRoVButton
  } = props;

  const [activeSection, setActiveSection] = React.useState<string>('section-from');

  React.useEffect(() => {
    const scrollContainer = document.querySelector(".rov-scroll-container");
    const handleScroll = () => {
      const sections = [
        "section-from",
        "section-listing",
        "section-procedure",
        "section-risks",
        "section-preop",
        "section-anaesthesia",
        "section-postop",
        "section-other"
      ];

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element && scrollContainer) {
          const rect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          if (
            rect.top <= containerRect.top + 100 &&
            rect.bottom > containerRect.top
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const urgencyLabels: Record<string, string> = {
    'routine': 'Routine',
    'urgent': 'Urgent',
    'usc': 'USC (Urgent Suspected Cancer)'
  };

  const operatingSurgeonLabels: Record<string, string> = {
    'supervision': 'Any grade with supervision',
    'discuss': 'Discuss with consultant',
    'consultant': 'Consultant only',
    'named_clinician': 'Named clinician',
    'unknown': 'Unknown or not recorded'
  };

  const yesNoLabels = yesNoUnknownLabels;

  const rcsPriorityLabels: Record<string, string> = {
    'p2': '2: Within 4 weeks',
    'p3': '3: Within 3 months',
    'p4': '4: Can be delayed more than 3 months',
    'unknown': 'Unknown or not recorded'
  };

  const managementLabels: Record<string, string> = {
    'outpatient': 'Outpatient',
    'daycase': 'Daycase',
    'inpatient': 'Inpatient',
    'unknown': 'Unknown or not recorded'
  };

  const bedLabels: Record<string, string> = {
    'itu': 'ITU: Intensive care bed',
    'hdu': 'HDU: High dependency bed',
    'pacu': 'PACU: Post-anaesthetic care unit bed',
    'ward': 'Ward bed',
    'unknown': 'Unknown or not recorded'
  };

  const riskLabels: Record<string, string> = {
    'diabetic': 'Diabetic',
    'latex': 'Latex allergy',
    'mrsa': 'MRSA',
    'pacemaker': 'Pacemaker/implant',
    'blood': 'Blood transfusion refusal',
    'reactions': 'Previous anaesthetic reactions',
    'other': 'Other'
  };

  const doacIndicationLabels: Record<string, string> = {
    'dvt-pe-acute': 'DVT/PE (acute)',
    'dvt-pe-prev': 'DVT/PE (prevention)',
    'af': 'Atrial fibrillation',
    'other': 'Other'
  };

  const renderField = (label: string, value: any, lookupTable?: Record<string, string>, units?: string, coded?: boolean) => {
    return <FbRoVField label={label} value={value} lookupTable={lookupTable} units={units} coded={coded} />;
  };

  return (
    <div className="bg-white h-screen max-h-screen overflow-hidden flex flex-col fb-waiting-list-rov-container" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', fontFamily: "'Roboto', sans-serif", fontWeight: 300, lineHeight: 1.1 }}>
      <FbRoVHeader title="Waiting list card" patient={patient} formStatus={formStatus} />

      {/* Middle Grid with Left Sidebar and Scrollable Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Panel (Omitting counters, with indicator arrows matching EV style) */}
        <nav className="w-64 overflow-y-auto hidden md:block" style={{ backgroundColor: 'white', padding: '0.4rem' }}>
          <div className="fb-waiting-list-rov-nav-grid">
            {[
              { id: 'section-from', name: 'From' },
              { id: 'section-listing', name: 'Listing & priority' },
              { id: 'section-procedure', name: 'Planned procedure(s)' },
              { id: 'section-risks', name: 'Specific operative risks' },
              { id: 'section-preop', name: 'Pre-operative' },
              { id: 'section-anaesthesia', name: 'Anaesthesia' },
              { id: 'section-postop', name: 'Post-op' },
              { id: 'section-other', name: 'Other' }
            ].map((section) => {
              const isActive = activeSection === section.id;
              return (
                <React.Fragment key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="fb-waiting-list-rov-nav-section-name"
                    id={`nav-${section.id}`}
                  >
                    {section.name}
                  </a>
                  <span
                    className={`fb-waiting-list-rov-nav-indicator ${!isActive ? "hidden" : ""}`}
                  >
                    ◄►
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* Scrollable Document */}
        <div className="flex-grow flex-shrink flex-1 overflow-y-auto rov-scroll-container" style={{ scrollBehavior: 'smooth', minHeight: 0 }}>
          <div className="space-y-4" style={{ padding: '0.4rem' }}>

            {/* Section 1: From */}
            {(formState.organisation || formState.speciality || formState.hospital || formState.seniorClinician) && (
              <div id="section-from">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>From</h3>
                <div style={{ marginTop: '0.4rem' }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderField('Organisation', formState.organisation, organisationLabels)}
                  {renderField('Speciality', formState.speciality, specialityLabels)}
                  {renderField('Hospital', formState.hospital, hospitalLabels)}
                  {renderField('Senior responsible clinician', formState.seniorClinician, undefined, undefined, formState.seniorClinician_coded)}
                </div>
              </div>
            )}

            {/* Section 2: Listing and priority */}
            {(formState.dateListed || formState.listedBy || formState.urgency ||
              formState.operatingSurgeon || formState.shortNotice || formState.rcsPriority) && (
              <div id="section-listing">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>Listing and priority</h3>
                <div style={{ marginTop: '0.4rem' }}>
                  
                  {/* Row 1 */}
                  <FbQuestionRow cols={4}>
                    {renderField('Date listed', formState.dateListed)}
                    <FbQuestionRowCell span={2}>
                      {renderField('Listed by', formState.listedBy, undefined, undefined, formState.listedBy_coded)}
                    </FbQuestionRowCell>
                    <div></div>
                  </FbQuestionRow>

                  {/* Row 2 - Urgency, Operating surgeon, Patient available, Royal College of Surgeons priority */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      {formState.urgency && (
                        <div className="space-y-2 fb-question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Urgency</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {urgencyLabels[formState.urgency] || formState.urgency}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {formState.operatingSurgeon && (
                        <div className="space-y-2 fb-question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Operating surgeon</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {operatingSurgeonLabels[formState.operatingSurgeon] || formState.operatingSurgeon}
                          </div>
                          {formState.operatingSurgeon === 'named_clinician' && formState.namedClinicianName && (
                            <div style={{ marginTop: '0.4rem', paddingLeft: '0.6rem', borderLeft: '2px solid rgb(27, 110, 194)' }}>
                              <span style={{ fontWeight: 300, fontSize: '0.8rem' }}>Clinician name:</span>
                              <div style={{ fontWeight: 500 }}>{formState.namedClinicianName}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      {formState.shortNotice && formState.shortNotice !== 'unknown' && (
                        <div className="space-y-2 fb-question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Patient available at short notice</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {yesNoLabels[formState.shortNotice] || formState.shortNotice}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {formState.rcsPriority && formState.rcsPriority !== 'unknown' && (
                        <div className="space-y-2 fb-question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Royal College of Surgeons priority</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {rcsPriorityLabels[formState.rcsPriority] || formState.rcsPriority}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Section 3: Planned procedure(s) */}
            {procedures && procedures.some(p => p.procedure) && (
              <div id="section-procedure">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>Planned procedure(s)</h3>
                <div style={{ marginTop: '0.4rem' }}>
                  <FbTable>
                    <FbTableHeader>
                      <FbTableRow>
                        <FbTableHeaderCell style={{ width: '25%' }}>Side</FbTableHeaderCell>
                        <FbTableHeaderCell style={{ width: '75%' }}>Procedure</FbTableHeaderCell>
                      </FbTableRow>
                    </FbTableHeader>
                    <FbTableBody>
                      {procedures.filter(p => p.procedure).map((proc) => (
                        <FbTableRow key={proc.id}>
                          <FbRoVTableCell>
                            {sideLabels[proc.side] || proc.side || '—'}
                          </FbRoVTableCell>
                          <FbRoVTableCell>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{proc.procedure}</span>
                              {proc.procedure_coded !== undefined && (
                                proc.procedure_coded ? (
                                  <span className="material-icons" style={{ color: '#008000', fontSize: '1.2rem', verticalAlign: 'middle' }} title="Coded">
                                    check_circle_outline
                                  </span>
                                ) : (
                                  <span className="material-icons" style={{ color: '#fd8a10', fontSize: '1.2rem', verticalAlign: 'middle' }} title="Not coded">
                                    warning
                                  </span>
                                )
                              )}
                            </div>
                            {proc.additionalInfo && (
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#666',
                                fontWeight: 300,
                                marginTop: '0.1rem'
                              }}>
                                <span style={{ fontStyle: 'italic', color: '#888' }}>Additional info: </span>
                                {proc.additionalInfo}
                              </div>
                            )}
                          </FbRoVTableCell>
                        </FbTableRow>
                      ))}
                    </FbTableBody>
                  </FbTable>
                </div>
              </div>
            )}

            {/* Section 4: Specific operative risks */}
            {((formState.risks && formState.risks.length > 0) || formState.anticoagInstructions ||
              (formState.anticoagChecked && (formState.anticoagChecked.doac || formState.anticoagChecked.warfarin || formState.anticoagChecked.aspirin || formState.anticoagChecked.clopidogrel || formState.anticoagChecked.other))) && (
              <div id="section-risks">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>Specific operative risks</h3>
                <div style={{ marginTop: '0.4rem' }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Column 1: Risks list */}
                  <div>
                    {formState.risks && formState.risks.length > 0 && (
                      <div className="space-y-2 fb-question-container">
                        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Risks</label>
                        <div className="space-y-2 pl-2">
                          {formState.risks.map((riskValue: string) => (
                            <div key={riskValue} className="space-y-1">
                              <div style={{ fontWeight: 500 }}>
                                ☑ {riskLabels[riskValue] || riskValue}
                              </div>
                              {riskValue === 'reactions' && formState.riskReactionsDetail && (
                                <div style={{ marginLeft: '1rem', paddingLeft: '0.4rem', borderLeft: '2px solid red' }}>
                                  <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Details</div>
                                  <div style={{ fontWeight: 500, whiteSpace: 'pre-line' }}>{formState.riskReactionsDetail}</div>
                                </div>
                              )}
                              {riskValue === 'other' && formState.riskOtherDetail && (
                                <div style={{ marginLeft: '1rem', paddingLeft: '0.4rem', borderLeft: '2px solid red' }}>
                                  <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Details</div>
                                  <div style={{ fontWeight: 500, whiteSpace: 'pre-line' }}>{formState.riskOtherDetail}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Anticoagulants */}
                  <div>
                    {formState.anticoagChecked && (
                      <div className="space-y-3 fb-question-container">
                        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Anticoagulants &amp; antiplatelets</label>
                        <div className="space-y-3 pl-2">
                          
                          {/* DOAC */}
                          {formState.anticoagChecked.doac && (
                            <div className="space-y-1">
                              <div style={{ fontWeight: 500 }}>☑ DOAC</div>
                              <div className="pl-4 space-y-1">
                                {formState['doac-name'] && (
                                  <div>
                                    <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Drug name</div>
                                    <div style={{ fontWeight: 500 }}>{formState['doac-name']}</div>
                                  </div>
                                )}
                                {formState['doac-indication'] && (
                                  <div>
                                    <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Indication</div>
                                    <div style={{ fontWeight: 500 }}>
                                      {doacIndicationLabels[formState['doac-indication']] || formState['doac-indication']}
                                      {formState['doac-indication'] === 'other' && formState['doac-indication-other'] && ` (${formState['doac-indication-other']})`}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Warfarin */}
                          {(formState.anticoagChecked.warfarin || formState.anticoagChecked.warp) && (
                            <div className="space-y-1">
                              <div style={{ fontWeight: 500 }}>☑ Warfarin</div>
                              {(formState['warfarin-indication'] || formState['warp-indication']) && (
                                <div className="pl-4">
                                  <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Indication</div>
                                  <div style={{ fontWeight: 500 }}>
                                    {doacIndicationLabels[formState['warfarin-indication'] || formState['warp-indication']] || formState['warfarin-indication'] || formState['warp-indication']}
                                    {((formState['warfarin-indication'] === 'other') || (formState['warp-indication'] === 'other')) && (formState['warfarin-indication-other'] || formState['warp-indication-other']) && ` (${formState['warfarin-indication-other'] || formState['warp-indication-other']})`}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Aspirin */}
                          {formState.anticoagChecked.aspirin && (
                            <div className="space-y-1">
                              <div style={{ fontWeight: 500 }}>☑ Aspirin</div>
                              <div className="pl-4 space-y-1">
                                {formState['aspirin-indication'] && (
                                  <div>
                                    <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Indication</div>
                                    <div style={{ fontWeight: 500 }}>
                                      {formState['aspirin-indication'] === 'pain' ? 'Pain' : formState['aspirin-indication'] === 'stroke' ? 'Stroke prevention' : 'Other'}
                                      {formState['aspirin-indication'] === 'other' && formState['aspirin-indication-other'] && ` (${formState['aspirin-indication-other']})`}
                                    </div>
                                  </div>
                                )}
                                {formState['aspirin-dose'] && (
                                  <div>
                                    <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Dose</div>
                                    <div style={{ fontWeight: 500 }}>
                                      {formState['aspirin-dose']}
                                      {formState['aspirin-dose'] === 'other' && formState['aspirin-dose-other'] && ` (${formState['aspirin-dose-other']})`}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Clopidogrel */}
                          {formState.anticoagChecked.clopidogrel && (
                            <div style={{ fontWeight: 500 }}>☑ Clopidogrel</div>
                          )}

                          {/* Other Anticoagulant */}
                          {formState.anticoagChecked.other && (
                            <div className="space-y-1">
                              <div style={{ fontWeight: 500 }}>☑ Other anticoagulant or antiplatelet</div>
                              <div className="pl-4 space-y-1">
                                {formState['anticoag-other-med'] && (
                                  <div>
                                    <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Medication</div>
                                    <div style={{ fontWeight: 500 }}>{formState['anticoag-other-med']}</div>
                                  </div>
                                )}
                                {formState['anticoag-other-indication'] && (
                                  <div>
                                    <div style={{ fontWeight: 300, fontSize: '0.8rem' }}>Indication</div>
                                    <div style={{ fontWeight: 500 }}>{formState['anticoag-other-indication']}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Intructions */}
                  <div>
                    {renderField("Surgeon's specific anticoagulant instructions", formState.anticoagInstructions)}
                  </div>

                </div>
              </div>
            )}

            {(formState.intendedManagement || formState.admitBefore !== undefined || formState.estimatedAdmission || formState.imagingRequired) && (
              <div id="section-preop">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>Pre-operative</h3>
                <div style={{ marginTop: '0.4rem' }}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      {formState.intendedManagement && formState.intendedManagement !== 'unknown' && (
                        <div className="space-y-2 fb-question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Intended management</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {managementLabels[formState.intendedManagement] || formState.intendedManagement}
                          </div>
                        </div>
                      )}
                    </div>
                    {renderField('Admit before surgery', formState.admitBefore, undefined, 'days')}
                    {renderField('Estimated date of admission', formState.estimatedAdmission)}
                    <div>
                      {formState.imagingRequired && formState.imagingRequired !== 'unknown' && (
                        <div className="space-y-2 fb-question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Pre-operative imaging required</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {yesNoLabels[formState.imagingRequired] || formState.imagingRequired}
                          </div>
                          {formState.imagingRequired === 'yes' && formState.imagingDetails && (
                            <div style={{ marginTop: '0.4rem', paddingLeft: '0.6rem', borderLeft: '2px solid rgb(27, 110, 194)' }}>
                              <span style={{ fontWeight: 300, fontSize: '0.8rem' }}>Details:</span>
                              <div style={{ fontWeight: 500, whiteSpace: 'pre-line' }}>{formState.imagingDetails}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Section 6: Anaesthesia */}
            {(formState.anaestheticType || formState.anaesthesiaRequirements) && (
              <div id="section-anaesthesia">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>Anaesthesia</h3>
                <FbQuestionRow cols={3} style={{ marginTop: '0.4rem' }}>
                  <div>
                    {formState.anaestheticType && formState.anaestheticType !== 'unknown' && (
                      <div className="space-y-2 fb-question-container">
                        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Planned anaesthetic type</label>
                        <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                          ● {yesNoLabels[formState.anaestheticType] || operatingSurgeonLabels[formState.anaestheticType] || formState.anaestheticType}
                        </div>
                      </div>
                    )}
                  </div>
                  <FbQuestionRowCell span={2}>
                    {renderField('Anaesthesia special requirements or issues', formState.anaesthesiaRequirements)}
                  </FbQuestionRowCell>
                </FbQuestionRow>
              </div>
            )}

            {/* Section 7: Post-op */}
            {(formState.postopStay || formState.bedRequirement || formState.postopRequirements) && (
              <div id="section-postop">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>Post-op</h3>
                <div style={{ marginTop: '0.4rem' }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField('Planned length of post-op stay', formState.postopStay, undefined, 'days')}
                  <div>
                    {formState.bedRequirement && formState.bedRequirement !== 'unknown' && (
                      <div className="space-y-2 fb-question-container">
                        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Bed requirement</label>
                        <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                          ● {bedLabels[formState.bedRequirement] || formState.bedRequirement}
                        </div>
                      </div>
                    )}
                  </div>
                  {renderField('Special post-op requirements', formState.postopRequirements)}
                </div>
              </div>
            )}

            {/* Section 8: Other */}
            {(formState.outsourcing || formState.otherInfo) && (
              <div id="section-other">
                <h3 className="font-bold text-white" style={{
                  backgroundColor: 'rgb(27, 110, 194)',
                  fontWeight: 500,
                  padding: '0.2rem',
                  paddingLeft: '0.4rem',
                  margin: 0
                }}>Other</h3>
                <FbQuestionRow cols={3} style={{ marginTop: '0.4rem' }}>
                  <div>
                    {formState.outsourcing && formState.outsourcing !== 'unknown' && (
                      <div className="space-y-2 fb-question-container">
                        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Could this case be outsourced?</label>
                        <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                          ● {yesNoLabels[formState.outsourcing] || formState.outsourcing}
                        </div>
                      </div>
                    )}
                  </div>
                  <FbQuestionRowCell span={2}>
                    {renderField('Any other information', formState.otherInfo)}
                  </FbQuestionRowCell>
                </FbQuestionRow>
              </div>
            )}

          </div>
        </div>
      </div>

      <FbRoVFooter
        username={username}
        reachedByRoVButton={reachedByRoVButton}
        onSwitchToEV={onSwitchToEV}
        onBack={onBack}
      />

    </div>
  );
}
