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
};

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredUrl, setFeaturedUrl] = useState<string>('https://www.youtube.com/embed/nO_iH-m29pY');
  const [loading, setLoading] = useState(true);

  // Load videos and featuredUrl from library.json (stored in public/store/)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/library');
        if (!res.ok) throw new Error('Failed to load library metadata');
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
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videos: newVideos,
          featuredUrl: newFeaturedUrl
        })
      });
      if (!res.ok) throw new Error('Failed to save library metadata');
    } catch (err) {
      console.error('Failed to save library:', err);
      throw err;
    }
  };

  // Upload a single file to the public/store/videos/ folder
  const uploadFile = async (file: File, id: string): Promise<{ url: string; filename: string }> => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-Filename': encodeURIComponent(file.name), // Encoding special characters like Hindi text
        'X-File-Id': id
      },
      body: file
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${res.status}`);
    }
    
    return res.json();
  };

  const updateFeaturedUrl = async (url: string) => {
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

  const addVideo = async (
    title: string, videoUrl: string,
    isLocal: boolean, videoFile?: File,
    description?: string, duration?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    let finalUrl = videoUrl;
    let videoFilename = '';

    try {
      if (isLocal && videoFile) {
        // Upload video file → saved to public/store/videos/
        const videoResult = await uploadFile(videoFile, id);
        finalUrl = videoResult.url;
        videoFilename = videoResult.filename;
      } else if (!isLocal) {
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

      const updatedVideos = [newVideo, ...videos];
      setVideos(updatedVideos);
      await saveStateToServer(updatedVideos, featuredUrl);
      return id;
    } catch (err) {
      console.error('Add video error:', err);
      throw err;
    }
  };

  const updateVideoMetadata = async (id: string, updates: Partial<Video>) => {
    const newVideos = videos.map(v => v.id === id ? { ...v, ...updates } : v);
    setVideos(newVideos);
    await saveStateToServer(newVideos, featuredUrl);
  };

  const removeVideo = async (id: string) => {
    const filtered = videos.filter(v => v.id !== id);
    setVideos(filtered);
    await saveStateToServer(filtered, featuredUrl);
  };

  return { videos, addVideo, updateVideoMetadata, removeVideo, featuredUrl, updateFeaturedUrl, loading };
}
