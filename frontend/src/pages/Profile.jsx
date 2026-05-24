import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import API from "../api/axios"

function Profile() {
  const [posts, setPosts] = useState([])

  const token = localStorage.getItem("token")

  let user = null

  if (token) {
    user = JSON.parse(atob(token.split(".")[1]))
  }

  useEffect(() => {
    fetchMyPosts()
  }, [])

  const fetchMyPosts = async () => {
    try {
      const res = await API.get("/posts")
      const myPosts = res.data.filter(
        (post) => post.authorId === user.id
      )
      setPosts(myPosts)
    } catch (error) {
      console.log(error)
    }
  }

  const deletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert("Post deleted")
      fetchMyPosts()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>👤 My Profile</h1>

      {user && (
        <div
          style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <p><b>Name:</b> {user.name}</p>
          <p><b>User ID:</b> {user.id}</p>
        </div>
      )}

      <h2>My Posts</h2>

      {posts.length === 0 ? (
        <p>No posts created yet</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              background: "#fff",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
              boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
            }}
          >
            <Link
              to={`/post/${post.id}`}
              style={{ textDecoration: "none", color: "#333" }}
            >
              <h3>{post.title}</h3>
            </Link>

            <p>{post.content}</p>

            <button
              onClick={() => deletePost(post.id)}
              style={{
                background: "#ff4d4d",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  )
}

export default Profile