import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Layout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
      isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-slate-900 text-white md:w-60 md:min-h-screen md:sticky md:top-0 md:h-screen flex-shrink-0 flex flex-col">

        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col justify-between h-full p-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">TaskFlow</h2>
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
              {user?.role}
            </span>
            <nav className="mt-10 flex flex-col gap-1.5">
              <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/team" className={navLinkClass}>Team</NavLink>
            </nav>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer border-0 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">TaskFlow</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold uppercase">
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-300 hover:text-white bg-slate-800 p-2 rounded-lg cursor-pointer border-0 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-1.5 border-t border-slate-800 pt-3">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
            <NavLink to="/team" className={navLinkClass} onClick={() => setMobileOpen(false)}>Team</NavLink>
            <button
              onClick={logout}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer border-0 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-50 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Team Task Manager</h1>
            <p className="text-slate-500 text-sm mt-0.5">Welcome, {user?.name}. Manage projects, teams and tasks.</p>
          </div>
          <div className="shrink-0 bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full hidden sm:block">
            {user?.email}
          </div>
        </header>

        <div className="p-4 md:p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
