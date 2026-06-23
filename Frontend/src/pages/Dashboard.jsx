import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";

// Shared Tailwind class strings — keeps JSX clean
const inputCls = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all";
const selectCls = inputCls;
const btnPrimary = "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-xl transition-colors cursor-pointer border-0 text-sm";
const btnDanger = "bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-1.5 px-3 rounded-lg text-xs cursor-pointer border-0 transition-colors";
const panelCls = "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm";

const priorityBadge = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [projectTeam, setProjectTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const [projectForm, setProjectForm] = useState({ name: "", description: "", deadline: "" });
  const [memberForm, setMemberForm] = useState({ projectId: "", memberId: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", projectId: "", assignedTo: "", priority: "Medium", dueDate: "" });

  const toastTimer = useRef(null);
  const showToast = (msg, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [dashRes, projRes, taskRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/projects"),
        api.get("/tasks"),
      ]);
      setDashboard(dashRes.data);
      setProjects(projRes.data);
      setTasks(taskRes.data);
      if (isAdmin) {
        const memRes = await api.get("/users/members");
        setMembers(memRes.data);
      }
    } catch (err) {
      console.error("loadData error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadProjectTeam = async (projectId) => {
    if (!projectId) return setProjectTeam([]);
    try {
      const res = await api.get(`/projects/${projectId}/team`);
      setProjectTeam(res.data.members || []);
    } catch {
      setProjectTeam([]);
    }
  };

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadProjectTeam(taskForm.projectId); }, [taskForm.projectId]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.description || !projectForm.deadline)
      return showToast("Fill all project fields", "error");
    setSubmitting(true);
    try {
      await api.post("/projects", projectForm);
      setProjectForm({ name: "", description: "", deadline: "" });
      showToast("Project created!");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Project creation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.projectId || !memberForm.memberId)
      return showToast("Select a project and member", "error");
    setSubmitting(true);
    try {
      await api.post(`/projects/${memberForm.projectId}/members`, { memberId: memberForm.memberId });
      setMemberForm({ projectId: "", memberId: "" });
      showToast("Member added to project!");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add member", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.projectId || !taskForm.assignedTo || !taskForm.dueDate)
      return showToast("Fill all required task fields", "error");
    setSubmitting(true);
    try {
      await api.post("/tasks", taskForm);
      setTaskForm({ title: "", description: "", projectId: "", assignedTo: "", priority: "Medium", dueDate: "" });
      showToast("Task assigned!");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Task creation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      showToast("Status updated!");
      // Only refetch tasks — not the whole dashboard
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Status update failed", "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      showToast("Task deleted");
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete task", "error");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      showToast("Project deleted");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete project", "error");
    }
  };

  // FIX 3: Skeleton loader instead of plain text
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Skeleton stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-xl mb-3" />
              <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        {/* Skeleton panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/3 mb-6" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-10 bg-slate-100 rounded-xl mb-3" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = dashboard?.cards || {};

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
          toast.type === "error" ? "bg-red-600" : "bg-slate-900"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Stat cards */}
      <section className={`grid gap-4 ${isAdmin ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
        {isAdmin ? (
          <>
            <StatCard title="Total Projects" value={cards.totalProjects} />
            <StatCard title="Total Members" value={cards.totalMembers} />
            <StatCard title="Total Tasks" value={cards.totalTasks} />
            <StatCard title="Completed" value={cards.completedTasks} />
            <StatCard title="Overdue" value={cards.overdueTasks} />
          </>
        ) : (
          <>
            <StatCard title="My Projects" value={cards.myProjects} />
            <StatCard title="My Tasks" value={cards.myTasks} />
            <StatCard title="Completed" value={cards.completedTasks} />
            <StatCard title="Overdue" value={cards.overdueTasks} />
          </>
        )}
      </section>

      {/* Admin forms */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Create Project */}
            <div className={panelCls}>
              <h2 className="text-lg font-bold text-slate-800">Create Project</h2>
              <p className="text-slate-500 text-sm mt-1 mb-4">Create a project, then add team members.</p>
              <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
                <input className={inputCls} placeholder="Project name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                <textarea className={inputCls + " resize-none h-20"} placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
                <input type="date" className={inputCls} value={projectForm.deadline} onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })} />
                <button type="submit" disabled={submitting} className={btnPrimary}>{submitting ? "Creating..." : "Create Project"}</button>
              </form>
            </div>

            {/* Add Member */}
            <div className={panelCls}>
              <h2 className="text-lg font-bold text-slate-800">Add Member to Project</h2>
              <p className="text-slate-500 text-sm mt-1 mb-4">Assign registered members project-wise.</p>
              <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                <select className={selectCls} value={memberForm.projectId} onChange={(e) => setMemberForm({ ...memberForm, projectId: e.target.value })}>
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                <select className={selectCls} value={memberForm.memberId} onChange={(e) => setMemberForm({ ...memberForm, memberId: e.target.value })}>
                  <option value="">Select member</option>
                  {members.map((m) => <option key={m._id} value={m._id}>{m.name} — {m.email}</option>)}
                </select>
                <button type="submit" disabled={submitting} className={btnPrimary}>{submitting ? "Adding..." : "Add Member"}</button>
              </form>
            </div>
          </div>

          {/* Assign Task */}
          <div className={panelCls}>
            <h2 className="text-lg font-bold text-slate-800">Assign Task</h2>
            <p className="text-slate-500 text-sm mt-1 mb-4">Only members added to the selected project appear below.</p>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input className={inputCls} placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              <input className={inputCls} placeholder="Description (optional)" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              <select className={selectCls} value={taskForm.projectId} onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value, assignedTo: "" })}>
                <option value="">Select project</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <select className={selectCls} value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Assign to member</option>
                {projectTeam.map((m) => <option key={m._id} value={m._id}>{m.name} — {m.email}</option>)}
              </select>
              <select className={selectCls} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input type="date" className={inputCls} value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <button type="submit" disabled={submitting} className={btnPrimary + " sm:col-span-2 lg:col-span-3"}>{submitting ? "Assigning..." : "Assign Task"}</button>
            </form>
          </div>
        </>
      )}

      {/* Projects + Tasks lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Projects */}
        <div className={panelCls}>
          <h2 className="text-lg font-bold text-slate-800 mb-4">{isAdmin ? "All Projects" : "My Projects"}</h2>
          {projects.length === 0 ? (
            <p className="text-slate-400 text-sm">No projects found</p>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((p) => (
                <div key={p._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{p.name}</h3>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{p.description}</p>
                    <span className="text-slate-400 text-xs mt-1.5 block">
                      Deadline: {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-slate-500 text-xs font-semibold">{p.members?.length || 0} members</span>
                    {isAdmin && (
                      <button className={btnDanger} onClick={() => handleDeleteProject(p._id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className={panelCls}>
          <h2 className="text-lg font-bold text-slate-800 mb-4">{isAdmin ? "All Tasks" : "My Assigned Tasks"}</h2>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2 px-2">Task</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2 px-2">Project</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2 px-2">{isAdmin ? "Assigned To" : "By"}</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2 px-2">Due</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2 px-2">Priority</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-2 px-2">Status</th>
                  {isAdmin && <th className="pb-2 px-2"></th>}
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={isAdmin ? 7 : 6} className="text-slate-400 text-center py-6">No tasks found</td></tr>
                )}
                {tasks.map((t) => {
                  // FIX 4: Overdue row highlighting
                  const isOverdue = t.status !== "Completed" && new Date(t.dueDate) < new Date();
                  return (
                  <tr key={t._id} className={`border-b border-slate-50 transition-colors ${
                    isOverdue ? "bg-red-50 hover:bg-red-100" : "hover:bg-slate-50"
                  }`}>
                    <td className="py-3 px-2 font-medium text-slate-800">
                      <span>{t.title}</span>
                      {isOverdue && (
                        <span className="ml-2 text-xs font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-md">Overdue</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-600">{t.project?.name}</td>
                    <td className="py-3 px-2 text-slate-600">{isAdmin ? t.assignedTo?.name : t.createdBy?.name}</td>
                    <td className={`py-3 px-2 text-xs font-medium ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityBadge[t.priority] || "bg-slate-100 text-slate-600"}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {/* FIX 4: Color-coded status badge + dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                          t.status === "Completed" ? "bg-emerald-500" :
                          t.status === "In Progress" ? "bg-blue-500" : "bg-slate-400"
                        }`} />
                        <select
                          className={`border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500 cursor-pointer ${
                            t.status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                            t.status === "In Progress" ? "border-blue-200 bg-blue-50 text-blue-700" :
                            "border-slate-200 bg-white text-slate-600"
                          }`}
                          value={t.status}
                          onChange={(e) => handleStatusUpdate(t._id, e.target.value)}
                        >
                          <option>To Do</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                        </select>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-2">
                        <button className={btnDanger} onClick={() => handleDeleteTask(t._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
