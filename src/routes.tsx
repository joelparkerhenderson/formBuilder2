import React from 'react';
import { Navigate, createBrowserRouter, createHashRouter } from 'react-router';
import Home from './Home';
import WaitingListCard from './WaitingListCard';
import OperationNote from './OperationNote';
import OutpatientOutcome from './OutpatientOutcome';
import TreatmentSummary from './TreatmentSummary';
import PatientRecord from './PatientRecord';
import PatientRegistry from './PatientRegistry';
import PatientSearch from './PatientSearch';
import Controller from './Controller';

const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/formBuilder2/index.html',
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
    path: '/treatment-summary',
    element: <TreatmentSummary />,
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
    path: '/controller.html',
    element: <Controller />,
  },
  {
    path: '/formBuilder2/controller.html',
    element: <Controller />,
  },
  {
    path: '/designer.html',
    element: <Navigate to="/controller.html" replace />,
  },
  {
    path: '/formBuilder2/designer.html',
    element: <Navigate to="/formBuilder2/controller.html" replace />,
  },
  {
    path: '/userForm.html',
    element: <Controller />,
  },
  {
    path: '/formBuilder2/userForm.html',
    element: <Controller />,
  },
  {
    path: '/userForms/:publicId',
    element: <Controller />,
  },
  {
    path: '/userForm/:publicId',
    element: <Controller />,
  },
  {
    path: '/formBuilder2/userForm/:publicId',
    element: <Controller />,
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
