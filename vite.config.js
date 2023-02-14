import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {

  const config = {
    plugins: [vue({
      template: {
        compilerOptions: {
          // Allow A-Frame elements to be in Vue template
          isCustomElement: tag => tag.startsWith('a-')
        },
      },
    })],
  };

  return config;
});