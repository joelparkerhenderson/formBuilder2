import '../styles/global.css';
import Composer from './Composer.svelte';
import { mount } from 'svelte';

mount(Composer, { target: document.getElementById('app')! });
