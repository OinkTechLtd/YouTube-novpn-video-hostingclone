/*
  # Add comments table for videos

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `video_id` (text) - YouTube video ID
      - `user_id` (text) - Local user identifier
      - `user_name` (text) - Commenter name
      - `text` (text) - Comment text
      - `created_at` (timestamptz) - Comment timestamp
      - `likes` (integer) - Number of likes
  
  2. Security
    - Enable RLS on comments table
    - Add policies for reading and managing comments
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  user_id text NOT NULL,
  user_name text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  likes integer DEFAULT 0
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (user_id = (SELECT COALESCE(current_setting('app.user_id', true), '')))
  WITH CHECK (user_id = (SELECT COALESCE(current_setting('app.user_id', true), '')));

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (user_id = (SELECT COALESCE(current_setting('app.user_id', true), '')));

CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);