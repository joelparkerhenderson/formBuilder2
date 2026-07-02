import '../styles/global.css';
import OperationNote from './OperationNote.svelte';
import { mount } from 'svelte';

mount(OperationNote, { target: document.getElementById('app')! });
