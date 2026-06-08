import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2 className="brand">TaskFlow</h2>
          <p className="role-badge">{user?.role?.toUpperCase()}</p>
          <nav className="nav"><NavLink to="/" end>Dashboard</NavLink><NavLink to="/team">Team</NavLink></nav>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><h1>Team Task Manager</h1><p>Welcome, {user?.name}. Manage projects, teams and task progress.</p></div>
          <div className="user-pill">{user?.email}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
export default Layout;
