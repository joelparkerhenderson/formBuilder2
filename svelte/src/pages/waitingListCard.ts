import '../styles/global.css';
import { mount } from 'svelte';
import WaitingListCard from './WaitingListCard.svelte';

mount(WaitingListCard, {
  target: document.getElementById('app')!,
});
