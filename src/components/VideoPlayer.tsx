import type { Video } from '../hooks/useVideos';

interface VideoPlayerProps {
  video: Video | null;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  if (!video) {
    return (
      <div className="player-container" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <p style={{ color: 'var(--text-muted)' }}>Select a video to play</p>
      </div>
    );
  }

  const isYouTube = video.url.includes('youtube.com') || video.url.includes('youtu.be');

  return (
    <div className="player-container">
      <div className="player-wrapper" style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        {isYouTube ? (
          <iframe
            src={`${video.url}${video.url.includes('?') ? '&' : '?'}autoplay=1&mute=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          ></iframe>
        ) : (
          <video
            key={video.id}
            src={video.url}
            controls
            autoPlay
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </div>
      <div className="player-info" style={{ marginTop: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{video.title}</h1>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>{video.description || 'A stunning video experience.'}</p>
      </div>
    </div>
  );
}
