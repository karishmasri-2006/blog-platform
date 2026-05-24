import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          Blog Platform
        </Link>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-green-500 px-4 py-2 rounded-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;