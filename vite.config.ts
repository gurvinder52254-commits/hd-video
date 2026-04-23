import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import type { IncomingMessage } from 'http'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'video-store-plugin',
      configureServer(server) {
        const STORE_DIR = path.join(process.cwd(), 'public', 'store');
        const VIDEOS_DIR = path.join(STORE_DIR, 'videos');
        const LIBRARY_FILE = path.join(STORE_DIR, 'library.json');

        // Create folders on startup
        fs.mkdirSync(VIDEOS_DIR, { recursive: true });
        if (!fs.existsSync(LIBRARY_FILE)) {
          fs.writeFileSync(LIBRARY_FILE, JSON.stringify({ videos: [], featuredUrl: 'https://www.youtube.com/embed/nO_iH-m29pY' }, null, 2));
        }

        // Helper: read full request body as Buffer
        const readBody = (req: IncomingMessage): Promise<Buffer> => {
          return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
          });
        };

        server.middlewares.use(async (req, res, next) => {
          const url = req.url?.split('?')[0] || '';
          
          // Log all API requests to terminal
          if (url.includes('/api/')) {
            console.log(`[VideoStore] ${req.method} ${url}`);
          }

          // ─── Upload a file ─────────────────────────────────────────
          if (url.includes('/api/upload') && req.method === 'POST') {
            try {
              // Filenames might be URI encoded
              const rawFilename = req.headers['x-filename'] as string || 'video.mp4';
              const filename = decodeURIComponent(rawFilename);
              const fileId = req.headers['x-file-id'] as string || Date.now().toString();

              const ext = path.extname(filename);
              const savedName = `${fileId}${ext}`;
              const filepath = path.join(VIDEOS_DIR, savedName);

              console.log(`[VideoStore] Saving file: ${filename} -> ${savedName}`);
              const body = await readBody(req);
              fs.writeFileSync(filepath, body as Buffer);
              console.log(`[VideoStore] Successfully saved ${body.length} bytes to ${filepath}`);

              const servePath = `/store/videos/${savedName}`;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ url: servePath, filename: savedName }));
            } catch (err) {
              console.error('[VideoStore] Upload error:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}` }));
            }
            return;
          }

          // ─── Read / Write library.json ─────────────────────────────
          if (url.includes('/api/library')) {
            if (req.method === 'GET') {
              try {
                const data = fs.readFileSync(LIBRARY_FILE, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
              } catch {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ videos: [], featuredUrl: '' }));
              }
              return;
            }

            if (req.method === 'POST') {
              try {
                const body = await readBody(req);
                fs.writeFileSync(LIBRARY_FILE, body as Buffer);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                console.error('[VideoStore] Save library error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Save failed' }));
              }
              return;
            }
          }

          // Pass through to Vite for everything else
          next();
        });
      }
    }
  ],
})
