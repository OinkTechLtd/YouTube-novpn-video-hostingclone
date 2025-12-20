import { useEffect, useState } from 'react';
import { getSubscriptions } from '../services/database';
import { Subscription } from '../types';
import { Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SubscriptionsPage = () => {
  const { setSelectedChannelId, setCurrentPage } = useApp();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
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

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p className="text-xl mb-2">У вас нет подписок</p>
        <p className="text-sm">Подпишитесь на каналы, чтобы видеть их здесь</p>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Подписки</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            onClick={() => handleChannelClick(sub.channel_id)}
            className="cursor-pointer group"
          >
            <img
              src={sub.channel_thumbnail}
              alt={sub.channel_title}
              className="w-full aspect-square rounded-full mb-2 md:mb-3 group-hover:scale-105 transition-transform"
            />
            <h3 className="text-center text-xs md:text-sm font-medium line-clamp-2">
              {sub.channel_title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};
