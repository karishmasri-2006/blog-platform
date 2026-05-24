import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/posts', formData); // POST /api/posts
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <h2>Create New Blog Post</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Blog Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Write your blog content..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows="10"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;