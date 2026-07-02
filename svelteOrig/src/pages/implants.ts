import '../styles/global.css';
import Implants from './Implants.svelte';
import { mount } from 'svelte';

mount(Implants, { target: document.getElementById('app')! });
