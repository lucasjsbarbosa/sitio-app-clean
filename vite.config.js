import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Garante que os caminhos sejam relativos
  plugins: [react()],
});