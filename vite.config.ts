import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
    },
    // Explicitly define which env variables to expose to the client
    define: {
      'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.VITE_ANTHROPIC_API_KEY),
      'import.meta.env.VITE_USE_MOCK_AI': JSON.stringify(env.VITE_USE_MOCK_AI),
      'import.meta.env.VITE_EXPORT_API_URL': JSON.stringify(env.VITE_EXPORT_API_URL),
    },
  }
})
