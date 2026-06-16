import React from 'react';
import ReactDOM from 'react-dom/client';
import CaseNoteTracker from '../caseNoteTracker/CaseNoteTracker';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CaseNoteTracker />
  </React.StrictMode>
);
