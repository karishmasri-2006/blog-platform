import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Blog Platform</h1>
      <p>Welcome! Login or register to start posting.</p>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/register"><button>Register</button></Link>
    </div>
  );
}

export default Home;