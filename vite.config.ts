import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect when building for GitHub Pages (set in workflow) to apply correct base path
// Adjust repoName if this repository is renamed.
const repoName = 'CA-Research'
const base = process.env.GITHUB_PAGES ? `/${repoName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
