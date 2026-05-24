import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // This uses your fixed axios.js

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // IMPORTANT: No /api here. baseURL already has /api
      const res = await api.post('/auth/login', formData);
      
      console.log('Login success:', res.data);
      
      // Save token if your backend sends one
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      // Save user data
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      // Redirect to dashboard or home
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Show the actual error from backend
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError('Login endpoint not found. Check API URL.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;