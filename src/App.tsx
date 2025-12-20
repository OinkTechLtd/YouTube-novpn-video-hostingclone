import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { SearchPage } from './pages/SearchPage';
import { ChannelPage } from './pages/ChannelPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LikedVideosPage } from './pages/LikedVideosPage';
import { TrendingPage } from './pages/TrendingPage';

const AppContent = () => {
  const { currentPage, sidebarOpen } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'watch':
        return <WatchPage />;
      case 'search':
        return <SearchPage />;
      case 'channel':
        return <ChannelPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'history':
        return <HistoryPage />;
      case 'liked':
        return <LikedVideosPage />;
      case 'trending':
        return <TrendingPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main
        className={`pt-14 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64 ml-48' : 'ml-0'
        }`}
      >
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
