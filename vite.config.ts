import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3003,
        host: '0.0.0.0',
        allowedHosts: ['lifeline.undground.fun'],
      },
      preview: {
        port: 3003,
        host: '0.0.0.0',
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor': ['react', 'react-dom'],
              'charts': ['recharts'],
              'icons': ['lucide-react'],
              'ai': ['openai'],
              'pdf': ['html2canvas', 'jspdf'],
            }
          }
        },
        chunkSizeWarningLimit: 600,
      },
      plugins: [
        react(),
        {
          name: 'copy-doc-folder',
          apply: 'build',
          enforce: 'post',
          closeBundle: async () => {
            const docSrc = path.resolve(__dirname, 'doc');
            const docDest = path.resolve(__dirname, 'dist', 'doc');

            // Recursively copy doc folder
            const copyDir = (src: string, dest: string) => {
              mkdirSync(dest, { recursive: true });
              readdirSync(src).forEach(file => {
                const srcPath = join(src, file);
                const destPath = join(dest, file);
                if (statSync(srcPath).isDirectory()) {
                  copyDir(srcPath, destPath);
                } else {
                  copyFileSync(srcPath, destPath);
                }
              });
            };

            try {
              copyDir(docSrc, docDest);
              console.log('✓ Copied doc folder to dist');
            } catch (err) {
              console.error('Failed to copy doc folder:', err);
            }
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.AI_API_KEY),
        'process.env.AI_API_KEY': JSON.stringify(env.AI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
