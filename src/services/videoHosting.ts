import { supabase } from '../lib/supabase';

export const channelService = {
  async createChannel(
    creatorId: string,
    name: string,
    description: string,
    avatar: string,
    banner: string
  ) {
    const { data, error } = await supabase
      .from('custom_channels')
      .insert({
        creator_id: creatorId,
        name,
        description,
        avatar,
        banner,
        subscriber_count: 0,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getChannelById(id: string) {
    const { data, error } = await supabase
      .from('custom_channels')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getChannelByCreatorId(creatorId: string) {
    const { data, error } = await supabase
      .from('custom_channels')
      .select('*')
      .eq('creator_id', creatorId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async subscribeToChannel(channelId: string, userId: string) {
    const { error: insertError } = await supabase
      .from('custom_channel_subscribers')
      .insert({ channel_id: channelId, user_id: userId });

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('custom_channels')
      .update({ subscriber_count: supabase.raw('subscriber_count + 1') })
      .eq('id', channelId);

    if (updateError) throw updateError;
  },

  async unsubscribeFromChannel(channelId: string, userId: string) {
    const { error: deleteError } = await supabase
      .from('custom_channel_subscribers')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    const { error: updateError } = await supabase
      .from('custom_channels')
      .update({ subscriber_count: supabase.raw('subscriber_count - 1') })
      .eq('id', channelId);

    if (updateError) throw updateError;
  },

  async isSubscribed(channelId: string, userId: string) {
    const { data, error } = await supabase
      .from('custom_channel_subscribers')
      .select('id')
      .eq('channel_id', channelId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getSubscribedChannels(userId: string) {
    const { data, error } = await supabase
      .from('custom_channel_subscribers')
      .select('custom_channels(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map((sub: any) => sub.custom_channels) || [];
  },
};

export const videoService = {
  async uploadVideo(
    channelId: string,
    title: string,
    description: string,
    videoUrl: string,
    thumbnail: string,
    duration: number
  ) {
    const { data, error } = await supabase
      .from('custom_videos')
      .insert({
        channel_id: channelId,
        title,
        description,
        video_url: videoUrl,
        thumbnail,
        duration,
        views: 0,
        likes: 0,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getVideoById(id: string) {
    const { data, error } = await supabase
      .from('custom_videos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getChannelVideos(channelId: string) {
    const { data, error } = await supabase
      .from('custom_videos')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRecommendedVideos(limit = 20) {
    const { data, error } = await supabase
      .from('custom_videos')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async incrementViews(videoId: string) {
    const { error } = await supabase
      .from('custom_videos')
      .update({ views: supabase.raw('views + 1') })
      .eq('id', videoId);

    if (error) throw error;
  },

  async likeVideo(videoId: string, userId: string) {
    const { error: insertError } = await supabase
      .from('custom_video_likes')
      .insert({ video_id: videoId, user_id: userId });

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('custom_videos')
      .update({ likes: supabase.raw('likes + 1') })
      .eq('id', videoId);

    if (updateError) throw updateError;
  },

  async unlikeVideo(videoId: string, userId: string) {
    const { error: deleteError } = await supabase
      .from('custom_video_likes')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    const { error: updateError } = await supabase
      .from('custom_videos')
      .update({ likes: supabase.raw('likes - 1') })
      .eq('id', videoId);

    if (updateError) throw updateError;
  },

  async isVideoLiked(videoId: string, userId: string) {
    const { data, error } = await supabase
      .from('custom_video_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async addComment(videoId: string, userId: string, username: string, text: string) {
    const { data, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: videoId,
        user_id: userId,
        username,
        content: text,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getComments(videoId: string) {
    const { data, error } = await supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
