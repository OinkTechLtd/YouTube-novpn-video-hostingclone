import { useEffect, useState } from 'react';
import { BarChart3, Eye, ThumbsUp, Users, Loader2 } from 'lucide-react';
import { channelService, videoService } from '../services/videoHosting';
import { supabase } from '../lib/supabase';

interface ChannelStats {
  channelName: string;
  subscribers: number;
  totalViews: number;
  totalLikes: number;
  videos: any[];
}

export const StudioPage = () => {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadStudio();
  }, []);

  const loadStudio = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const channel = await channelService.getChannelByCreatorId(user.id);

      if (channel) {
        const videos = await videoService.getChannelVideos(channel.id);
        const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
        const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);

        setStats({
          channelName: channel.name,
          subscribers: channel.subscriber_count || 0,
          totalViews,
          totalLikes,
          videos,
        });

        setChannelName(channel.name);
        setChannelDescription(channel.description || '');
      }
    } catch (error) {
      console.error('Error loading studio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChannel = async () => {
    try {
      setSaveLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const channel = await channelService.getChannelByCreatorId(user.id);
      if (channel) {
        await supabase
          .from('custom_channels')
          .update({ name: channelName, description: channelDescription })
          .eq('id', channel.id);

        setEditMode(false);
        loadStudio();
      }
    } catch (error) {
      console.error('Error saving channel:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">Create your channel first to access the studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Studio Dashboard</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editMode ? 'Cancel' : 'Edit Channel'}
          </button>
        </div>

        {editMode ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Channel Settings</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSaveChannel}
              disabled={saveLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Subscribers</p>
              <p className="text-2xl font-bold">{stats.subscribers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Videos</p>
              <p className="text-2xl font-bold">{stats.videos.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Your Videos</h2>
        </div>

        {stats.videos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.videos.map((video) => (
                  <tr key={video.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {video.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(video.views || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(video.likes || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(video.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No videos uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
