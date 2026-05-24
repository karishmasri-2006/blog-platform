import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import API from "../api/axios"

function Home() {
  const [posts, setPosts] = useState([])
  const [editingPostId, setEditingPostId] = useState(null)
  const [editData, setEditData] = useState({
    title: "",
    content: "",
  })

  const [darkMode, setDarkMode] = useState(false)

  const token = localStorage.getItem("token")

  let currentUser = null
  if (token) {
    currentUser = JSON.parse(atob(token.split(".")[1]))
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts")
      setPosts(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  const deletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchPosts()
    } catch (error) {
      console.log(error)
    }
  }

  const startEdit = (post) => {
    setEditingPostId(post.id)
    setEditData({ title: post.title, content: post.content })
  }

  const updatePost = async (postId) => {
    try {
      await API.put(`/posts/${postId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setEditingPostId(null)
      fetchPosts()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#121212" : "#f5f6fa",
        color: darkMode ? "#fff" : "#111",
        transition: "0.3s",
      }}
    >

      {/* NAVBAR */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "15px",
          alignItems: "center",
          borderBottom: darkMode ? "1px solid #333" : "1px solid #ddd",
        }}
      >
        <h2 style={{ marginRight: "auto" }}>Blog Platform</h2>

        <Link to="/">Home</Link>

        {token && (
          <>
            <Link to="/create-post">Create</Link>
            <button onClick={logout}>Logout</button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {/* DARK MODE TOGGLE */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* POSTS */}
      <div
        style={{
          maxWidth: "900px",
          margin: "20px auto",
          padding: "0 15px",
        }}
      >
        <h2>Latest Posts</h2>

        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              background: darkMode ? "#1e1e1e" : "#fff",
              padding: "20px",
              marginBottom: "15px",
              borderRadius: "12px",
              boxShadow: darkMode
                ? "0 0 10px rgba(255,255,255,0.05)"
                : "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >

            {/* EDIT MODE */}
            {editingPostId === post.id ? (
              <>
                <input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <textarea
                  value={editData.content}
                  onChange={(e) =>
                    setEditData({ ...editData, content: e.target.value })
                  }
                  style={{ width: "100%", height: "100px", padding: "10px" }}
                />

                <button onClick={() => updatePost(post.id)}>
                  Save
                </button>
              </>
            ) : (
              <>
                <Link to={`/post/${post.id}`} style={{ textDecoration: "none" }}>
                  <h3 style={{ color: darkMode ? "#fff" : "#111" }}>
                    {post.title}
                  </h3>
                </Link>

                <p>{post.content}</p>
              </>
            )}

            <small style={{ opacity: 0.7 }}>
              By: {post.author.name}
            </small>

            {currentUser?.id === post.authorId && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => startEdit(post)}>Edit</button>{" "}
                <button onClick={() => deletePost(post.id)}>Delete</button>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  )
}

export default Home