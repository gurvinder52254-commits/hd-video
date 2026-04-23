import { useState, useEffect } from 'react';



export type Video = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  url: string;
  thumbnail?: string;
  createdAt: number;
  isLocal: boolean;
  videoFilename?: string;
  thumbFilename?: string;
};

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredUrl, setFeaturedUrl] = useState<string>('https://www.youtube.com/embed/nO_iH-m29pY');
  const [loading, setLoading] = useState(true);

  // Load videos and featuredUrl from library.json (stored in public/videoStore/)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/library');
        const data = await res.json();
        setVideos(data.videos || []);
        if (data.featuredUrl) {
          setFeaturedUrl(data.featuredUrl);
        }
      } catch (err) {
        console.error('Failed to load library:', err);
      }
      setLoading(false);
    };

    load();
  }, []);

  // Internal helper to save all state to the server
  const saveStateToServer = async (newVideos: Video[], newFeaturedUrl: string) => {
    try {
      await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videos: newVideos, 
          featuredUrl: newFeaturedUrl 
        })
      });
    } catch (err) {
      console.error('Failed to save library:', err);
    }
  };

  // Save video list to library.json
  const saveLibrary = async (newVideos: Video[]) => {
    setVideos(newVideos);
    await saveStateToServer(newVideos, featuredUrl);
  };

  const updateFeaturedUrl = async (url: string) => {
    // Convert watch URL to embed URL if needed
    let embedUrl = url;
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('watch?v=')) {
      const id = new URLSearchParams(new URL(url).search).get('v');
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }

    setFeaturedUrl(embedUrl);
    await saveStateToServer(videos, embedUrl);
  };

  // Upload a single file to the videoStore folder
  const uploadFile = async (file: File, id: string, type: 'video' | 'thumbnail'): Promise<{ url: string; filename: string }> => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-Filename': file.name,
        'X-File-Id': id,
        'X-File-Type': type
      },
      body: file
    });
    return res.json();
  };

  const addVideo = async (
    title: string, videoUrl: string, 
    isLocal: boolean, videoFile?: File,
    description?: string, duration?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    let finalUrl = videoUrl;
    let videoFilename = '';

    if (isLocal && videoFile) {
      // Upload video file → saved to public/videoStore/videos/
      const videoResult = await uploadFile(videoFile, id, 'video');
      finalUrl = videoResult.url;
      videoFilename = videoResult.filename;
    } else if (!isLocal) {
      // Convert YouTube URL to embed format
      if (finalUrl.includes('youtu.be/')) {
        const vid = finalUrl.split('/').pop()?.split('?')[0];
        finalUrl = `https://www.youtube.com/embed/${vid}`;
      } else if (finalUrl.includes('watch?v=')) {
        const vid = new URLSearchParams(new URL(finalUrl).search).get('v');
        finalUrl = `https://www.youtube.com/embed/${vid}`;
      }
    }

    const newVideo: Video = {
      id,
      title,
      description,
      duration: duration || '0:00',
      url: finalUrl,
      createdAt: Date.now(),
      isLocal,
      videoFilename
    };

    await saveLibrary([newVideo, ...videos]);
    return id;
  };

  const updateVideoMetadata = async (id: string, updates: Partial<Video>) => {
    const newVideos = videos.map(v => v.id === id ? { ...v, ...updates } : v);
    await saveLibrary(newVideos);
  };

  const removeVideo = async (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video?.isLocal) {
      // Delete actual files from videoStore folder
      try {
        await fetch('/api/delete-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoFilename: video.videoFilename,
            thumbFilename: video.thumbFilename
          })
        });
      } catch (err) {
        console.error('Failed to delete files:', err);
      }
    }
    const filtered = videos.filter(v => v.id !== id);
    await saveLibrary(filtered);
  };

  return { videos, addVideo, updateVideoMetadata, removeVideo, featuredUrl, updateFeaturedUrl, loading };
}
