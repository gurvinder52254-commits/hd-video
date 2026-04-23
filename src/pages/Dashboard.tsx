import React, { useState, useRef } from 'react';
import { useVideos } from '../hooks/useVideos';
import type { Video } from '../hooks/useVideos';
import { Plus, Edit2, Trash2, X, Check, Upload, Link as LinkIcon, FileVideo, Image as ImageIcon } from 'lucide-react';

export function Dashboard() {
  const { videos, addVideo, updateVideoMetadata, removeVideo, featuredUrl, updateFeaturedUrl, loading } = useVideos();
  const [isAdding, setIsAdding] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    url: '',
    thumbnail: ''
  });

  const [files, setFiles] = useState<{ video?: File; thumb?: File }>({});

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateVideoMetadata(editingId, { title: formData.title, description: formData.description });
      setEditingId(null);
      showStatus('success', 'Video updated successfully!');
    } else {
      if (uploadMode === 'file' && !files.video) {
        showStatus('error', 'Please select a video file!');
        return;
      }
      if (uploadMode === 'url' && !formData.url) {
        showStatus('error', 'Please enter a YouTube URL!');
        return;
      }
      await addVideo(
        formData.title,
        formData.url,
        formData.thumbnail,
        uploadMode === 'file',
        files.video,
        files.thumb,
        formData.description,
        formData.duration
      );
      setIsAdding(false);
      showStatus('success', uploadMode === 'file' ? 'Video saved to store!' : 'Video link added!');
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', duration: '', url: '', thumbnail: '' });
    setFiles({});
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (video: Video) => {
    setEditingId(video.id);
    setFormData({
      title: video.title,
      description: video.description || '',
      duration: video.duration || '',
      url: video.url,
      thumbnail: video.thumbnail
    });
    setIsAdding(true);
  };

  if (loading) return <div className="container">Loading storage...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {statusMsg && (
        <div className={`glass`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 2rem',
          background: statusMsg.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white',
          zIndex: 1000,
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <h1>Video Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isAdding && (
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
              <Plus size={18} /> Add New Video
            </button>
          )}
        </div>
      </div>

      {/* Featured Experience */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', border: '2px solid var(--primary-light)' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LinkIcon size={20} /> Premium Featured Experience
        </h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const input = (e.target as HTMLFormElement).elements.namedItem('featuredUrl') as HTMLInputElement;
          if (input.value) {
            updateFeaturedUrl(input.value);
            showStatus('success', 'Featured video updated!');
          }
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              name="featuredUrl"
              className="input-field"
              type="url"
              placeholder="YouTube URL (e.g. https://youtu.be/...)"
              defaultValue={featuredUrl}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              Update
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
              onClick={() => {
                if (window.confirm('Are you sure you want to remove the featured video?')) {
                  updateFeaturedUrl('');
                  const input = document.getElementsByName('featuredUrl')[0] as HTMLInputElement;
                  if (input) input.value = '';
                }
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </form>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          This video plays automatically at the bottom of the Home page.
        </p>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Video' : 'Add New Video'}</h2>

          {!editingId && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', padding: '4px', background: '#f1f5f9', borderRadius: '12px', width: 'fit-content' }}>
              <button
                type="button"
                className={`btn ${uploadMode === 'file' ? 'btn-primary' : ''}`}
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', color: uploadMode === 'file' ? 'white' : 'var(--text-muted)', background: uploadMode === 'file' ? 'var(--primary)' : 'transparent' }}
                onClick={() => setUploadMode('file')}
              >
                Upload Video
              </button>
              <button
                type="button"
                className={`btn ${uploadMode === 'url' ? 'btn-primary' : ''}`}
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', color: uploadMode === 'url' ? 'white' : 'var(--text-muted)', background: uploadMode === 'url' ? 'var(--primary)' : 'transparent' }}
                onClick={() => setUploadMode('url')}
              >
                YouTube Link
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Video Title</label>
              <input
                className="input-field"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter video title"
              />
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Description</label>
              <textarea
                className="input-field"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter short description"
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            {/* YouTube URL input */}
            {uploadMode === 'url' && !editingId && (
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>YouTube URL</label>
                <input
                  className="input-field"
                  type="url"
                  value={formData.url}
                  onChange={e => {
                    const url = e.target.value;
                    let thumb = '';
                    try {
                      if (url.includes('youtu.be/')) {
                        const id = url.split('/').pop()?.split('?')[0];
                        thumb = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
                      } else if (url.includes('watch?v=')) {
                        const id = new URLSearchParams(new URL(url).search).get('v');
                        thumb = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
                      }
                    } catch { /* invalid url, ignore */ }
                    setFormData({ ...formData, url, thumbnail: thumb || formData.thumbnail });
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
            )}

            {/* File upload inputs */}
            {uploadMode === 'file' && !editingId && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label className="input-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Video File</label>
                  <div
                    className="glass"
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: files.video ? '2px solid var(--primary)' : '2px dashed var(--border)',
                      background: files.video ? 'var(--primary-light)' : 'white'
                    }}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <FileVideo size={32} style={{ marginBottom: '0.5rem', color: 'var(--primary)' }} />
                    <p style={{ fontSize: '0.8rem' }}>{files.video ? files.video.name : 'Select Video'}</p>
                    {files.video && (
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {(files.video.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={e => setFiles({ ...files, video: e.target.files?.[0] })}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Thumbnail Image</label>
                  <div
                    className="glass"
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: files.thumb ? '2px solid var(--primary)' : '2px dashed var(--border)',
                      background: files.thumb ? 'var(--primary-light)' : 'white'
                    }}
                    onClick={() => thumbInputRef.current?.click()}
                  >
                    <ImageIcon size={32} style={{ marginBottom: '0.5rem', color: 'var(--primary)' }} />
                    <p style={{ fontSize: '0.8rem' }}>{files.thumb ? files.thumb.name : 'Select Image'}</p>
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => setFiles({ ...files, thumb: e.target.files?.[0] })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={18} /> {editingId ? 'Save Changes' : (uploadMode === 'file' ? 'Upload Video' : 'Add to Library')}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Video List Table */}
      <div className="glass" style={{ overflowX: 'auto' }}>
        <table className="video-list-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No videos yet. Click "Add New Video" to get started.
                </td>
              </tr>
            )}
            {videos.map(video => (
              <tr key={video.id}>
                <td>
                  <img src={video.thumbnail} alt="" style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td style={{ fontWeight: 500 }}>{video.title}</td>
                <td>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: video.isLocal ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: video.isLocal ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: '10px'
                  }}>
                    {video.isLocal ? 'LOCAL FILE' : 'IFRAME URL'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => startEdit(video)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => removeVideo(video.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
