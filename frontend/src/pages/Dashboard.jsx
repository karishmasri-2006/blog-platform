import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch all blog posts
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts'); // GET /api/posts
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
        <h1>Dashboard</h1>
        <div>
          <span>Welcome, {user?.email}!</span>
          <Link to="/create-post">
            <button>Create New Blog</button>
          </Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="posts-container">
        <h2>All Blog Posts</h2>
        {posts.length === 0 ? (
          <p>No blog posts yet. <Link to="/create-post">Create your first post</Link></p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="post-card">
              <h3>
                <Link to={`/post/${post._id}`}>{post.title}</Link>
              </h3>
              <p>By: {post.author?.email}</p>
              <p>{post.content.substring(0, 100)}...</p>
              <Link to={`/post/${post._id}`}>Read More & Comments</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;