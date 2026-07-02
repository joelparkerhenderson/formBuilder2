import '../styles/global.css';
import { mount } from 'svelte';
import ComponentLibrary from './ComponentLibrary.svelte';

mount(ComponentLibrary, {
  target: document.getElementById('app')!,
});
