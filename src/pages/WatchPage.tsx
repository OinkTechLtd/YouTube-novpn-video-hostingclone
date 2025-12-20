import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getVideoDetails, getRelatedVideos, formatViewCount, formatPublishedDate } from '../services/youtube';
import { Video } from '../types';
import { ThumbsUp, ThumbsDown, Share2, Loader2 } from 'lucide-react';
import { addToWatchHistory, addLikedVideo, removeLikedVideo, isVideoLiked, addSubscription, removeSubscription, isSubscribed } from '../services/database';
import { VideoCard } from '../components/VideoCard';
import { CommentsSection } from '../components/CommentsSection';

export const WatchPage = () => {
  const { selectedVideoId, setSelectedChannelId, setCurrentPage } = useApp();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (selectedVideoId) {
      loadVideo();
      loadRelatedVideos();
      checkLikedStatus();
    }
  }, [selectedVideoId]);

  useEffect(() => {
    if (video) {
      checkSubscribedStatus();
      saveToHistory();
    }
  }, [video]);

  const loadVideo = async () => {
    if (!selectedVideoId) return;
    try {
      setLoading(true);
      const data = await getVideoDetails(selectedVideoId);
      setVideo(data);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedVideos = async () => {
    if (!selectedVideoId) return;
    try {
      const data = await getRelatedVideos(selectedVideoId, 15);
      setRelatedVideos(data);
    } catch (error) {
      console.error('Error loading related videos:', error);
    }
  };

  const saveToHistory = async () => {
    if (!video) return;
    try {
      await addToWatchHistory(
        selectedVideoId!,
        video.snippet.title,
        video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
        video.snippet.channelTitle
      );
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const checkLikedStatus = async () => {
    if (!selectedVideoId) return;
    try {
      const status = await isVideoLiked(selectedVideoId);
      setLiked(status);
    } catch (error) {
      console.error('Error checking liked status:', error);
    }
  };

  const checkSubscribedStatus = async () => {
    if (!video) return;
    try {
      const status = await isSubscribed(video.snippet.channelId);
      setSubscribed(status);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleLike = async () => {
    if (!video) return;
    try {
      if (liked) {
        await removeLikedVideo(selectedVideoId!);
        setLiked(false);
      } else {
        await addLikedVideo(
          selectedVideoId!,
          video.snippet.title,
          video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
          video.snippet.channelTitle
        );
        setLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!video) return;
    try {
      if (subscribed) {
        await removeSubscription(video.snippet.channelId);
        setSubscribed(false);
      } else {
        await addSubscription(
          video.snippet.channelId,
          video.snippet.channelTitle,
          video.snippet.thumbnails.default?.url || ''
        );
        setSubscribed(true);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleChannelClick = () => {
    if (video) {
      setSelectedChannelId(video.snippet.channelId);
      setCurrentPage('channel');
    }
  };

  if (loading || !video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-black rounded-lg md:rounded-xl overflow-hidden mb-3 md:mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideoId}`}
              title={video.snippet.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <h1 className="text-lg md:text-xl font-semibold mb-3">{video.snippet.title}</h1>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4">
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <button
                onClick={handleChannelClick}
                className="flex items-center gap-2 md:gap-3"
              >
                <div className="w-8 md:w-10 h-8 md:h-10 bg-gray-300 rounded-full flex items-center justify-center text-xs md:text-base text-gray-600 font-semibold flex-shrink-0">
                  {video.snippet.channelTitle[0]}
                </div>
                <div className="hidden sm:block">
                  <div className="font-medium text-sm md:text-base">{video.snippet.channelTitle}</div>
                </div>
              </button>
              <button
                onClick={handleSubscribe}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-colors ${
                  subscribed
                    ? 'bg-gray-200 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {subscribed ? 'Подписан' : 'Подписаться'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-2 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-colors ${
                  liked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">
                  {video.statistics && formatViewCount(parseInt(video.statistics.likeCount))}
                </span>
              </button>
              <button className="flex items-center gap-1 px-2 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <ThumbsDown className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="flex items-center gap-1 px-2 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline text-xs md:text-sm">Поделиться</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3 mb-2 text-xs md:text-sm font-medium flex-wrap">
              {video.statistics && (
                <span>{formatViewCount(parseInt(video.statistics.viewCount))} просмотров</span>
              )}
              <span>•</span>
              <span>{formatPublishedDate(video.snippet.publishedAt)}</span>
            </div>
            <div className={`text-xs md:text-sm ${!showFullDescription ? 'line-clamp-3' : ''}`}>
              {video.snippet.description}
            </div>
            {video.snippet.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-xs md:text-sm font-medium mt-2"
              >
                {showFullDescription ? 'Свернуть' : 'Развернуть'}
              </button>
            )}
          </div>

          <CommentsSection videoId={selectedVideoId!} />
        </div>

        <div className="space-y-2 md:space-y-3">
          <h2 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Похожие видео</h2>
          {relatedVideos.map((relVideo) => {
            const videoId = typeof relVideo.id === 'string' ? relVideo.id : relVideo.id.videoId;
            return <VideoCard key={videoId} video={relVideo} />;
          })}
        </div>
      </div>
    </div>
  );
};
