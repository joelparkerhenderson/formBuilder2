import '../styles/global.css';
import TreatmentSummary from './TreatmentSummary.svelte';
import { mount } from 'svelte';

mount(TreatmentSummary, { target: document.getElementById('app')! });
