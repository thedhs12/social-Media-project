import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../api/api';
import { FaTrash } from 'react-icons/fa';
import '../css/CommentSection.css';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { username: string; avatarUrl?: string };
}

interface CommentSectionProps {
  postId: string|number;
  visible: boolean;
  onCountChange?: (count: number) => void;
}

interface CreateCommentResponse {
  comment: Comment;
  commentsCount: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, visible, onCountChange }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loggedInUsername = localStorage.getItem('username'); 

  const loadComments = async () => {
    try {
      const data = await fetchAPI<Comment[]>(`/posts/${postId}/comments`);
      setComments(data);
      onCountChange?.(data.length);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Login required');

      const data = await fetchAPI<CreateCommentResponse>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments(prev => [...prev, data.comment]);
      onCountChange?.(data.commentsCount);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Login required');

      const data = await fetchAPI<{ message: string; commentsCount: number }>(
        `/comments/${commentId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prev => prev.filter(c => c.id !== commentId));
      onCountChange?.(data.commentsCount);
      setConfirmDeleteId(null); 
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (visible) loadComments();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="comment-section">
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <img
              src={comment.user.avatarUrl || '/avtar.png'}
              alt={comment.user.username}
              className="comment-avatar"
            />
            <div className="comment-content">
              <strong>@{comment.user.username}</strong>
              <p>{comment.content}</p>
              <span className="timestamp">{new Date(comment.createdAt).toLocaleString()}</span>

              {loggedInUsername === comment.user.username && (
                <button
                  onClick={() => setConfirmDeleteId(comment.id)}
                  className="delete-btn"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="comment-input-container">
        <textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={handlePostComment} disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this comment?</p>
            <div className="modal-buttons">
              <button onClick={() => handleDeleteComment(confirmDeleteId)} disabled={deletingId === confirmDeleteId}>
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Yes'}
              </button>
              <button onClick={() => setConfirmDeleteId(null)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
