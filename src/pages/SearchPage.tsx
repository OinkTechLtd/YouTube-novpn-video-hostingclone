import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchVideos, searchChannels } from '../services/youtube';
import { Video, Channel } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Loader2 } from 'lucide-react';

export const SearchPage = () => {
  const { searchQuery, setSelectedChannelId, setCurrentPage } = useApp();
  const [videos, setVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'channels'>('videos');

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const [videoResults, channelResults] = await Promise.all([
        searchVideos(searchQuery, 30),
        searchChannels(searchQuery, 20),
      ]);
      setVideos(videoResults);
      setChannels(channelResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = (channelId: string) => {
    setSelectedChannelId(channelId);
    setCurrentPage('channel');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <div className="mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-2 md:pb-3 px-2 md:px-4 font-medium text-xs md:text-base whitespace-nowrap transition-colors ${
              activeTab === 'videos'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Видео ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`pb-2 md:pb-3 px-2 md:px-4 font-medium text-xs md:text-base whitespace-nowrap transition-colors ${
              activeTab === 'channels'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Каналы ({channels.length})
          </button>
        </div>
      </div>

      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          {videos.map((video) => {
            const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
            return <VideoCard key={videoId} video={video} />;
          })}
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          {channels.map((channel) => {
            const channelId = typeof channel.id === 'string' ? channel.id : channel.id.channelId;
            return (
              <div
                key={channelId}
                onClick={() => channelId && handleChannelClick(channelId)}
                className="cursor-pointer p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url}
                    alt={channel.snippet.title}
                    className="w-32 h-32 rounded-full mb-4"
                  />
                  <h3 className="font-semibold text-lg mb-2">{channel.snippet.title}</h3>
                  {channel.statistics && (
                    <p className="text-sm text-gray-600 mb-2">
                      {parseInt(channel.statistics.subscriberCount).toLocaleString()} подписчиков
                    </p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {channel.snippet.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
