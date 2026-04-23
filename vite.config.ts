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
        const STORE_DIR = path.join(process.cwd(), 'public', 'videoStore');
        const VIDEOS_DIR = path.join(STORE_DIR, 'videos');
        const THUMBS_DIR = path.join(STORE_DIR, 'thumbnails');
        const LIBRARY_FILE = path.join(STORE_DIR, 'library.json');

        // Create folders on startup
        fs.mkdirSync(VIDEOS_DIR, { recursive: true });
        fs.mkdirSync(THUMBS_DIR, { recursive: true });
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
          const url = req.url?.split('?')[0];

          // ─── Upload a file ─────────────────────────────────────────
          if (url === '/api/upload' && req.method === 'POST') {
            try {
              const filename = req.headers['x-filename'] as string || '';
              const fileId = req.headers['x-file-id'] as string || '';
              const fileType = req.headers['x-file-type'] as string || ''; // 'video' or 'thumbnail'

              const dir = fileType === 'thumbnail' ? THUMBS_DIR : VIDEOS_DIR;
              const ext = path.extname(filename);
              const savedName = `${fileId}${ext}`;
              const filepath = path.join(dir, savedName);

              const body = await readBody(req);
              fs.writeFileSync(filepath, body as Buffer);

              const servePath = `/videoStore/${fileType === 'thumbnail' ? 'thumbnails' : 'videos'}/${savedName}`;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ url: servePath, filename: savedName }));
            } catch (err) {
              console.error('Upload error:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Upload failed' }));
            }
            return;
          }

          // ─── Read / Write library.json ─────────────────────────────
          if (url === '/api/library') {
            if (req.method === 'GET') {
              try {
                const data = fs.readFileSync(LIBRARY_FILE, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
              } catch {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ videos: [] }));
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
                console.error('Save library error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Save failed' }));
              }
              return;
            }
          }

          // ─── Delete video files ────────────────────────────────────
          if (url === '/api/delete-video' && req.method === 'POST') {
            try {
              const body = await readBody(req) as Buffer;
              const { videoFilename, thumbFilename } = JSON.parse(body.toString());

              if (videoFilename) {
                const vPath = path.join(VIDEOS_DIR, videoFilename);
                if (fs.existsSync(vPath)) fs.unlinkSync(vPath);
              }
              if (thumbFilename) {
                const tPath = path.join(THUMBS_DIR, thumbFilename);
                if (fs.existsSync(tPath)) fs.unlinkSync(tPath);
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error('Delete error:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Delete failed' }));
            }
            return;
          }

          // Pass through to Vite for everything else
          next();
        });
      }
    }
  ],
})
