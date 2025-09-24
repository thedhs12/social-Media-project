import React, { useState } from 'react';
import { fetchAPI } from '../api/api';

interface Props {
  onPostCreated: () => void;
  onClose: () => void;
}

const CreatePost: React.FC<Props> = ({ onPostCreated,onClose }) => {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await fetchAPI('/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      setTitle('');
      setContent('');
      onPostCreated();
      onClose();

    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <div className='modal-backdrop' onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Post</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={handleSubmit}>Post</button>
        <button onClick={onClose}>Cancel</button>
      </div>

    </div>
  )
}

export default CreatePost;
