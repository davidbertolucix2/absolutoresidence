import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || 'https://absolutoresidence.vercel.app').replace(/\/$/, '');

  return {
    server: { host: '::', port: 5173 },
    plugins: [
      react(),
      {
        name: 'html-tokens',
        transformIndexHtml(html) {
          return html.replaceAll('{{OG_IMAGE}}', `${siteUrl}/img/og.jpg`).replaceAll('{{SITE_URL}}', siteUrl);
        },
      },
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
  };
});
