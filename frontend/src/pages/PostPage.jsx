import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import API from "../api/axios"

function PostPage() {
  const { id } = useParams()

  const [post, setPost] = useState(null)
  const [commentText, setCommentText] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  let currentUser = null
  if (token) {
    currentUser = JSON.parse(atob(token.split(".")[1]))
  }

  useEffect(() => {
    fetchPost()
  }, [])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const res = await API.get(`/posts/${id}`)
      setPost(res.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const addComment = async () => {
    try {
      if (!token) {
        alert("Please login first")
        return
      }

      if (!commentText.trim()) return

      await API.post(
        `/comments/${id}`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setCommentText("")
      fetchPost()
    } catch (error) {
      console.log(error)
    }
  }

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>

  if (!post) return <p style={{ padding: "20px" }}>Post not found</p>

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#121212" : "#f5f6fa",
        color: darkMode ? "#fff" : "#111",
        transition: "0.3s",
      }}
    >

      {/* HEADER */}
      <div
        style={{
          padding: "15px",
          borderBottom: darkMode ? "1px solid #333" : "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Blog Post</h2>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ padding: "5px 10px" }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* POST CONTENT */}
      <div style={{ maxWidth: "800px", margin: "20px auto", padding: "15px" }}>

        <div
          style={{
            background: darkMode ? "#1e1e1e" : "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: darkMode
              ? "0 0 10px rgba(255,255,255,0.05)"
              : "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2>{post.title}</h2>
          <p style={{ lineHeight: "1.6" }}>{post.content}</p>
          <small style={{ opacity: 0.7 }}>By: {post.author.name}</small>
        </div>

        {/* COMMENTS */}
        <div style={{ marginTop: "20px" }}>
          <h3>Comments</h3>

          {post.comments.length === 0 ? (
            <p>No comments yet</p>
          ) : (
            post.comments.map((c) => (
              <div
                key={c.id}
                style={{
                  background: darkMode ? "#1e1e1e" : "#fff",
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                  boxShadow: darkMode
                    ? "0 0 8px rgba(255,255,255,0.05)"
                    : "0 1px 5px rgba(0,0,0,0.05)",
                }}
              >
                <p style={{ margin: 0 }}>{c.text}</p>
                <small style={{ opacity: 0.7 }}>
                  By: {c.user.name}
                </small>
              </div>
            ))
          )}
        </div>

        {/* COMMENT BOX */}
        <div style={{ marginTop: "20px" }}>
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{
              width: "100%",
              height: "90px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: darkMode ? "#1e1e1e" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          />

          <button
            onClick={addComment}
            style={{
              marginTop: "10px",
              padding: "8px 15px",
              cursor: "pointer",
            }}
          >
            Add Comment
          </button>
        </div>

      </div>
    </div>
  )
}

export default PostPage