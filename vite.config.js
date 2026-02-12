import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// Post-build plugin
function createPostBuildPlugin() {
  return {
    name: 'postprocess-output',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const htmlPath = path.join(distDir, 'index.html');
      const aspxPath = path.join(distDir, 'index.aspx');

      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = html.replace(/(["'])\/assets\//g, '$1../assets/');
        fs.writeFileSync(aspxPath, html, 'utf-8');
        fs.unlinkSync(htmlPath);
        console.log('✅ index.html → index.aspx و مسیرها اصلاح شد');
      }

      const assetsDir = path.join(distDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const cssFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.css'));
        for (const file of cssFiles) {
          const cssPath = path.join(assetsDir, file);
          let css = fs.readFileSync(cssPath, 'utf-8');
          css = css.replace(/url\(\s*\/([^)]*\.(woff2?|ttf|eot|otf))\s*\)/g, 'url(../$1)');
          fs.writeFileSync(cssPath, css, 'utf-8');
          console.log(`🔧 مسیر فونت‌ها اصلاح شد در ${file}`);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const mainUrl = env.VITE_MAIN_URL;

  return {
    plugins: [react(), tailwindcss(), createPostBuildPlugin()],

    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 100000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) return 'vendor';
            if (id.includes('src/components')) return 'components';
          },
          assetFileNames(assetInfo) {
            if (/\.(woff2?|ttf|eot|otf)$/i.test(assetInfo.name || '')) {
              return '[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },

    define: {
      __MAIN_URL__: JSON.stringify(mainUrl),
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // optional alias
      },
    },

    server: {
      port: 3001,
      open: true,
      strictPort: true,
    },

    optimizeDeps: {
      include: ['react', 'react-dom'], // speed up dev server
    },
  };
});
