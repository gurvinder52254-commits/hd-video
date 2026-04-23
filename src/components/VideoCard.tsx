import React from 'react';
import type { Video } from '../hooks/useVideos';
import { Play } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  isActive?: boolean;
}

export function VideoCard({ video, onClick, isActive }: VideoCardProps) {
  return (
    <div 
      className={`video-card ${isActive ? 'active-card' : ''}`} 
      onClick={() => onClick(video)}
    >
      <div className="thumbnail-container">
        <img src={video.thumbnail} alt={video.title} className="thumbnail" />
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
