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
import Composer from './Composer';
import ComponentLibrary from './ComponentLibrary';

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
    path: '/components.html',
    element: <ComponentLibrary />,
  },
  {
    path: '/formBuilder2/components.html',
    element: <ComponentLibrary />,
  },
  {
    path: '/composer.html',
    element: <Composer />,
  },
  {
    path: '/formBuilder2/composer.html',
    element: <Composer />,
  },
  {
    path: '/controller.html',
    element: <Navigate to="/composer.html" replace />,
  },
  {
    path: '/formBuilder2/controller.html',
    element: <Navigate to="/formBuilder2/composer.html" replace />,
  },
  {
    path: '/designer.html',
    element: <Navigate to="/composer.html" replace />,
  },
  {
    path: '/formBuilder2/designer.html',
    element: <Navigate to="/formBuilder2/composer.html" replace />,
  },
  {
    path: '/userForm.html',
    element: <Composer />,
  },
  {
    path: '/formBuilder2/userForm.html',
    element: <Composer />,
  },
  {
    path: '/userForms/:publicId',
    element: <Composer />,
  },
  {
    path: '/userForm/:publicId',
    element: <Composer />,
  },
  {
    path: '/formBuilder2/userForm/:publicId',
    element: <Composer />,
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
