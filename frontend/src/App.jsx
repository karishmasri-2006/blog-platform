import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blog-platform-api-bnk5.onrender.com/api'

// DARK MODE CONTEXT
const ThemeContext = createContext()
const useTheme = () => useContext(ThemeContext)

function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    localStorage.setItem('theme', darkMode? 'dark' : 'light')
    document.body.style.background = darkMode? '#1a1a1a' : '#fff'
    document.body.style.color = darkMode? '#fff' : '#000'
  }, [darkMode])

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

// TOAST COMPONENT
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px',
      padding: '12px 20px', borderRadius: '5px', color: '#fff',
      background: type === 'success'? '#28a745' : '#dc3545',
      zIndex: 1000
    }}>
      {message}
    </div>
  )
}

// TOKEN HELPERS
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

axios.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// NAVBAR WITH LOGOUT + DARK MODE
function Navbar() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode } = useTheme()

  const logout = () => {
    removeToken()
    navigate('/login')
  }

  const navStyle = {
    padding: '15px', marginBottom: '20px',
    background: darkMode? '#2d2d2d' : '#f0f0f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{ marginRight: '15px', color: darkMode? '#fff' : '#000' }}>Home</Link>
        <Link to="/create" style={{ marginRight: '15px', color: darkMode? '#fff' : '#000' }}>Create Post</Link>
      </div>
      <div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginRight: '10px' }}>
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

// LOGIN PAGE
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { darkMode } = useTheme()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password })
      setToken(res.data.token)
      setToast({ message: 'Login successful!', type: 'success' })
      setTimeout(() => navigate('/'), 1000)
    } catch {
      setToast({ message: 'Invalid credentials', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px', marginBottom: '10px',
    background: darkMode? '#333' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#555' : '#ddd'}`
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Login</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Create a new account: <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

// REGISTER PAGE
function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { darkMode } = useTheme()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API}/auth/register`, { name, email, password })
      setToast({ message: 'Registration successful! Go to login page', type: 'success' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px', marginBottom: '10px',
    background: darkMode? '#333' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#555' : '#ddd'}`
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Register</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

// HOME PAGE
function Home() {
  const [posts, setPosts] = useState([])
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const userId = getUserId()
  const { darkMode } = useTheme()

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
      setToast({ message: 'Post deleted', type: 'success' })
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' })
    }
  }

  const cardStyle = {
    border: `1px solid ${darkMode? '#444' : '#ddd'}`,
    margin: '15px 0', padding: '15px', borderRadius: '5px',
    background: darkMode? '#2d2d2d' : '#fff'
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ padding: '20px' }}>
        <h2>All Blog Posts</h2>
        {posts.length === 0 && <p>No posts yet. Create one!</p>}
        {posts.map(post => (
          <div key={post.id} style={cardStyle}>
            <h3><Link to={`/post/${post.id}`} style={{ color: darkMode? '#4da6ff' : '#0066cc' }}>{post.title}</Link></h3>
            <p>{post.content.substring(0, 150)}...</p>
            <small>By: {post.author.name}</small><br /><br />
            {post.author.id === userId && (
              <div>
                <Link to={`/edit/${post.id}`}><button style={{ marginRight: '10px' }}>Edit</button></Link>
                <button onClick={() => deletePost(post.id)} style={{ background: '#ff4444', color: 'white' }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// CREATE POST
function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { darkMode } = useTheme()

  useEffect(() => {
    if (!getToken()) navigate('/login')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API}/posts`, { title, content, published })
      setToast({ message: published? 'Blog published!' : 'Draft saved!', type: 'success' })
      setTimeout(() => navigate('/'), 1000)
    } catch {
      setToast({ message: 'Failed to create post', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px', marginBottom: '10px',
    background: darkMode? '#333' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#555' : '#ddd'}`
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Post Title" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
          <textarea placeholder="Write your content here..." rows="12" value={content} onChange={e => setContent(e.target.value)} style={inputStyle} required />
          <label style={{ display: 'block', marginBottom: '15px' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ marginRight: '8px' }} />
            Publish immediately
          </label>
          <button type="submit" style={{ padding: '10px 20px' }}>{published? 'Publish' : 'Save Draft'}</button>
        </form>
      </div>
    </div>
  )
}

// EDIT POST
function EditPost() {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { darkMode } = useTheme()

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
      setToast({ message: 'Post updated!', type: 'success' })
      setTimeout(() => navigate('/'), 1000)
    } catch {
      setToast({ message: 'Failed to update', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px', marginBottom: '10px',
    background: darkMode? '#333' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#555' : '#ddd'}`
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Edit Post</h2>
        <form onSubmit={handleUpdate}>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
          <textarea rows="12" value={content} onChange={e => setContent(e.target.value)} style={inputStyle} required />
          <label style={{ display: 'block', marginBottom: '15px' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ marginRight: '8px' }} />
            Published
          </label>
          <button type="submit" style={{ padding: '10px 20px' }}>Update Post</button>
        </form>
      </div>
    </div>
  )
}

// SINGLE POST + COMMENTS
function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { darkMode } = useTheme()

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
      setToast({ message: 'Comment added!', type: 'success' })
      loadPost()
    } catch {
      setToast({ message: 'Failed to add comment', type: 'error' })
    }
  }

  if (!post) return <div><Navbar /><div style={{ padding: '20px' }}>Loading...</div></div>

  const inputStyle = {
    width: '70%', padding: '8px', marginRight: '10px',
    background: darkMode? '#333' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#555' : '#ddd'}`
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>{post.title}</h2>
        <p style={{ color: darkMode? '#aaa' : '#666', marginBottom: '20px' }}>By: {post.author.name}</p>
        <div style={{ whiteSpace: 'pre-wrap', marginBottom: '30px' }}>{post.content}</div>

        <h3>Comments ({post.comments.length})</h3>
        <div style={{ marginBottom: '20px' }}>
          {post.comments.map(c => (
            <div key={c.id} style={{ borderLeft: `3px solid ${darkMode? '#555' : '#ddd'}`, paddingLeft: '10px', margin: '10px 0' }}>
              <b>{c.author.name}:</b> {c.content}
            </div>
          ))}
        </div>

        <form onSubmit={addComment}>
          <input placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} style={inputStyle} required />
          <button type="submit">Add Comment</button>
        </form>
      </div>
    </div>
  )
}

// MAIN APP
function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}

export default App