const API_KEYS = [
  import.meta.env.VITE_YOUTUBE_API_KEY_1,
  import.meta.env.VITE_YOUTUBE_API_KEY_2,
];

let currentKeyIndex = 0;

const getApiKey = () => {
  return API_KEYS[currentKeyIndex];
};

const switchApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return getApiKey();
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getEdgeFunctionUrl = () => {
  return `${SUPABASE_URL}/functions/v1/youtube_proxy`;
};

const fetchWithProxy = async (url: string) => {
  try {
    const proxyUrl = `${getEdgeFunctionUrl()}?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status}, ${error.error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Edge function proxy error:', error);

    try {
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const corsResponse = await fetch(corsProxyUrl);
      if (!corsResponse.ok) {
        throw new Error(`CORS proxy error: ${corsResponse.status}`);
      }
      return await corsResponse.json();
    } catch (corsError) {
      console.error('CORS proxy also failed:', corsError);
      throw corsError;
    }
  }
};

export const searchVideos = async (query: string, maxResults = 20) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&type=video&key=${getApiKey()}`;

    const data = await fetchWithProxy(url);
    return data.items || [];
  } catch (error) {
    console.error('Error searching videos:', error);
    switchApiKey();
    throw error;
  }
};

export const getPopularVideos = async (maxResults = 20) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=RU&maxResults=${maxResults}&key=${getApiKey()}`;

    const data = await fetchWithProxy(url);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching popular videos:', error);
    switchApiKey();
    throw error;
  }
};

export const getVideoDetails = async (videoId: string) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${getApiKey()}`;

    const data = await fetchWithProxy(url);
    return data.items?.[0] || null;
  } catch (error) {
    console.error('Error fetching video details:', error);
    switchApiKey();
    throw error;
  }
};

export const getChannelDetails = async (channelId: string) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${getApiKey()}`;

    const data = await fetchWithProxy(url);
    return data.items?.[0] || null;
  } catch (error) {
    console.error('Error fetching channel details:', error);
    switchApiKey();
    throw error;
  }
};

export const getChannelVideos = async (channelId: string, maxResults = 20) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${getApiKey()}`;

    const data = await fetchWithProxy(url);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    switchApiKey();
    throw error;
  }
};

export const searchChannels = async (query: string, maxResults = 20) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&type=channel&key=${getApiKey()}`;

    const data = await fetchWithProxy(url);
    return data.items || [];
  } catch (error) {
    console.error('Error searching channels:', error);
    switchApiKey();
    throw error;
  }
};

export const getRelatedVideos = async (videoId: string, maxResults = 10) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=${maxResults}&key=${getApiKey()}`;

    const data = await fetchWithProxy(url);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching related videos:', error);
    switchApiKey();
    throw error;
  }
};

export const formatViewCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const formatPublishedDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} минут назад`;
    }
    return `${diffHours} часов назад`;
  } else if (diffDays < 7) {
    return `${diffDays} дней назад`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} недель назад`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} месяцев назад`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} лет назад`;
  }
};
