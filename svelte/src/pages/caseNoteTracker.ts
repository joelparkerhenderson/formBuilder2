import '../styles/global.css';
import { mount } from 'svelte';
import CaseNoteTracker from './CaseNoteTracker.svelte';

mount(CaseNoteTracker, {
  target: document.getElementById('app')!,
});
