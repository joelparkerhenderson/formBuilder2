import '../styles/global.css';
import PatientRegistry from './PatientRegistry.svelte';
import { mount } from 'svelte';

mount(PatientRegistry, { target: document.getElementById('app')! });
