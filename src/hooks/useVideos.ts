import { useState, useEffect } from 'react';
import { storeFile, getFile, deleteFile } from './storage';

const VIDEOS_METADATA_KEY = 'videohub_videos';
const FEATURED_KEY = 'featured_video_url';

export type Video = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  url: string;
  thumbnail?: string;
  createdAt: number;
  isLocal: boolean;
};

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredUrl, setFeaturedUrl] = useState<string>('https://www.youtube.com/embed/nO_iH-m29pY');
  const [loading, setLoading] = useState(true);

  // Load videos and featuredUrl from browser storage (IndexedDB + localStorage)
  useEffect(() => {
    const load = async () => {
      try {
        // Load Featured URL from localStorage
        const storedFeatured = localStorage.getItem(FEATURED_KEY);
        if (storedFeatured) setFeaturedUrl(storedFeatured);

        // Load Metadata from localStorage
        const storedMetadata = localStorage.getItem(VIDEOS_METADATA_KEY);
        if (storedMetadata) {
          const metadata: Video[] = JSON.parse(storedMetadata);
          
          // Restore Blob URLs for local videos from IndexedDB
          const restoredVideos = await Promise.all(metadata.map(async (v) => {
            if (v.isLocal) {
              const blob = await getFile(v.id);
              if (blob) {
                return { ...v, url: URL.createObjectURL(blob) };
              }
            }
            return v;
          }));
          setVideos(restoredVideos);
        }
      } catch (err) {
        console.error('Failed to load library:', err);
      }
      setLoading(false);
    };

    load();
  }, []);

  // Internal helper to save all metadata to localStorage
  const saveMetadataToLocalStorage = (newVideos: Video[], newFeaturedUrl: string) => {
    try {
      // We only save metadata, not the temporary Blob URLs
      const metadataToSave = newVideos.map(v => ({
        ...v,
        url: v.isLocal ? '' : v.url // Blob URLs are temporary, clear them for storage
      }));
      
      localStorage.setItem(VIDEOS_METADATA_KEY, JSON.stringify(metadataToSave));
      localStorage.setItem(FEATURED_KEY, newFeaturedUrl);
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  };

  const updateFeaturedUrl = (url: string) => {
    let embedUrl = url;
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('watch?v=')) {
      const id = new URLSearchParams(new URL(url).search).get('v');
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }

    setFeaturedUrl(embedUrl);
    saveMetadataToLocalStorage(videos, embedUrl);
  };

  const addVideo = async (
    title: string, videoUrl: string,
    isLocal: boolean, videoFile?: File,
    description?: string, duration?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    let finalUrl = videoUrl;

    if (isLocal && videoFile) {
      // Store the actual file in IndexedDB
      await storeFile(id, videoFile);
      // Create a temporary URL for the current session
      finalUrl = URL.createObjectURL(videoFile);
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
      isLocal
    };

    const updatedVideos = [newVideo, ...videos];
    setVideos(updatedVideos);
    saveMetadataToLocalStorage(updatedVideos, featuredUrl);
    return id;
  };

  const updateVideoMetadata = (id: string, updates: Partial<Video>) => {
    const newVideos = videos.map(v => v.id === id ? { ...v, ...updates } : v);
    setVideos(newVideos);
    saveMetadataToLocalStorage(newVideos, featuredUrl);
  };

  const removeVideo = async (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video?.isLocal) {
      await deleteFile(id);
    }
    const filtered = videos.filter(v => v.id !== id);
    setVideos(filtered);
    saveMetadataToLocalStorage(filtered, featuredUrl);
  };

  return { videos, addVideo, updateVideoMetadata, removeVideo, featuredUrl, updateFeaturedUrl, loading };
}
