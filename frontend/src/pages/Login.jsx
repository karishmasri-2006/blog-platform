const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      email,
      password
    });

    if (res.data.message === "Login success") {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard"); // This will work now
    }
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  }
};