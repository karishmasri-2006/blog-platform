import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blog-platform-api-bnk5.onrender.com/api'

// DARK MODE CONTEXT
const ThemeContext = createContext()
const useTheme = () => useContext(ThemeContext)

function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    localStorage.setItem('theme', darkMode? 'dark' : 'light')
    document.body.style.background = darkMode? '#0f0f0f' : '#f5f5f5'
    document.body.style.color = darkMode? '#fff' : '#000'
    document.body.style.margin = '0'
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif'
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
      position: 'fixed', top: '20px', right: '20px', left: '20px',
      maxWidth: '400px', margin: '0 auto',
      padding: '12px 20px', borderRadius: '8px', color: '#fff',
      background: type === 'success'? '#28a745' : '#dc3545',
      zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      textAlign: 'center'
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

// PROTECTED ROUTE
function ProtectedRoute({ children }) {
  return getToken()? children : <Navigate to="/login" replace />
}

// NAVBAR WITH LOGOUT + DARK MODE TEXT
function Navbar() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode } = useTheme()

  const logout = () => {
    removeToken()
    navigate('/login')
  }

  const navStyle = {
    padding: '12px 16px',
    background: darkMode? '#1a1a1a' : '#fff',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap'
  }

  const btnStyle = {
    padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    background: darkMode? '#333' : '#f0f0f0',
    color: darkMode? '#fff' : '#000', fontSize: '14px', fontWeight: '500'
  }

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Link to="/home" style={{ color: darkMode? '#fff' : '#000', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
        <Link to="/create" style={{ color: darkMode? '#fff' : '#000', textDecoration: 'none', fontWeight: '600' }}>Create</Link>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => setDarkMode(!darkMode)} style={btnStyle}>
          {darkMode? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={logout} style={btnStyle}>Logout</button>
      </div>
    </nav>
  )
}

// AUTH CARD WRAPPER
function AuthCard({ children }) {
  const { darkMode } = useTheme()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', background: darkMode? '#0f0f0f' : '#f5f5f5'
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', padding: '32px 24px',
        background: darkMode? '#1a1a1a' : '#fff',
        borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>
    </div>
  )
}

// LOGIN PAGE
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { darkMode } = useTheme()

  useEffect(() => {
    if (getToken()) navigate('/home', { replace: true })
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password })
      setToken(res.data.token)
      setToast({ message: 'Login successful!', type: 'success' })
      setTimeout(() => navigate('/home', { replace: true }), 1000)
    } catch {
      setToast({ message: 'Invalid credentials', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '6px',
    background: darkMode? '#2a2a2a' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#444' : '#ddd'}`,
    boxSizing: 'border-box', fontSize: '16px'
  }

  return (
    <AuthCard>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2 style={{ textAlign: 'center', marginBottom: '24px', marginTop: 0 }}>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Login</button>
      </form>
      <p style={{ marginTop: '20px', textAlign: 'center', color: darkMode? '#aaa' : '#666', fontSize: '14px' }}>
        Create a new account: <Link to="/register" style={{ color: '#0066cc', textDecoration: 'none' }}>Register</Link>
      </p>
    </AuthCard>
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
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '6px',
    background: darkMode? '#2a2a2a' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#444' : '#ddd'}`,
    boxSizing: 'border-box', fontSize: '16px'
  }

  return (
    <AuthCard>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2 style={{ textAlign: 'center', marginBottom: '24px', marginTop: 0 }}>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Register</button>
      </form>
      <p style={{ marginTop: '20px', textAlign: 'center', color: darkMode? '#aaa' : '#666', fontSize: '14px' }}>
        Already have account? <Link to="/login" style={{ color: '#0066cc', textDecoration: 'none' }}>Login</Link>
      </p>
    </AuthCard>
  )
}

// HOME PAGE - NOW WITH COMMENT COUNT
function Home() {
  const [posts, setPosts] = useState([])
  const [toast, setToast] = useState(null)
  const userId = getUserId()
  const { darkMode } = useTheme()

  useEffect(() => {
    axios.get(`${API}/posts`).then(res => setPosts(res.data))
  }, [])

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
    border: `1px solid ${darkMode? '#333' : '#e0e0e0'}`,
    margin: '16px 0', padding: '20px', borderRadius: '8px',
    background: darkMode? '#1a1a1a' : '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>All Blog Posts</h2>
        {posts.length === 0 && <p style={{ textAlign: 'center', color: darkMode? '#aaa' : '#666' }}>No posts yet. Create one!</p>}
        {posts.map(post => (
          <div key={post.id} style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '20px', lineHeight: '1.3' }}>
              <Link to={`/post/${post.id}`} style={{ color: darkMode? '#4da6ff' : '#0066cc', textDecoration: 'none' }}>{post.title}</Link>
            </h3>
            <p style={{ color: darkMode? '#ccc' : '#555', lineHeight: '1.6', marginBottom: '12px' }}>{post.content.substring(0, 150)}...</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <small style={{ color: darkMode? '#888' : '#999' }}>
                By: {post.author.name} • 💬 {post.comments?.length || 0} Comments
              </small>
              {post.author.id === userId && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/edit/${post.id}`}><button style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: darkMode? '#333' : '#f0f0f0', cursor: 'pointer', fontSize: '14px' }}>Edit</button></Link>
                  <button onClick={() => deletePost(post.id)} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#ff4444', color: 'white', cursor: 'pointer', fontSize: '14px' }}>Delete</button>
                </div>
              )}
            </div>
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API}/posts`, { title, content, published })
      setToast({ message: published? 'Blog published!' : 'Draft saved!', type: 'success' })
      setTimeout(() => navigate('/home', { replace: true }), 1000)
    } catch {
      setToast({ message: 'Failed to create post', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '6px',
    background: darkMode? '#2a2a2a' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#444' : '#ddd'}`,
    boxSizing: 'border-box', fontSize: '16px'
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Post Title" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
          <textarea placeholder="Write your content here..." rows="14" value={content} onChange={e => setContent(e.target.value)} style={{...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} required />
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ marginRight: '8px' }} />
            Publish immediately
          </label>
          <button type="submit" style={{ width: '100%', padding: '12px 24px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>{published? 'Publish' : 'Save Draft'}</button>
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
    axios.get(`${API}/posts/${id}`).then(res => {
      setTitle(res.data.title)
      setContent(res.data.content)
      setPublished(res.data.published)
    }).catch(() => navigate('/home'))
  }, [id, navigate])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API}/posts/${id}`, { title, content, published })
      setToast({ message: 'Post updated!', type: 'success' })
      setTimeout(() => navigate('/home', { replace: true }), 1000)
    } catch {
      setToast({ message: 'Failed to update', type: 'error' })
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '6px',
    background: darkMode? '#2a2a2a' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#444' : '#ddd'}`,
    boxSizing: 'border-box', fontSize: '16px'
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Edit Post</h2>
        <form onSubmit={handleUpdate}>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
          <textarea rows="14" value={content} onChange={e => setContent(e.target.value)} style={{...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} required />
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ marginRight: '8px' }} />
            Published
          </label>
          <button type="submit" style={{ width: '100%', padding: '12px 24px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Update Post</button>
        </form>
      </div>
    </div>
  )
}

// SINGLE POST + COMMENTS WITH DELETE
function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')
  const [toast, setToast] = useState(null)
  const { darkMode } = useTheme()
  const userId = getUserId()

  const loadPost = () => {
    axios.get(`${API}/posts/${id}`).then(res => setPost(res.data))
  }

  useEffect(() => {
    loadPost()
  }, [id])

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

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await axios.delete(`${API}/comments/${commentId}`)
      setToast({ message: 'Comment deleted', type: 'success' })
      loadPost()
    } catch {
      setToast({ message: 'Failed to delete comment', type: 'error' })
    }
  }

  if (!post) return <div><Navbar /><div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div></div>

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '6px',
    background: darkMode? '#2a2a2a' : '#fff',
    color: darkMode? '#fff' : '#000',
    border: `1px solid ${darkMode? '#444' : '#ddd'}`,
    boxSizing: 'border-box', fontSize: '16px'
  }

  return (
    <div>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '28px', lineHeight: '1.3', wordWrap: 'break-word' }}>{post.title}</h1>
        <p style={{ color: darkMode? '#888' : '#666', marginBottom: '24px' }}>By: {post.author.name}</p>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginBottom: '40px', fontSize: '16px', wordWrap: 'break-word' }}>{post.content}</div>

        <h3 style={{ borderTop: `1px solid ${darkMode? '#333' : '#e0e0e0'}`, paddingTop: '24px', marginBottom: '16px' }}>Comments ({post.comments.length})</h3>
        <div style={{ marginBottom: '24px' }}>
          {post.comments.map(c => (
            <div key={c.id} style={{
              borderLeft: `3px solid ${darkMode? '#444' : '#ddd'}`,
              padding: '12px', margin: '12px 0',
              background: darkMode? '#1a1a1a' : '#f9f9f9',
              borderRadius: '6px', wordWrap: 'break-word'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <b style={{ color: darkMode? '#4da6ff' : '#0066cc' }}>{c.author.name}:</b> {c.content}
                </div>
                {c.author.id === userId && (
                  <button onClick={() => deleteComment(c.id)} style={{
                    padding: '4px 8px', borderRadius: '4px', border: 'none',
                    background: '#ff4444', color: 'white', cursor: 'pointer',
                    fontSize: '12px', flexShrink: 0
                  }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addComment}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} style={inputStyle} required />
            <button type="submit" style={{ padding: '12px 24px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Add Comment</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// MAIN APP - LOGIN FIRST
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App