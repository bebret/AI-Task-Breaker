import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Ikuti PORT dari .env agar proxy tidak menunjuk ke port yang salah.
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT || 3001;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          // 127.0.0.1, bukan localhost: di Windows localhost bisa resolve ke ::1
          // sementara server hanya listen di IPv4.
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  };
});
