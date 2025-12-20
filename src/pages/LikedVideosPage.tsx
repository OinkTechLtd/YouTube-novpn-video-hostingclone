import { useEffect, useState } from 'react';
import { getLikedVideos } from '../services/database';
import { LikedVideo } from '../types';
import { Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPublishedDate } from '../services/youtube';

export const LikedVideosPage = () => {
  const { setSelectedVideoId, setCurrentPage } = useApp();
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedVideos();
  }, []);

  const loadLikedVideos = async () => {
    try {
      setLoading(true);
      const data = await getLikedVideos();
      setLikedVideos(data);
    } catch (error) {
      console.error('Error loading liked videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCurrentPage('watch');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (likedVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p className="text-xl mb-2">Нет понравившихся видео</p>
        <p className="text-sm">Видео, которые вам понравились, появятся здесь</p>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Понравившиеся видео</h1>

      <div className="space-y-2 md:space-y-4">
        {likedVideos.map((item) => (
          <div
            key={item.id}
            onClick={() => handleVideoClick(item.video_id)}
            className="flex gap-2 md:gap-4 cursor-pointer hover:bg-gray-50 p-2 md:p-3 rounded-lg transition-colors"
          >
            <img
              src={item.video_thumbnail}
              alt={item.video_title}
              className="w-24 md:w-48 aspect-video rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-xs md:text-lg line-clamp-2 mb-1">{item.video_title}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">{item.channel_title}</p>
              <p className="text-xs text-gray-500">
                Понравилось {formatPublishedDate(item.liked_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
