import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.role) return "All fields are required";
    if (form.name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    const message = validate();
    if (message) return setError(message);
    try { await register(form); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Registration failed"); }
  };
  return <div className="auth-page"><div className="auth-card"><h1>Create Account</h1><p className="muted">Register as Admin or Member</p>{error && <div className="error">{error}</div>}<form onSubmit={handleSubmit}><label>Name</label><input name="name" value={form.name} onChange={handleChange} /><label>Email</label><input name="email" value={form.email} onChange={handleChange} /><label>Password</label><input name="password" type="password" value={form.password} onChange={handleChange} /><label>Role</label><select name="role" value={form.role} onChange={handleChange}><option value="member">Member</option><option value="admin">Admin</option></select><button className="primary-btn">Register</button></form><p className="small-text">Already have account? <Link to="/login">Login</Link></p></div></div>;
}
export default Register;
