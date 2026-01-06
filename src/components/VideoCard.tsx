import { Video } from '../types';
import { formatViewCount, formatPublishedDate } from '../services/youtube';
import { useApp } from '../context/AppContext';

interface VideoCardProps {
  video: any;
  isCustom?: boolean;
}

export const VideoCard = ({ video, isCustom = false }: VideoCardProps) => {
  const { setSelectedVideoId, setCurrentPage } = useApp();

  if (isCustom) {
    const handleClick = () => {
      if (video.id) {
        setSelectedVideoId(video.id);
        setCurrentPage('watch');
      }
    };

    return (
      <div onClick={handleClick} className="cursor-pointer group">
        <div className="relative aspect-video mb-2 overflow-hidden rounded-xl">
          <img
            src={video.thumbnail || 'https://via.placeholder.com/400x225'}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600">
              {video.title}
            </h3>
            <p className="text-xs text-gray-600 mb-1">{video.channel_id}</p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{video.views || 0} просмотров</span>
              <span>•</span>
              <span>{new Date(video.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
  const thumbnail = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url;
  const viewCount = video.statistics?.viewCount;

  const handleClick = () => {
    if (videoId) {
      setSelectedVideoId(videoId);
      setCurrentPage('watch');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <div className="relative aspect-video mb-2 overflow-hidden rounded-xl">
        <img
          src={thumbnail}
          alt={video.snippet.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600">
            {video.snippet.title}
          </h3>
          <p className="text-xs text-gray-600 mb-1">{video.snippet.channelTitle}</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {viewCount && <span>{formatViewCount(parseInt(viewCount))} просмотров</span>}
            <span>•</span>
            <span>{formatPublishedDate(video.snippet.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
