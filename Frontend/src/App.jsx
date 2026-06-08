import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Team from "./pages/Team.jsx";
import Layout from "./components/Layout.jsx";
function ProtectedPage({ children }) { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace />; }
function PublicPage({ children }) { const { user } = useAuth(); return user ? <Navigate to="/" replace /> : children; }
function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
      <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
      <Route path="/" element={<ProtectedPage><Layout /></ProtectedPage>}>
        <Route index element={<Dashboard />} />
        <Route path="team" element={<Team />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
