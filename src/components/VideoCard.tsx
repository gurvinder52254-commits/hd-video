import type { Video } from '../hooks/useVideos';
import { Play } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  isActive?: boolean;
}

export function VideoCard({ video, onClick, isActive }: VideoCardProps) {
  const getYouTubeId = (url: string) => {
    if (url.includes('youtu.be/')) return url.split('/').pop()?.split('?')[0];
    if (url.includes('watch?v=')) return new URLSearchParams(new URL(url).search).get('v');
    if (url.includes('embed/')) return url.split('embed/')[1]?.split('?')[0];
    return null;
  };

  const isYouTube = video.url.includes('youtube.com') || video.url.includes('youtu.be');
  const ytId = isYouTube ? getYouTubeId(video.url) : null;
  const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : video.thumbnail;

  return (
    <div 
      className={`video-card ${isActive ? 'active-card' : ''}`} 
      onClick={() => onClick(video)}
    >
      <div className="thumbnail-container">
        {video.isLocal ? (
          <video 
            src={`${video.url}#t=0.5`} 
            className="thumbnail" 
            muted 
            playsInline 
            preload="metadata"
          />
        ) : (
          <img src={thumbnailUrl || ''} alt={video.title} className="thumbnail" />
        )}
        <div className="play-overlay">
          <Play size={24} fill={isActive ? "white" : "currentColor"} />
        </div>
        {video.duration && (
          <div className="duration-badge">
            {video.duration}
          </div>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-description">{video.description || 'No description available.'}</p>
      </div>
    </div>
  );
}
