import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from "../api/axios"

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await API.post("/auth/login", formData)

      localStorage.setItem("token", res.data.token)

      alert(res.data.message)

      navigate("/")
    } catch (error) {
      alert(error.response.data.message)
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">Login</button>
      </form>

      <br />

      <Link to="/register">Create new account</Link>
    </div>
  )
}

export default Login