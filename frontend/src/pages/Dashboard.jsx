import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function Dashboard() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/login")
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")

      const res = await API.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert(res.data.message)

      setFormData({
        title: "",
        content: "",
      })

      navigate("/")
    } catch (error) {
      alert(error.response.data.message)
    }
  }

  return (
    <div>
      <h1>Create Blog Post</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Post title"
          value={formData.title}
          onChange={handleChange}
        />

        <br /><br />

        <textarea
          name="content"
          placeholder="Post content"
          value={formData.content}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Create Post
        </button>
      </form>
    </div>
  )
}

export default Dashboard