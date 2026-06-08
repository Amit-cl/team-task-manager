import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const validate = () => {
    if (!form.email || !form.password) return "Email and password are required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    const message = validate();
    if (message) return setError(message);
    try { await login(form.email, form.password); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };
  return <div className="auth-page"><div className="auth-card"><h1>TaskFlow</h1><p className="muted">Login to manage team tasks</p>{error && <div className="error">{error}</div>}<form onSubmit={handleSubmit}><label>Email</label><input name="email" value={form.email} onChange={handleChange} placeholder="admin@gmail.com" /><label>Password</label><input name="password" type="password" value={form.password} onChange={handleChange} placeholder="******" /><button className="primary-btn">Login</button></form><p className="small-text">New user? <Link to="/register">Create account</Link></p></div></div>;
}
export default Login;
