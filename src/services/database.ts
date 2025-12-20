import { supabase, getUserId as getSupabaseUserId } from '../lib/supabase';

export { getUserId } from '../lib/supabase';

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
  likes: number;
}

export const addComment = async (
  videoId: string,
  userName: string,
  text: string
) => {
  const userId = getSupabaseUserId();
  const { data, error } = await supabase
    .from('comments')
    .insert({
      video_id: videoId,
      user_id: userId,
      user_name: userName,
      text: text,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getComments = async (videoId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Comment[];
};

export const deleteComment = async (commentId: string) => {
  const userId = getSupabaseUserId();
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const likeComment = async (commentId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ likes: supabase.raw('likes + 1') })
    .eq('id', commentId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const addSubscription = async (
  channelId: string,
  channelTitle: string,
  channelThumbnail: string
) => {
  const userId = getSupabaseUserId();
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      channel_id: channelId,
      channel_title: channelTitle,
      channel_thumbnail: channelThumbnail,
      user_id: userId,
    })
    .select()
    .maybeSingle();

  if (error && error.code !== '23505') {
    throw error;
  }
  return data;
};

export const removeSubscription = async (channelId: string) => {
  const userId = getSupabaseUserId();
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getSubscriptions = async () => {
  const userId = getSupabaseUserId();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('subscribed_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const isSubscribed = async (channelId: string) => {
  const userId = getSupabaseUserId();
  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('channel_id', channelId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
};

export const addToWatchHistory = async (
  videoId: string,
  videoTitle: string,
  videoThumbnail: string,
  channelTitle: string
) => {
  const userId = getSupabaseUserId();
  const { data, error } = await supabase
    .from('watch_history')
    .insert({
      video_id: videoId,
      video_title: videoTitle,
      video_thumbnail: videoThumbnail,
      channel_title: channelTitle,
      user_id: userId,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getWatchHistory = async () => {
  const userId = getSupabaseUserId();
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', userId)
    .order('watched_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

export const clearWatchHistory = async () => {
  const userId = getSupabaseUserId();
  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

export const addLikedVideo = async (
  videoId: string,
  videoTitle: string,
  videoThumbnail: string,
  channelTitle: string
) => {
  const userId = getSupabaseUserId();
  const { data, error } = await supabase
    .from('liked_videos')
    .insert({
      video_id: videoId,
      video_title: videoTitle,
      video_thumbnail: videoThumbnail,
      channel_title: channelTitle,
      user_id: userId,
    })
    .select()
    .maybeSingle();

  if (error && error.code !== '23505') {
    throw error;
  }
  return data;
};

export const removeLikedVideo = async (videoId: string) => {
  const userId = getSupabaseUserId();
  const { error } = await supabase
    .from('liked_videos')
    .delete()
    .eq('video_id', videoId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getLikedVideos = async () => {
  const userId = getSupabaseUserId();
  const { data, error } = await supabase
    .from('liked_videos')
    .select('*')
    .eq('user_id', userId)
    .order('liked_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const isVideoLiked = async (videoId: string) => {
  const userId = getSupabaseUserId();
  const { data } = await supabase
    .from('liked_videos')
    .select('id')
    .eq('video_id', videoId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
};
