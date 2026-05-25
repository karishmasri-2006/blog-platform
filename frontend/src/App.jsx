import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blog-platform-api-bnk5.onrender.com/api'

// Token helpers
const setToken = (t) => localStorage.setItem('token', t)
const getToken = () => localStorage.getItem('token')
const removeToken = () => localStorage.removeItem('token')
const getUserId = () => {
  const token = getToken()
  if (!token) return null
  return JSON.parse(atob(token.split('.')[1])).id
}

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
    <nav style={{padding: '10px', borderBottom: '1px solid #ccc'}}>
      <Link to="/">Home</Link> | <Link to="/create">Create Post</Link> |
      <button onClick={logout}>Logout</button>
    </nav>
  )
}

// LOGIN
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
    <div style={{padding: '20px'}}>
      <h2>Login</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br/><br/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/><br/>
        <button type="submit">Login</button>
      </form>
      <Link to="/register">Register</Link>
    </div>
  )
}

// REGISTER
function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    const res = await axios.post(`${API}/auth/register`, { name, email, password })
    setToken(res.data.token)
    navigate('/')
  }

  return (
    <div style={{padding: '20px'}}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} /><br/><br/>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br/><br/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/><br/>
        <button type="submit">Register</button>
      </form>
      <Link to="/login">Login</Link>
    </div>
  )
}

// HOME - All posts
function Home() {
  const [posts, setPosts] = useState([])
  const navigate = useNavigate()
  const userId = getUserId()

  useEffect(() => {
    if (!getToken()) return navigate('/login')
    axios.get(`${API}/posts`).then(res => setPosts(res.data))
  }, [])

  const deletePost = async (id) => {
    await axios.delete(`${API}/posts/${id}`)
    setPosts(posts.filter(p => p.id!== id))
  }

  return (
    <div style={{padding: '20px'}}>
      <Navbar />
      <h2>All Posts</h2>
      {posts.map(post => (
        <div key={post.id} style={{border: '1px solid #ccc', margin: '10px', padding: '10px'}}>
          <h3><Link to={`/post/${post.id}`}>{post.title}</Link></h3>
          <p>{post.content.substring(0, 100)}...</p>
          <small>By: {post.author.name}</small><br/>
          {post.author.id === userId && (
            <>
              <Link to={`/edit/${post.id}`}><button>Edit</button></Link>
              <button onClick={() => deletePost(post.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// CREATE POST
function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post(`${API}/posts`, { title, content, published })
    navigate('/')
  }

  return (
    <div style={{padding: '20px'}}>
      <Navbar />
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><br/><br/>
        <textarea placeholder="Content" rows="10" cols="50" value={content} onChange={e => setContent(e.target.value)} /><br/><br/>
        <label>
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
          Publish immediately
        </label><br/><br/>
        <button type="submit">Save Post</button>
      </form>
    </div>
  )
}

// EDIT POST
function EditPost() {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${API}/posts/${id}`).then(res => {
      setTitle(res.data.title)
      setContent(res.data.content)
      setPublished(res.data.published)
    })
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    await axios.put(`${API}/posts/${id}`, { title, content, published })
    navigate('/')
  }

  return (
    <div style={{padding: '20px'}}>
      <Navbar />
      <h2>Edit Post</h2>
      <form onSubmit={handleUpdate}>
        <input value={title} onChange={e => setTitle(e.target.value)} /><br/><br/>
        <textarea rows="10" cols="50" value={content} onChange={e => setContent(e.target.value)} /><br/><br/>
        <label>
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
          Published
        </label><br/><br/>
        <button type="submit">Update</button>
      </form>
    </div>
  )
}

// SINGLE POST + COMMENTS
function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')

  const loadPost = () => {
    axios.get(`${API}/posts/${id}`).then(res => setPost(res.data))
  }

  useEffect(() => { loadPost() }, [id])

  const addComment = async (e) => {
    e.preventDefault()
    await axios.post(`${API}/comments`, { content: comment, postId: id })
    setComment('')
    loadPost()
  }

  if (!post) return <div>Loading...</div>

  return (
    <div style={{padding: '20px'}}>
      <Navbar />
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <small>By: {post.author.name}</small>
      <h3>Comments</h3>
      {post.comments.map(c => (
        <div key={c.id} style={{margin: '5px 0'}}><b>{c.author.name}:</b> {c.content}</div>
      ))}
      <form onSubmit={addComment}>
        <input placeholder="Add comment" value={comment} onChange={e => setComment(e.target.value)} />
        <button type="submit">Comment</button>
      </form>
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