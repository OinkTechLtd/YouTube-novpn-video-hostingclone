import { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment, likeComment, Comment, getUserId } from '../services/database';
import { formatPublishedDate } from '../services/youtube';
import { Trash2, Heart, Send, Loader2 } from 'lucide-react';

interface CommentsSectionProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');
  const currentUserId = getUserId();

  useEffect(() => {
    loadComments();
    const savedName = localStorage.getItem('youtube_user_name');
    if (savedName) setUserName(savedName);
  }, [videoId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(videoId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !userName.trim()) return;

    try {
      setPosting(true);
      localStorage.setItem('youtube_user_name', userName);
      await addComment(videoId, userName, commentText);
      setCommentText('');
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await likeComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 mt-6">
      <h2 className="font-semibold text-lg mb-6">Комментарии ({comments.length})</h2>

      <form onSubmit={handlePostComment} className="mb-6 pb-6 border-b border-gray-200">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Ваше имя"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Оставить комментарий..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={posting || !commentText.trim() || !userName.trim()}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {posting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Отправить
            </>
          )}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Комментарии еще не добавлены</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs md:text-sm font-semibold text-white flex-shrink-0">
                {comment.user_name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2 mb-1">
                  <h3 className="font-medium text-sm md:text-base">{comment.user_name}</h3>
                  <p className="text-xs text-gray-500">
                    {formatPublishedDate(comment.created_at)}
                  </p>
                </div>
                <p className="text-sm text-gray-700 break-words">{comment.text}</p>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Heart className="w-3 h-3" />
                    {comment.likes}
                  </button>
                  {comment.user_id === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
