import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base "./" makes the build relocatable, which is safe for GitHub Pages
// project sites (https://<user>.github.io/<repo>/) without hard-coding
// the repository name.
export default defineConfig({
  plugins: [react()],
  base: './',
})
