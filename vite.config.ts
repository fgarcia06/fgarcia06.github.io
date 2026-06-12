import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// fgarcia06.github.io is a user pages site served from the domain root,
// so base stays '/'.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    // The only oversized chunk is the lazy, desktop-only three.js scene.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
