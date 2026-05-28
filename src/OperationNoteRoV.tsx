import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fbAddressograph as Addressograph } from './components/fbAddressograph';
import { fbDraftBadge as DraftBadge } from './components/fbDraftBadge';

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

interface OperationNoteRoVProps {
  patient: Patient | null;
  formState: Record<string, any>;
  procedures: Array<{id: number, side: string, procedure: string, additionalInfo: string}>;
  diagnoses: Array<{id: number, diagnosis: string}>;
  specimens: Array<{id: number, label: string, description: string}>;
  implants: Array<{id: number, implantId: string, description: string, requiresRemoval: string, removeBy: string}>;
  surgeons: Array<{id: number, name: string}>;
  anaesthetists: Array<{id: number, name: string}>;
  urgencyType: string;
  electiveUrgency: string;
  finalChecked: boolean;
  formStatus: string;
  username: string;
  openedFromPatientRecord: boolean;
  onSwitchToEV: () => void;
  onBack: () => void;
}

export function OperationNoteRoV(props: OperationNoteRoVProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');

  const {
    patient,
    formState,
    procedures,
    diagnoses,
    specimens,
    implants,
    surgeons,
    anaesthetists,
    urgencyType,
    electiveUrgency,
    finalChecked,
    formStatus,
    username,
    openedFromPatientRecord,
    onSwitchToEV,
    onBack
  } = props;

  // Lookup tables for select option values -> display text
  const organisationLabels: Record<string, string> = {
    'aneurin-bevan': 'Aneurin Bevan',
    'betsi-cadwaladr': 'Betsi Cadwaladr',
    'cardiff-vale': 'Cardiff & Vale',
    'cwm-taf': 'Cwm Taf Morgannwg',
    'hywel-dda': 'Hywel Dda',
    'powys': 'Powys',
    'swansea-bay': 'Swansea Bay',
    'velindre': 'Velindre'
  };

  const specialityLabels: Record<string, string> = {
    'general-surgery': 'General Surgery',
    'orthopaedics': 'Orthopaedics',
    'cardiothoracic': 'Cardiothoracic Surgery',
    'neurosurgery': 'Neurosurgery',
    'urology': 'Urology',
    'ent': 'ENT Surgery',
    'ophthalmology': 'Ophthalmology',
    'vascular': 'Vascular Surgery',
    'colorectal': 'Colorectal Surgery',
    'breast': 'Breast Surgery',
    'plastic': 'Plastic Surgery',
    'oral-maxillofacial': 'Oral & Maxillofacial Surgery'
  };

  const hospitalLabels: Record<string, string> = {
    'prince-charles': 'Prince Charles Hospital, Merthyr Tydfil',
    'royal-glamorgan': 'Royal Glamorgan Hospital, Llantrisant',
    'princess-wales': 'Princess of Wales Hospital, Bridgend'
  };

  const sideLabels: Record<string, string> = {
    'left': 'Left',
    'right': 'Right',
    'bilateral': 'Bilateral',
    'na': 'Not applicable'
  };

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id^="section-"]');
      let currentSection = '';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.id;
        }
      });

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    const scrollContainer = document.querySelector('.rov-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [activeSection]);

  // Helper to render a read-only field
  const renderField = (label: string, value: any, lookupTable?: Record<string, string>) => {
    if (!value || value === '' || value === 'Select side' || value === 'select') {
      return <div></div>;
    }
    const displayValue = lookupTable && lookupTable[value] ? lookupTable[value] : value;
    return (
      <div className="space-y-2 question-container">
        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>{label}</label>
        <div style={{ fontWeight: 500, marginLeft: '0.4rem', whiteSpace: 'pre-line' }}>{displayValue}</div>
      </div>
    );
  };

  return (
    <div className="bg-white flex flex-col h-screen" style={{ height: '100vh', fontWeight: 300, lineHeight: 1.1 }}>
        <div className="flex flex-col h-full">
          {/* Fixed Top Section - Title and Addressograph */}
          <div style={{ borderBottom: '0.2rem solid rgb(27, 110, 194)', marginBottom: '0.2rem', padding: '0.4rem' }}>
            <div className="flex justify-between items-center">
              <div>
                {formStatus === 'draft' && (
                  <>
                    <DraftBadge />
                    <br />
                  </>
                )}
                <h1 style={{ fontSize: '2rem', fontWeight: 500 }}>Operation note</h1>
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

          {/* Middle Section - Nav Panel and Scrollable Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Navigation Panel */}
            <nav className="w-64 overflow-y-auto" style={{backgroundColor: 'white'}}>
              <div className="nav-grid">
                {[
                  { href: '#section-basic', id: 'section-basic', name: 'Basic information' },
                  { href: '#section-staff', id: 'section-staff', name: 'Surgeons and anaesthetists' },
                  { href: '#section-prophylaxis', id: 'section-prophylaxis', name: 'Prophylaxis' },
                  { href: '#section-procedures', id: 'section-procedures', name: 'Procedures' },
                  { href: '#section-detail', id: 'section-detail', name: 'Detail' },
                  { href: '#section-specimens', id: 'section-specimens', name: 'Tissue removed' },
                  { href: '#section-images', id: 'section-images', name: 'Images' },
                  { href: '#section-implants', id: 'section-implants', name: 'Implants' }
                ].map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <React.Fragment key={section.href}>
                      <a href={section.href} className="nav-section-name" id={`nav-${section.id}`}>
                        {section.name}
                      </a>
                      <span style={{width: 0}}></span>
                      <span className={`nav-indicator ${!isActive ? 'hidden' : ''}`}>
                        ◄►
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </nav>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto rov-scroll-container" style={{ scrollBehavior: 'smooth', minHeight: 0 }}>

              {/* Basic information */}
              {(formState.organisation || formState.speciality || formState.hospital || urgencyType || formState.date || formState.startTime || formState.endTime) && (
                <div id="section-basic">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0}}>Basic information</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {renderField('Organisation', formState.organisation, organisationLabels)}
                      {renderField('Speciality', formState.speciality, specialityLabels)}
                      {renderField('Hospital', formState.hospital, hospitalLabels)}
                      <div></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{marginTop: '0.6rem'}}>
                      {urgencyType && (
                        <div className="space-y-2 question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Urgency</label>
                          <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                            ● {urgencyType === 'elective' ? ('Elective' + (electiveUrgency === 'routine' ? ' - Routine' : electiveUrgency === 'urgent' ? ' - Urgent' : electiveUrgency === 'usc' ? ' - USC' : '')) : 'Emergency'}
                          </div>
                        </div>
                      )}
                      {renderField('Date', formState.date)}
                      {renderField('Start', formState.startTime)}
                      {renderField('End', formState.endTime)}
                    </div>
                  </div>
                </div>
              )}

              {/* Surgeons and anaesthetists */}
              {(surgeons.some(s => s.name) || anaesthetists.some(a => a.name) || formState.supervisingSurgeon || formState.surgeonSRC || formState.supervisingAnaesthetist || formState.anaesthetistSRC) && (
                <div id="section-staff">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Surgeons and anaesthetists</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        {surgeons.filter(s => s.name).map((surgeon, idx) => (
                          <div key={surgeon.id}>
                            {renderField(idx === 0 ? 'Lead operating surgeon' : `${['Second', 'Third', 'Fourth'][idx - 1] || 'Additional'} surgeon`, surgeon.name)}
                          </div>
                        ))}
                        {formState.supervisingSurgeon && renderField('Supervising surgeon present', formState.supervisingSurgeon)}
                        {formState.surgeonSRC && renderField('SRC', formState.surgeonSRC)}
                      </div>
                      <div>
                        {anaesthetists.filter(a => a.name).map((anaesthetist, idx) => (
                          <div key={anaesthetist.id}>
                            {renderField(idx === 0 ? 'Lead anaesthetist' : `${['Second', 'Third', 'Fourth'][idx - 1] || 'Additional'} anaesthetist`, anaesthetist.name)}
                          </div>
                        ))}
                        {formState.supervisingAnaesthetist && renderField('Supervising anaesthetist present', formState.supervisingAnaesthetist)}
                        {formState.anaesthetistSRC && renderField('SRC', formState.anaesthetistSRC)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Prophylaxis */}
              {(formState.antibioticProphylaxis || formState.vteProphylaxis || formState.otherMedication) && (
                <div id="section-prophylaxis">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Prophylaxis and other specific preop or intraop medication</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderField('Antibiotic prophylaxis', formState.antibioticProphylaxis)}
                      {renderField('VTE prophylaxis', formState.vteProphylaxis)}
                      {renderField('Other medication given', formState.otherMedication)}
                    </div>
                  </div>
                </div>
              )}

              {/* Procedures */}
              {procedures.some(p => p.procedure) && (
                <div id="section-procedures">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Procedure(s)</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    {procedures.filter(p => p.procedure).map((proc, idx) => (
                      <div key={proc.id} style={{ marginBottom: idx < procedures.filter(p => p.procedure).length - 1 ? '0.6rem' : 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {renderField('Side', proc.side, sideLabels)}
                          <div className="md:col-span-3">
                            {renderField('Procedure', proc.procedure)}
                          </div>
                        </div>
                        {proc.additionalInfo && (
                          <div className="grid grid-cols-1" style={{marginTop: '0.4rem'}}>
                            {renderField('Additional information', proc.additionalInfo)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detail */}
              {(formState.indication || formState.incision || formState.findings || formState.procedureDescription || diagnoses.some(d => d.diagnosis) || formState.extraProcedures || formState.bloodLoss || formState.problems || formState.closure || formState.postOpInstructions || formState.followUp) && (
                <div id="section-detail">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Detail</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    <div className="grid grid-cols-1 gap-4">
                      {renderField('Indication', formState.indication)}
                      {renderField('Incision', formState.incision)}
                      {renderField('Findings', formState.findings)}
                      {renderField('Procedure description', formState.procedureDescription)}
                      {diagnoses.some(d => d.diagnosis) && (
                        <div className="space-y-2 question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Operative diagnoses</label>
                          <div style={{ marginLeft: '0.4rem' }}>
                            {diagnoses.filter(d => d.diagnosis).map((diag, idx) => (
                              <div key={diag.id} style={{ fontWeight: 500, marginTop: idx > 0 ? '0.2rem' : 0 }}>
                                {diag.diagnosis}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {renderField('Extra procedures', formState.extraProcedures)}
                      {renderField('Estimated blood loss (ml)', formState.bloodLoss)}
                      {renderField('Specific surgical intraoperative problems encountered', formState.problems)}
                      {renderField('Closure', formState.closure)}
                      {renderField('Post-op instructions', formState.postOpInstructions)}
                      {renderField('Follow-up', formState.followUp)}
                    </div>
                  </div>
                </div>
              )}

              {/* Tissue removed */}
              {specimens.some(s => s.label || s.description) && (
                <div id="section-specimens">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Tissue removed</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    {specimens.filter(s => s.label || s.description).map((specimen, idx) => (
                      <div key={specimen.id} style={{ marginBottom: idx < specimens.filter(s => s.label || s.description).length - 1 ? '0.6rem' : 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {renderField('Label', specimen.label)}
                          {renderField('Description', specimen.description)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {formState.images && (
                <div id="section-images">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Images</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    {renderField('Images', formState.images)}
                  </div>
                </div>
              )}

              {/* Implants */}
              {implants.some(i => i.implantId || i.description) && (
                <div id="section-implants">
                  <h3 className="font-bold text-white" style={{backgroundColor: 'rgb(27, 110, 194)', fontWeight: 500, padding: '0.2rem', paddingLeft: '0.4rem', margin: 0, marginTop: '0.4rem'}}>Implants - Scan for safety</h3>
                  <div style={{marginTop: '0.4rem', marginBottom: '0.6rem'}}>
                    {implants.filter(i => i.implantId || i.description).map((implant, idx) => (
                      <div key={implant.id} style={{ marginBottom: idx < implants.filter(i => i.implantId || i.description).length - 1 ? '0.6rem' : 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {renderField('Implant ID', implant.implantId)}
                          {renderField('Type / description', implant.description)}
                        </div>
                        {implant.requiresRemoval && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginTop: '0.4rem'}}>
                            <div className="space-y-2 question-container">
                              <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Requires exchange or removal</label>
                              <div style={{ fontWeight: 500, marginLeft: '0.4rem' }}>
                                ● {implant.requiresRemoval === 'yes' ? 'Yes' : 'No'}
                              </div>
                            </div>
                            {implant.requiresRemoval === 'yes' && implant.removeBy && renderField('Remove by', implant.removeBy)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Fixed Bottom Section - Controls */}
          <div style={{ borderTop: '0.2rem solid rgb(27, 110, 194)', marginTop: '0.2rem', paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: 0, paddingRight: 0 }}>
            <div className="flex items-center">
              {openedFromPatientRecord ? (
                <>
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
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#1b6ec2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.4rem',
                      display: 'inline-block',
                      height: '2.0rem',
                      lineHeight: '2rem',
                      marginLeft: '0.2rem',
                      padding: '0 0.5rem',
                      fontSize: '1rem',
                      fontWeight: 400,
                      cursor: 'pointer'
                    }}
                    onClick={onSwitchToEV}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#1b6ec2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.4rem',
                      display: 'inline-block',
                      height: '2.0rem',
                      lineHeight: '2rem',
                      marginLeft: '0.2rem',
                      padding: '0 0.5rem',
                      fontSize: '1rem',
                      fontWeight: 400,
                      cursor: 'pointer'
                    }}
                    onClick={onBack}
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#1b6ec2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.4rem',
                      display: 'inline-block',
                      height: '2.0rem',
                      lineHeight: '2rem',
                      marginLeft: '0.2rem',
                      padding: '0 0.5rem',
                      fontSize: '1rem',
                      fontWeight: 400,
                      cursor: 'pointer'
                    }}
                    onClick={onSwitchToEV}
                  >
                    EV
                  </button>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
