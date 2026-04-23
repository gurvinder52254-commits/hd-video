# Video Store
This folder is the conceptual home for your video library.

Uploaded videos and thumbnails are stored in the browser's **IndexedDB** 
(a high-performance local database built into Chrome/Edge/Firefox).

This means:
- ✅ Videos persist across page reloads
- ✅ No backend server is needed
- ✅ Works on Vercel (static hosting)
- ✅ Files stay on your device's hard drive

Video metadata (titles, descriptions) are saved in **localStorage**.
