import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div>Loading posts...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Blog Platform</h1>
        <div className="header-actions">
          <Link to="/create-post">
            <button className="btn-primary">Create New Blog</button>
          </Link>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      <div className="posts-container">
        <h2>All Blog Posts</h2>
        {posts.length === 0? (
          <p>No blog posts yet. <Link to="/create-post">Create your first post</Link></p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="post-card">
              <h3>
                <Link to={`/post/${post._id}`}>{post.title}</Link>
              </h3>
              <p className="post-meta">By: {post.author?.email}</p>
              <p>{post.content.substring(0, 150)}...</p>
              <div className="post-actions">
                <Link to={`/post/${post._id}`}>Read More & Comments</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;