import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fbReadOnly as FbReadOnly, fbReadOnlyTableCell as FbReadOnlyTableCell } from './components/fbReadOnly';
import { fbRoVFooter as FbRoVFooter, fbRoVHeader as FbRoVHeader } from './components/fbRoVShell';
import {
  fbTable as FbTable,
  fbTableHeader as FbTableHeader,
  fbTableBody as FbTableBody,
  fbTableRow as FbTableRow,
  fbTableHeaderCell as FbTableHeaderCell
} from "./components/fbTable";
import { hospitalLabels, organisationLabels, sideLabels, specialityLabels } from './data/formLabels';

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
  hospital_number: string;
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
  text?: string;
  anaesthetists: Array<{id: number, name: string}>;
  urgencyType: string;
  electiveUrgency: string;
  finalChecked: boolean;
  formStatus: string;
  username: string;
  openedFromPatientRecord: boolean;
  onSwitchToEV: () => void;
  onBack: () => void;
  reachedByRoVButton?: boolean;
  superseded?: boolean;
  onHistory?: (anchorRect: DOMRect) => void;
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
    onBack,
    reachedByRoVButton,
    superseded,
    onHistory
  } = props;

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

  const renderField = (label: string, value: any, lookupTable?: Record<string, string>) => {
    return <FbReadOnly label={label} value={value} lookupTable={lookupTable} />;
  };

  return (
    <div className="bg-white flex flex-col h-screen" style={{ height: '100vh', fontWeight: 300, lineHeight: 1.1 }}>
        <div className="flex flex-col h-full">
          <FbRoVHeader title="Operation note" patient={patient} formStatus={formStatus} superseded={superseded} />

          {/* Middle Section - Nav Panel and Scrollable Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Navigation Panel */}
            <nav className="w-64 overflow-y-auto" style={{backgroundColor: 'white'}}>
              <div className="fb-layout-nav-grid">
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
                      <a href={section.href} className="fb-layout-nav-section-name" id={`nav-${section.id}`}>
                        {section.name}
                      </a>
                      <span style={{width: 0}}></span>
                      <span className={`fb-layout-nav-indicator ${!isActive ? 'hidden' : ''}`}>
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
                        <div className="space-y-2 fb-question-container">
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
                    <div className="overflow-x-auto">
                      <FbTable>
                        <FbTableHeader>
                          <FbTableRow>
                            <FbTableHeaderCell style={{ width: '20%' }}>Side</FbTableHeaderCell>
                            <FbTableHeaderCell style={{ width: '40%' }}>Procedure</FbTableHeaderCell>
                            <FbTableHeaderCell>Additional information</FbTableHeaderCell>
                          </FbTableRow>
                        </FbTableHeader>
                        <FbTableBody>
                          {procedures.filter(p => p.procedure).map((proc) => (
                            <FbTableRow key={proc.id}>
                              <FbReadOnlyTableCell>
                                {sideLabels[proc.side] || proc.side || '—'}
                              </FbReadOnlyTableCell>
                              <FbReadOnlyTableCell>
                                {proc.procedure}
                              </FbReadOnlyTableCell>
                              <FbReadOnlyTableCell tone="muted">
                                {proc.additionalInfo || '—'}
                              </FbReadOnlyTableCell>
                            </FbTableRow>
                          ))}
                        </FbTableBody>
                      </FbTable>
                    </div>
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
                        <div className="space-y-2 fb-question-container">
                          <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Operative diagnoses</label>
                          <div className="overflow-x-auto" style={{ marginTop: '0.4rem' }}>
                            <FbTable>
                              <FbTableHeader>
                                <FbTableRow>
                                  <FbTableHeaderCell style={{ width: '100%' }}>Diagnosis</FbTableHeaderCell>
                                </FbTableRow>
                              </FbTableHeader>
                              <FbTableBody>
                                {diagnoses.filter(d => d.diagnosis).map((diag) => (
                                  <FbTableRow key={diag.id}>
                                    <FbReadOnlyTableCell verticalAlign={undefined}>
                                      {diag.diagnosis}
                                    </FbReadOnlyTableCell>
                                  </FbTableRow>
                                ))}
                              </FbTableBody>
                            </FbTable>
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
                    <div className="overflow-x-auto">
                      <FbTable>
                        <FbTableHeader>
                          <FbTableRow>
                            <FbTableHeaderCell style={{ width: '20%' }}>A, B, C</FbTableHeaderCell>
                            <FbTableHeaderCell>Description</FbTableHeaderCell>
                          </FbTableRow>
                        </FbTableHeader>
                        <FbTableBody>
                          {specimens.filter(s => s.label || s.description).map((specimen) => (
                            <FbTableRow key={specimen.id}>
                              <FbReadOnlyTableCell>
                                {specimen.label || '—'}
                              </FbReadOnlyTableCell>
                              <FbReadOnlyTableCell tone="muted">
                                {specimen.description || '—'}
                              </FbReadOnlyTableCell>
                            </FbTableRow>
                          ))}
                        </FbTableBody>
                      </FbTable>
                    </div>
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
                    <div className="overflow-x-auto">
                      <FbTable style={{ tableLayout: 'auto' }}>
                        <FbTableHeader>
                          <FbTableRow>
                            <FbTableHeaderCell style={{ width: '25%' }}>Implant Id</FbTableHeaderCell>
                            <FbTableHeaderCell style={{ width: '45%' }}>Type / description</FbTableHeaderCell>
                            <FbTableHeaderCell style={{ width: '15%' }}>Requires exchange or removal?</FbTableHeaderCell>
                            <FbTableHeaderCell style={{ width: '15%' }}>Remove by</FbTableHeaderCell>
                          </FbTableRow>
                        </FbTableHeader>
                        <FbTableBody>
                          {implants.filter(i => i.implantId || i.description).map((implant) => (
                            <FbTableRow key={implant.id}>
                              <FbReadOnlyTableCell>
                                {implant.implantId || '—'}
                              </FbReadOnlyTableCell>
                              <FbReadOnlyTableCell tone="muted">
                                {implant.description || '—'}
                              </FbReadOnlyTableCell>
                              <FbReadOnlyTableCell>
                                {implant.requiresRemoval ? (implant.requiresRemoval === 'yes' ? 'Yes' : 'No') : '—'}
                              </FbReadOnlyTableCell>
                              <FbReadOnlyTableCell>
                                {implant.requiresRemoval === 'yes' ? (implant.removeBy || '—') : '—'}
                              </FbReadOnlyTableCell>
                            </FbTableRow>
                          ))}
                        </FbTableBody>
                      </FbTable>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
          <FbRoVFooter
            username={username}
            formStatus={formStatus}
            reachedByRoVButton={reachedByRoVButton}
            onSwitchToEV={onSwitchToEV}
            onBack={onBack}
            superseded={superseded}
            onHistory={onHistory}
            hideModeControls={openedFromPatientRecord}
          />
        </div>
      </div>
  );
}
