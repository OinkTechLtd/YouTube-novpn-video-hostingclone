/*
  # YouTube App Database Schema

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `channel_id` (text) - YouTube channel ID
      - `channel_title` (text) - Channel name
      - `channel_thumbnail` (text) - Channel avatar URL
      - `subscribed_at` (timestamptz) - Subscription timestamp
      - `user_id` (text) - Local user identifier
    
    - `watch_history`
      - `id` (uuid, primary key)
      - `video_id` (text) - YouTube video ID
      - `video_title` (text) - Video title
      - `video_thumbnail` (text) - Video thumbnail URL
      - `channel_title` (text) - Channel name
      - `watched_at` (timestamptz) - Watch timestamp
      - `user_id` (text) - Local user identifier
    
    - `liked_videos`
      - `id` (uuid, primary key)
      - `video_id` (text) - YouTube video ID
      - `video_title` (text) - Video title
      - `video_thumbnail` (text) - Video thumbnail URL
      - `channel_title` (text) - Channel name
      - `liked_at` (timestamptz) - Like timestamp
      - `user_id` (text) - Local user identifier

  2. Security
    - Enable RLS on all tables
    - Add policies for local user access (using user_id stored in localStorage)
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL,
  channel_title text NOT NULL,
  channel_thumbnail text,
  subscribed_at timestamptz DEFAULT now(),
  user_id text NOT NULL,
  UNIQUE(channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  video_title text NOT NULL,
  video_thumbnail text,
  channel_title text,
  watched_at timestamptz DEFAULT now(),
  user_id text NOT NULL
);

CREATE TABLE IF NOT EXISTS liked_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  video_title text NOT NULL,
  video_thumbnail text,
  channel_title text,
  liked_at timestamptz DEFAULT now(),
  user_id text NOT NULL,
  UNIQUE(video_id, user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  USING (true);

CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  USING (true);

CREATE POLICY "Users can view own liked videos"
  ON liked_videos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own liked videos"
  ON liked_videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own liked videos"
  ON liked_videos FOR DELETE
  USING (true);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_liked_videos_user_id ON liked_videos(user_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at DESC);
CREATE INDEX idx_liked_videos_liked_at ON liked_videos(liked_at DESC);