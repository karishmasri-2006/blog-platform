import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blog-platform-api-bnk5.onrender.com/api'

// Token helpers - FIXED THE atob BUG HERE
const setToken = (t) => localStorage.setItem('token', t)
const getToken = () => localStorage.getItem('token')
const removeToken = () => localStorage.removeItem('token')

const getUserId = () => {
  try {
    const token = getToken()
    if (!token) return null
    const payload = token.split('.')[1]
    if (!payload) return null
    return JSON.parse(atob(payload)).id
  } catch (e) {
    return null
  }
}

// Add token to all requests
axios.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// NAVBAR
function Navbar() {
  const navigate = useNavigate()
  const logout = () => {
    removeToken()
    navigate('/login')
  }
  return (
    <nav style={{padding: '15px', background: '#f0f0f0', marginBottom: '20px'}}>
      <Link to="/" style={{marginRight: '15px'}}>Home</Link>
      <Link to="/create" style={{marginRight: '15px'}}>Create Post</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  )
}

// LOGIN PAGE
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password })
      setToken(res.data.token)
      navigate('/')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '0 auto'}}>
      <h2>Login</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{width: '100%', padding: '8px', marginBottom: '10px'}}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{width: '100%', padding: '8px', marginBottom: '10px'}}
          required
        />
        <button type="submit" style={{width: '100%', padding: '10px'}}>Login</button>
      </form>
      <p style={{marginTop: '15px'}}>
        Don't have account? <Link to="/register">Register here</Link>
      </p>
    </div>
  )
}

// REGISTER PAGE
function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API}/auth/register`, { name, email, password })
      setToken(res.data.token)
      navigate('/')
    } catch {
      setError('User already exists or invalid data')
    }
  }

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '0 auto'}}>
      <h2>Register</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{width: '100%', padding: '8px', marginBottom: '10px'}}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{width: '100%', padding: '8px', marginBottom: '10px'}}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{width: '100%', padding: '8px', marginBottom: '10px'}}
          required
        />
        <button type="submit" style={{width: '100%', padding: '10px'}}>Register</button>
      </form>
      <p style={{marginTop: '15px'}}>
        Already have account? <Link to="/login">Login here</Link>
      </p>
    </div>
  )
}

// HOME PAGE - All published posts
function Home() {
  const [posts, setPosts] = useState([])
  const navigate = useNavigate()
  const userId = getUserId()

  useEffect(() => {
    if (!getToken()) return navigate('/login')
    axios.get(`${API}/posts`)
     .then(res => setPosts(res.data))
     .catch(() => navigate('/login'))
  }, [navigate])

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await axios.delete(`${API}/posts/${id}`)
      setPosts(posts.filter(p => p.id!== id))
    } catch {
      alert('Failed to delete')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{padding: '20px'}}>
        <h2>All Blog Posts</h2>
        {posts.length === 0 && <p>No posts yet. Create one!</p>}
        {posts.map(post => (
          <div key={post.id} style={{border: '1px solid #ddd', margin: '15px 0', padding: '15px', borderRadius: '5px'}}>
            <h3><Link to={`/post/${post.id}`}>{post.title}</Link></h3>
            <p>{post.content.substring(0, 150)}...</p>
            <small>By: {post.author.name}</small><br/><br/>
            {post.author.id === userId && (
              <div>
                <Link to={`/edit/${post.id}`}>
                  <button style={{marginRight: '10px'}}>Edit</button>
                </Link>
                <button onClick={() => deletePost(post.id)} style={{background: '#ff4444', color: 'white'}}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// CREATE POST PAGE
function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!getToken()) navigate('/login')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API}/posts`, { title, content, published })
      navigate('/')
    } catch {
      alert('Failed to create post')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Post Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{width: '100%', padding: '8px', marginBottom: '10px'}}
            required
          />
          <textarea
            placeholder="Write your content here..."
            rows="12"
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{width: '100%', padding: '8px', marginBottom: '10px'}}
            required
          />
          <label style={{display: 'block', marginBottom: '15px'}}>
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              style={{marginRight: '8px'}}
            />
            Publish immediately (uncheck to save as draft)
          </label>
          <button type="submit" style={{padding: '10px 20px'}}>Save Post</button>
        </form>
      </div>
    </div>
  )
}

// EDIT POST PAGE
function EditPost() {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!getToken()) return navigate('/login')
    axios.get(`${API}/posts/${id}`).then(res => {
      setTitle(res.data.title)
      setContent(res.data.content)
      setPublished(res.data.published)
    }).catch(() => navigate('/'))
  }, [id, navigate])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API}/posts/${id}`, { title, content, published })
      navigate('/')
    } catch {
      alert('Failed to update or not your post')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
        <h2>Edit Post</h2>
        <form onSubmit={handleUpdate}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{width: '100%', padding: '8px', marginBottom: '10px'}}
            required
          />
          <textarea
            rows="12"
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{width: '100%', padding: '8px', marginBottom: '10px'}}
            required
          />
          <label style={{display: 'block', marginBottom: '15px'}}>
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              style={{marginRight: '8px'}}
            />
            Published
          </label>
          <button type="submit" style={{padding: '10px 20px'}}>Update Post</button>
        </form>
      </div>
    </div>
  )
}

// SINGLE POST + COMMENTS PAGE
function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')
  const navigate = useNavigate()

  const loadPost = () => {
    axios.get(`${API}/posts/${id}`)
     .then(res => setPost(res.data))
     .catch(() => navigate('/'))
  }

  useEffect(() => {
    if (!getToken()) return navigate('/login')
    loadPost()
  }, [id, navigate])

  const addComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    try {
      await axios.post(`${API}/comments`, { content: comment, postId: id })
      setComment('')
      loadPost()
    } catch {
      alert('Failed to add comment')
    }
  }

  if (!post) return <div><Navbar /><div style={{padding: '20px'}}>Loading...</div></div>

  return (
    <div>
      <Navbar />
      <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
        <h2>{post.title}</h2>
        <p style={{color: '#666', marginBottom: '20px'}}>By: {post.author.name}</p>
        <div style={{whiteSpace: 'pre-wrap', marginBottom: '30px'}}>{post.content}</div>

        <h3>Comments ({post.comments.length})</h3>
        <div style={{marginBottom: '20px'}}>
          {post.comments.map(c => (
            <div key={c.id} style={{borderLeft: '3px solid #ddd', paddingLeft: '10px', margin: '10px 0'}}>
              <b>{c.author.name}:</b> {c.content}
            </div>
          ))}
        </div>

        <form onSubmit={addComment}>
          <input
            placeholder="Write a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{width: '70%', padding: '8px', marginRight: '10px'}}
            required
          />
          <button type="submit">Add Comment</button>
        </form>
      </div>
    </div>
  )
}

// MAIN APP
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App