import React from 'react';
import { createBrowserRouter, createHashRouter } from 'react-router';
import Home from './Home';
import WaitingListCard from './WaitingListCard';
import OperationNote from './OperationNote';
import OutpatientOutcome from './OutpatientOutcome';
import PatientRecord from './PatientRecord';
import PatientRegistry from './PatientRegistry';
import PatientSearch from './PatientSearch';

const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/waiting-list',
    element: <WaitingListCard />,
  },
  {
    path: '/operation-note',
    element: <OperationNote />,
  },
  {
    path: '/outpatient-outcome',
    element: <OutpatientOutcome />,
  },
  {
    path: '/patient-record',
    element: <PatientRecord />,
  },
  {
    path: '/patient-registry',
    element: <PatientRegistry />,
  },
  {
    path: '/patient-search',
    element: <PatientSearch />,
  },
  {
    path: '*',
    element: <Home />,
  },
];

const isStaticSwasEntry = /(?:^|\/)formBuilder2(?:\.index\.html|\/index\.html)$/.test(window.location.pathname);

export const router = isStaticSwasEntry
  ? createHashRouter(routes)
  : createBrowserRouter(routes);
