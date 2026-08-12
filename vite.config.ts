import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works when served from a subpath, e.g.
  // GitHub Project Pages at https://<user>.github.io/<repo>/.
  base: './',
  plugins: [react(), tailwindcss()],
})
