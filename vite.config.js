import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@domain':       path.resolve(__dirname, 'src/domain'),
      '@application':  path.resolve(__dirname, 'src/application'),
      '@infra':        path.resolve(__dirname, 'src/infrastructure'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@assets':       path.resolve(__dirname, 'assets'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
