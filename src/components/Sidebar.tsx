import { Home, Compass, Users, Clock, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';
import { getSubscriptions } from '../services/database';
import { Subscription } from '../types';

export const Sidebar = () => {
  const { sidebarOpen, currentPage, setCurrentPage, setSelectedChannelId } = useApp();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const menuItems = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'trending', icon: Compass, label: 'В тренде' },
    { id: 'subscriptions', icon: Users, label: 'Подписки' },
    { id: 'history', icon: Clock, label: 'История' },
    { id: 'liked', icon: ThumbsUp, label: 'Понравившиеся' },
  ];

  const handleChannelClick = (channelId: string) => {
    setSelectedChannelId(channelId);
    setCurrentPage('channel');
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-48 md:w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
      <nav className="p-2 md:p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 md:gap-6 px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm transition-colors ${
                  currentPage === item.id
                    ? 'bg-gray-100 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {subscriptions.length > 0 && (
          <>
            <div className="border-t border-gray-200 my-2 md:my-3"></div>
            <div className="mb-2 px-2 md:px-3 text-xs md:text-sm font-semibold text-gray-700">
              Подписки
            </div>
            <div className="space-y-1">
              {subscriptions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleChannelClick(sub.channel_id)}
                  className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-gray-50 text-xs md:text-sm transition-colors"
                >
                  <img
                    src={sub.channel_thumbnail}
                    alt={sub.channel_title}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0"
                  />
                  <span className="truncate">{sub.channel_title}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};
