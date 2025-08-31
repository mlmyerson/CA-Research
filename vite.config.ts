import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Use project subpath for production builds on GitHub Pages; root in dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/CA-Research/' : '/',
  plugins: [react()],
}))
