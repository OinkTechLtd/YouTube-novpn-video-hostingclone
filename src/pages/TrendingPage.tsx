import { useEffect, useState } from 'react';
import { Video } from '../types';
import { getPopularVideos } from '../services/youtube';
import { VideoCard } from '../components/VideoCard';
import { Loader2 } from 'lucide-react';

export const TrendingPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await getPopularVideos(40);
      setVideos(data);
    } catch (error) {
      console.error('Error loading trending videos:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">В тренде</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
        {videos.map((video) => {
          const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
          return <VideoCard key={videoId} video={video} />;
        })}
      </div>
    </div>
  );
};
