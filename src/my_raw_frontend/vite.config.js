import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'buffer': 'buffer/'
    }
  },
  // You might also need to explicitly configure index.html as the entry point if it's not detected automatically
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: 'index.html', // This might be needed for multi-page apps
  //     },
  //   },
  // },
});