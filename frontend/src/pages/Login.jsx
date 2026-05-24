import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://blog-platform-f7yo.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Attempting login to:", `${API_URL}/api/auth/login`);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      console.log("Login response:", res.data);

      // Your backend likely returns { user: {...} } or { message: "Login success", user: {...} }
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else if (res.data.message === "Login success" && res.data.token) {
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/dashboard");
      } else {
        setError("Login failed: No user data in response");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      
      if (err.response?.status === 404) {
        setError("Login endpoint not found. Backend route issue.");
      } else if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid request");
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Backend might be sleeping.");
      } else {
        setError("Login failed. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;