import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to Blog Platform</h1>
      <p>Share your thoughts with the world</p>
      <div style={{ marginTop: "20px" }}>
        <Link to="/login" style={{ margin: "10px", padding: "10px 20px", background: "#007bff", color: "white", textDecoration: "none" }}>
          Login
        </Link>
        <Link to="/register" style={{ margin: "10px", padding: "10px 20px", background: "#28a745", color: "white", textDecoration: "none" }}>
          Register
        </Link>
      </div>
    </div>
  );
}

export default Home;