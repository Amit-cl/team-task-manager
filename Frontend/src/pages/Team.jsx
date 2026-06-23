import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const inputCls = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all";
const btnPrimary = "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer border-0 text-sm";
const btnDanger = "bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-1.5 px-3 rounded-lg text-xs cursor-pointer border-0 transition-colors";
const panelCls = "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm";

function Team() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [team, setTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const toastTimer = useRef(null);
  const showToast = (msg, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const loadTeam = async (projectId) => {
    if (!projectId) return;
    try {
      const res = await api.get(`/projects/${projectId}/team`);
      setTeam(res.data);
    } catch (err) {
      setTeam(null);
      showToast(err.response?.data?.message || "Could not load team", "error");
    }
  };

  const loadData = useCallback(async () => {
    try {
      const projRes = await api.get("/projects");
      setProjects(projRes.data);
      if (projRes.data.length > 0) {
        const firstId = projRes.data[0]._id;
        setSelectedProject(firstId);
        await loadTeam(firstId);
      }
      if (isAdmin) {
        const memRes = await api.get("/users/members");
        setMembers(memRes.data);
      }
    } catch (err) {
      console.error("Team loadData error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    loadTeam(e.target.value);
  };

  const alreadyInTeam = (memberId) => team?.members?.some((m) => m._id === memberId);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedMember) return showToast("Select a project and member", "error");
    setSubmitting(true);
    try {
      await api.post(`/projects/${selectedProject}/members`, { memberId: selectedMember });
      setSelectedMember("");
      showToast("Member added!");
      await loadTeam(selectedProject);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add member", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member? Their incomplete tasks will be unassigned.")) return;
    try {
      await api.delete(`/projects/${selectedProject}/members/${memberId}`);
      showToast("Member removed");
      await loadTeam(selectedProject);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not remove member", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-lg font-medium">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${
          toast.type === "error" ? "bg-red-600" : "bg-slate-900"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Project selector */}
      <div className={panelCls}>
        <h2 className="text-lg font-bold text-slate-800">{isAdmin ? "Team Management" : "My Project Teams"}</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          {isAdmin ? "Manage project-wise team members." : "View teams of your assigned projects."}
        </p>
        <div className="max-w-sm">
          <select className={inputCls} value={selectedProject} onChange={handleProjectChange}>
            <option value="">Select a project</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Team detail */}
      {team && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Project info + add member */}
          <div className={panelCls}>
            <h2 className="text-lg font-bold text-slate-800">{team.projectName}</h2>
            <p className="text-slate-500 text-sm mt-1">{team.description}</p>

            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Admin</span>
              <p className="font-bold text-slate-800 mt-1">{team.projectAdmin?.name}</p>
              <p className="text-slate-500 text-sm">{team.projectAdmin?.email}</p>
            </div>

            {isAdmin && (
              <form onSubmit={handleAddMember} className="flex gap-2 mt-4">
                <select
                  className={inputCls}
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Add a member...</option>
                  {members.filter((m) => !alreadyInTeam(m._id)).map((m) => (
                    <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
                  ))}
                </select>
                <button type="submit" disabled={submitting} className={btnPrimary + " shrink-0"}>
                  {submitting ? "..." : "Add"}
                </button>
              </form>
            )}
          </div>

          {/* Members table */}
          <div className={panelCls}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Team Members</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2">Name</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2">Email</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2">Role</th>
                    {isAdmin && <th className="pb-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {team.members.length === 0 && (
                    <tr><td colSpan={isAdmin ? 4 : 3} className="text-slate-400 text-center py-6 text-sm">No members yet</td></tr>
                  )}
                  {team.members.map((m) => (
                    <tr key={m._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">{m.name}</td>
                      <td className="py-3 text-slate-500 text-xs">{m.email}</td>
                      <td className="py-3">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full capitalize">{m.role}</span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 text-right">
                          <button className={btnDanger} onClick={() => handleRemoveMember(m._id)}>Remove</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isAdmin && (
              <p className="text-slate-400 text-xs mt-4">
                Assign tasks from the Dashboard. Only selected project members appear in the "Assign To" dropdown.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
