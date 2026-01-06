import { Menu, Search, User, Upload, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Header = () => {
  const { setSidebarOpen, sidebarOpen, setCurrentPage, setSearchQuery } = useApp();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput);
      setCurrentPage('search');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center px-2 md:px-4">
      <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-initial">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-1 md:gap-2 font-bold text-base md:text-xl"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs md:text-sm">
            ▶
          </div>
          <span className="hidden sm:inline">YouTube</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 md:mx-4">
        <div className="flex">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Поиск"
            className="flex-1 px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-l-full text-xs md:text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3 md:px-6 py-1.5 md:py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 transition-colors"
          >
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-1 md:gap-2">
        <button
          onClick={() => setCurrentPage('upload')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex"
          title="Upload video"
        >
          <Upload className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={() => setCurrentPage('studio')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex"
          title="Studio"
        >
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <User className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </header>
  );
};
