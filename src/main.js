import { createApp } from 'vue';
import App from './Aframe.vue';

import { generate } from './utils/maze';
const maze = generate(10, 10);
console.log(maze);

createApp(App).mount('#app');