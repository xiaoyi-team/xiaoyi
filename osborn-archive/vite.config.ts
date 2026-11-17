import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ publicDir: fileURLToPath(new URL('../public/', import.meta.url)), plugins: [react(), tailwindcss()], server: { proxy: { "/api": { target: "http://115.159.121.83:8001", changeOrigin: true, rewrite: path => path.replace(/^\/api/, "") } } } });

