import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data.post);
      setComments(res.data.comments || []);
      setEditData({ title: res.data.post.title, content: res.data.post.content });
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    try {
      await api.delete(`/posts/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/posts/${id}`, editData);
      setIsEditing(false);
      fetchPost();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/posts/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchPost();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  const isAuthor = user && post.author?._id === user._id;

  return (
    <div className="post-detail">
      <Link to="/dashboard">← Back to Dashboard</Link>

      {isEditing? (
        <form onSubmit={handleUpdate} className="edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value })}
            required
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({...editData, content: e.target.value })}
            rows="10"
            required
          />
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <h1>{post.title}</h1>
          <p className="post-meta">By: {post.author?.email}</p>
          <div className="post-content">{post.content}</div>

          {isAuthor && (
            <div className="author-actions">
              <button onClick={() => setIsEditing(true)}>Edit Post</button>
              <button onClick={handleDelete} className="btn-danger">Delete Post</button>
            </div>
          )}
        </>
      )}

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>

        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            required
          />
          <button type="submit">Post Comment</button>
        </form>

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <strong>{comment.author?.email}</strong>
              <p>{comment.content}</p>
              <small>{new Date(comment.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;