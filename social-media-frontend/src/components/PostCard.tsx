import React, { useState, useRef, useEffect } from "react";
import { FaHeart, FaRegHeart, FaEllipsisH } from "react-icons/fa";
import { fetchAPI } from "../api/api";

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: { username: string };
  likesCount: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  currentUser: string;
  onUpdate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

      if (isLiked) {
        await fetchAPI(`/posts/${post.id}/unlike`, { method: "DELETE" });
      } else {
        await fetchAPI(`/posts/${post.id}/like`, { method: "POST" });
      }
      onUpdate();
    } catch (err) {
      console.error(err);
      setIsLiked(post.isLiked);
      setLikesCount(post.likesCount);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetchAPI(`/posts/${post.id}`, { method: "DELETE" });
      setMenuOpen(false);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async () => {
    try {
      await fetchAPI(`/posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      setIsEditing(false);
      setMenuOpen(false);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post-card">
      {!isEditing ? (
        <>
          <div className="post-header">
            <span className="post-user">@{post.user.username}</span>
            {currentUser === post.user.username && (
              <div ref={menuRef} className="options-wrapper">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="options-icon"
                  aria-label="Post options"
                >
                  <FaEllipsisH />
                </button>
                {menuOpen && (
                  <div className="options-dropdown">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={handleDelete} style={{ color: "red" }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <h3 className="post-title">{post.title}</h3>
          <p className="post-content">{post.content}</p>

          <div className="post-actions">
            <button className="like-button" onClick={toggleLike}>
              {isLiked ? (
                <FaHeart className="heart liked" />
              ) : (
                <FaRegHeart className="heart" />
              )}
            </button>
            <span className="likes-count">
              {likesCount} {likesCount === 1 ? "Like" : "Likes"}
            </span>
          </div>
        </>
      ) : (
        <div className="edit-post">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
          />
          <button onClick={handleEditSave}>Save</button>
          <button onClick={() => setIsEditing(false)} className="cancel-btn">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCard;
