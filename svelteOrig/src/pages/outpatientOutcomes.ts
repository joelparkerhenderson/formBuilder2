import '../styles/global.css';
import OutpatientOutcomes from './OutpatientOutcomes.svelte';
import { mount } from 'svelte';

mount(OutpatientOutcomes, { target: document.getElementById('app')! });
