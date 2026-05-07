import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const defaultSiteUrl = 'http://localhost:5174';
  const siteUrl = env.VITE_SITE_URL || defaultSiteUrl;
  const serverPort = (() => {
    try {
      const port = new URL(siteUrl).port;
      return port ? Number.parseInt(port, 10) : 5174;
    } catch {
      return 5174;
    }
  })();

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: serverPort,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Origin', siteUrl);
              proxyReq.setHeader('Referer', `${siteUrl}/`);
            });
          },
        },
      },
    },
  };
});
