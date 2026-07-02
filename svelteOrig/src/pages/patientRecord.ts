import '../styles/global.css';
import PatientRecord from './PatientRecord.svelte';
import { mount } from 'svelte';

mount(PatientRecord, { target: document.getElementById('app')! });
