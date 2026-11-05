const { defineConfig } = require('vite');

module.exports = defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
});
