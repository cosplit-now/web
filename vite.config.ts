import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), mkcert(), sentryVitePlugin({
    org: "muxinqi",
    project: "cosplit-web"
  })],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    sourcemap: true
  }
})