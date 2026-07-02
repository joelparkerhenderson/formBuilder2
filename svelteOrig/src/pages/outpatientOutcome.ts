import '../styles/global.css';
import OutpatientOutcome from './OutpatientOutcome.svelte';
import { mount } from 'svelte';

mount(OutpatientOutcome, { target: document.getElementById('app')! });
