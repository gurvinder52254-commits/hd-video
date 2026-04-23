import React, { useState, useEffect } from 'react';
import { useVideos } from '../hooks/useVideos';
import type { Video } from '../hooks/useVideos';
import { VideoCard } from '../components/VideoCard';
import { VideoPlayer } from '../components/VideoPlayer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VIDEOS_PER_PAGE = 4;

export function Home() {
  const { videos, featuredUrl, loading } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!selectedVideo && videos.length > 0) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  if (loading) return <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>Loading...</div>;

  const currentVideo = selectedVideo || videos[0] || null;

  // Pagination logic
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const indexOfLastVideo = currentPage * VIDEOS_PER_PAGE;
  const indexOfFirstVideo = indexOfLastVideo - VIDEOS_PER_PAGE;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container" 
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
      onClick={() => !hasInteracted && setHasInteracted(true)}
    >
      <VideoPlayer video={currentVideo} />

      <div style={{ marginTop: '0.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Library</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{videos.length} videos</span>
        </div>

        {videos.length > 0 ? (
          <div className="video-grid">
            {currentVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={handleVideoSelect}
                isActive={selectedVideo?.id === video.id}
              />
            ))}
          </div>
        ) : (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', border: '2px dashed var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your library is empty. Add some videos from the dashboard!</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} /> Prev
            </button>

            <div className="page-info">
              Page {currentPage} / {totalPages}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '4rem', padding: '3rem 0', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
          Premium Featured Experience {!hasInteracted && <span style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', fontWeight: 500 }}>(Click anywhere on page to Unlock Playback)</span>}
        </h2>
        <div className="player-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="player-wrapper" style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <iframe
              src={`${featuredUrl}?autoplay=${hasInteracted ? 1 : 0}&mute=0&controls=1&rel=0`}
              title="Featured Content"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
