import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedVideoId: string | null;
  setSelectedVideoId: (id: string | null) => void;
  selectedChannelId: string | null;
  setSelectedChannelId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
        selectedVideoId,
        setSelectedVideoId,
        selectedChannelId,
        setSelectedChannelId,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
