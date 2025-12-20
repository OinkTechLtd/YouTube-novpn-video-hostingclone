import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getChannelDetails, getChannelVideos } from '../services/youtube';
import { Channel, Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Loader2 } from 'lucide-react';
import { addSubscription, removeSubscription, isSubscribed } from '../services/database';

export const ChannelPage = () => {
  const { selectedChannelId } = useApp();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (selectedChannelId) {
      loadChannel();
      loadVideos();
      checkSubscribedStatus();
    }
  }, [selectedChannelId]);

  const loadChannel = async () => {
    if (!selectedChannelId) return;
    try {
      setLoading(true);
      const data = await getChannelDetails(selectedChannelId);
      setChannel(data);
    } catch (error) {
      console.error('Error loading channel:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    if (!selectedChannelId) return;
    try {
      const data = await getChannelVideos(selectedChannelId, 30);
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const checkSubscribedStatus = async () => {
    if (!selectedChannelId) return;
    try {
      const status = await isSubscribed(selectedChannelId);
      setSubscribed(status);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!channel) return;
    try {
      if (subscribed) {
        await removeSubscription(selectedChannelId!);
        setSubscribed(false);
      } else {
        await addSubscription(
          selectedChannelId!,
          channel.snippet.title,
          channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url
        );
        setSubscribed(true);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  if (loading || !channel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="pb-6 md:pb-8">
      <div className="bg-gradient-to-r from-red-500 to-red-600 h-24 md:h-48"></div>

      <div className="max-w-7xl mx-auto px-2 md:px-6 -mt-12 md:-mt-16">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 mb-4 md:mb-6">
          <img
            src={channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url}
            alt={channel.snippet.title}
            className="w-20 h-20 md:w-40 md:h-40 rounded-full border-2 md:border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">{channel.snippet.title}</h1>
            {channel.statistics && (
              <div className="flex flex-wrap gap-2 md:gap-6 text-white text-xs md:text-sm">
                <span>{parseInt(channel.statistics.subscriberCount).toLocaleString()} подписчиков</span>
                <span className="hidden sm:inline">•</span>
                <span>{parseInt(channel.statistics.videoCount).toLocaleString()} видео</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">{parseInt(channel.statistics.viewCount).toLocaleString()} просмотров</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSubscribe}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-medium text-xs md:text-base whitespace-nowrap transition-colors ${
              subscribed
                ? 'bg-gray-200 hover:bg-gray-300'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {subscribed ? 'Подписан' : 'Подписаться'}
          </button>
        </div>

        {channel.snippet.description && (
          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 mb-4 md:mb-6 shadow-sm">
            <h2 className="font-semibold text-base md:text-lg mb-2 md:mb-3">О канале</h2>
            <p className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap line-clamp-3 md:line-clamp-none">{channel.snippet.description}</p>
          </div>
        )}

        <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-sm">
          <h2 className="font-semibold text-base md:text-lg mb-3 md:mb-6">Видео</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
            {videos.map((video) => {
              const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
              return <VideoCard key={videoId} video={video} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
