import '../styles/global.css';
import PatientSearch from './PatientSearch.svelte';
import { mount } from 'svelte';

mount(PatientSearch, { target: document.getElementById('app')! });
