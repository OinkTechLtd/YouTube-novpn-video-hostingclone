import { useState } from 'react';
import { Upload as UploadIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { videoService, channelService } from '../services/videoHosting';
import { supabase } from '../lib/supabase';

export const UploadPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to upload videos');
        return;
      }

      let channelId = null;
      const existingChannel = await channelService.getChannelByCreatorId(user.id);

      if (!existingChannel) {
        const newChannel = await channelService.createChannel(
          user.id,
          user.email?.split('@')[0] || 'Channel',
          'My Channel',
          '',
          ''
        );
        channelId = newChannel.id;
      } else {
        channelId = existingChannel.id;
      }

      if (!title.trim() || !videoUrl.trim()) {
        setError('Title and video URL are required');
        return;
      }

      await videoService.uploadVideo(
        channelId,
        title,
        description,
        videoUrl,
        thumbnail || 'https://via.placeholder.com/400x225',
        0
      );

      setSuccess('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 mb-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your video"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL *
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail URL
          </label>
          <input
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://example.com/thumbnail.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          <UploadIcon className="w-5 h-5" />
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};
