import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import process from 'node:process';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  // codex/llm-prototype: main(5173)과 브라우저 저장소가 섞이지 않도록 포트를 분리한다.
  server: {
    port: 5174,
    strictPort: true,
    host: 'localhost',
    proxy: {
      // 로컬 Node API(server/index.js). 키는 서버에만 있고 브라우저는 /api만 호출한다.
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false },
    },
  },
  preview: {
    port: 4174,
    host: 'localhost',
  },
});
