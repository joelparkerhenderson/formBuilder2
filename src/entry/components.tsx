import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import '../App';
import ComponentLibrary from '../ComponentLibrary';
import '../index.css';

const Router = window.location.pathname.startsWith('/formBuilder2/') ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <ComponentLibrary />
    </Router>
  </StrictMode>,
);
