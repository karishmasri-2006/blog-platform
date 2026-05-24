import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function CreatePost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const navigate = useNavigate()

  const token = localStorage.getItem("token")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert("Please login first")
      return
    }

    try {
      await API.post(
        "/posts",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert("Post created successfully 🚀")
      navigate("/")
    } catch (error) {
      console.log(error)
      alert("Failed to create post")
    }
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        ✍️ Create New Post
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          backgroundColor: "#fff",
        }}
      >
        <label style={{ fontWeight: "bold" }}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <label style={{ fontWeight: "bold" }}>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content..."
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            marginTop: "5px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "10px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Publish Post
        </button>
      </form>
    </div>
  )
}

export default CreatePost;