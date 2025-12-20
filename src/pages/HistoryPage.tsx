import { useEffect, useState } from 'react';
import { getWatchHistory, clearWatchHistory } from '../services/database';
import { WatchHistory } from '../types';
import { Loader2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPublishedDate } from '../services/youtube';

export const HistoryPage = () => {
  const { setSelectedVideoId, setCurrentPage } = useApp();
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getWatchHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Вы уверены, что хотите очистить историю просмотров?')) {
      try {
        await clearWatchHistory();
        setHistory([]);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
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

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p className="text-xl mb-2">История просмотров пуста</p>
        <p className="text-sm">Просмотренные видео появятся здесь</p>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold">История просмотров</h1>
        <button
          onClick={handleClearHistory}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs md:text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Очистить
        </button>
      </div>

      <div className="space-y-2 md:space-y-4">
        {history.map((item) => (
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
                Просмотрено {formatPublishedDate(item.watched_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
