export interface Video {
  id: {
    videoId?: string;
  } | string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export interface Channel {
  id: {
    channelId?: string;
  } | string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    customUrl?: string;
  };
  statistics?: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

export interface Subscription {
  id: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string;
  subscribed_at: string;
}

export interface WatchHistory {
  id: string;
  video_id: string;
  video_title: string;
  video_thumbnail: string;
  channel_title: string;
  watched_at: string;
}

export interface LikedVideo {
  id: string;
  video_id: string;
  video_title: string;
  video_thumbnail: string;
  channel_title: string;
  liked_at: string;
}
