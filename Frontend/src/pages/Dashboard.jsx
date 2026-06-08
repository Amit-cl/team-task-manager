import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [projectTeam, setProjectTeam] = useState([]);
  const [message, setMessage] = useState("");
  const [projectForm, setProjectForm] = useState({ name: "", description: "", deadline: "" });
  const [memberForm, setMemberForm] = useState({ projectId: "", memberId: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", projectId: "", assignedTo: "", priority: "Medium", dueDate: "" });
  const showMessage = (text) => { setMessage(text); setTimeout(() => setMessage(""), 2500); };
  const loadData = async () => {
    const dashboardRes = await api.get("/dashboard");
    const projectsRes = await api.get("/projects");
    const tasksRes = await api.get("/tasks");
    setDashboard(dashboardRes.data); setProjects(projectsRes.data); setTasks(tasksRes.data);
    if (isAdmin) { const membersRes = await api.get("/users/members"); setMembers(membersRes.data); }
  };
  const loadProjectTeam = async (projectId) => {
    if (!projectId) return setProjectTeam([]);
    try { const res = await api.get(`/projects/${projectId}/team`); setProjectTeam(res.data.members || []); }
    catch { setProjectTeam([]); }
  };
  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadProjectTeam(taskForm.projectId); }, [taskForm.projectId]);
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.description || !projectForm.deadline) return showMessage("Please fill all project fields");
    try { await api.post("/projects", projectForm); setProjectForm({ name: "", description: "", deadline: "" }); showMessage("Project created"); loadData(); }
    catch (err) { showMessage(err.response?.data?.message || "Project creation failed"); }
  };
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.projectId || !memberForm.memberId) return showMessage("Select project and member");
    try { await api.post(`/projects/${memberForm.projectId}/members`, { memberId: memberForm.memberId }); setMemberForm({ projectId: "", memberId: "" }); showMessage("Member added to project"); loadData(); }
    catch (err) { showMessage(err.response?.data?.message || "Could not add member"); }
  };
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.projectId || !taskForm.assignedTo || !taskForm.dueDate) return showMessage("Title, project, assigned member and due date are required");
    try { await api.post("/tasks", taskForm); setTaskForm({ title: "", description: "", projectId: "", assignedTo: "", priority: "Medium", dueDate: "" }); showMessage("Task assigned"); loadData(); }
    catch (err) { showMessage(err.response?.data?.message || "Task creation failed"); }
  };
  const handleStatusUpdate = async (taskId, status) => {
    try { await api.patch(`/tasks/${taskId}/status`, { status }); showMessage("Status updated"); loadData(); }
    catch (err) { showMessage(err.response?.data?.message || "Status update failed"); }
  };
  const cards = dashboard?.cards || {};
  return (
    <div className="page">
      {message && <div className="toast">{message}</div>}
      <section className="stats-grid">
        {isAdmin ? <>
          <StatCard title="Total Projects" value={cards.totalProjects || 0} /><StatCard title="Total Members" value={cards.totalMembers || 0} /><StatCard title="Total Tasks" value={cards.totalTasks || 0} /><StatCard title="Completed" value={cards.completedTasks || 0} /><StatCard title="Overdue" value={cards.overdueTasks || 0} />
        </> : <>
          <StatCard title="My Projects" value={cards.myProjects || 0} /><StatCard title="My Tasks" value={cards.myTasks || 0} /><StatCard title="Completed" value={cards.completedTasks || 0} /><StatCard title="Overdue" value={cards.overdueTasks || 0} />
        </>}
      </section>
      {isAdmin && <section className="admin-grid">
        <div className="panel"><h2>Create Project</h2><p className="muted">Create project first, then add members.</p><form onSubmit={handleCreateProject}><input placeholder="Project name" value={projectForm.name} onChange={(e)=>setProjectForm({...projectForm,name:e.target.value})}/><textarea placeholder="Description" value={projectForm.description} onChange={(e)=>setProjectForm({...projectForm,description:e.target.value})}/><input type="date" value={projectForm.deadline} onChange={(e)=>setProjectForm({...projectForm,deadline:e.target.value})}/><button className="primary-btn">Create Project</button></form></div>
        <div className="panel"><h2>Add Member to Project</h2><p className="muted">Project-wise team management.</p><form onSubmit={handleAddMember}><select value={memberForm.projectId} onChange={(e)=>setMemberForm({...memberForm,projectId:e.target.value})}><option value="">Select project</option>{projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select><select value={memberForm.memberId} onChange={(e)=>setMemberForm({...memberForm,memberId:e.target.value})}><option value="">Select registered member</option>{members.map(m=><option key={m._id} value={m._id}>{m.name} - {m.email}</option>)}</select><button className="primary-btn">Add Member</button></form></div>
        <div className="panel wide-panel"><h2>Assign Task</h2><p className="muted">Only members added in selected project appear here.</p><form className="task-form" onSubmit={handleCreateTask}><input placeholder="Task title" value={taskForm.title} onChange={(e)=>setTaskForm({...taskForm,title:e.target.value})}/><input placeholder="Short description" value={taskForm.description} onChange={(e)=>setTaskForm({...taskForm,description:e.target.value})}/><select value={taskForm.projectId} onChange={(e)=>setTaskForm({...taskForm,projectId:e.target.value,assignedTo:""})}><option value="">Select project</option>{projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select><select value={taskForm.assignedTo} onChange={(e)=>setTaskForm({...taskForm,assignedTo:e.target.value})}><option value="">Assign to project member</option>{projectTeam.map(m=><option key={m._id} value={m._id}>{m.name} - {m.email}</option>)}</select><select value={taskForm.priority} onChange={(e)=>setTaskForm({...taskForm,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select><input type="date" value={taskForm.dueDate} onChange={(e)=>setTaskForm({...taskForm,dueDate:e.target.value})}/><button className="primary-btn">Assign Task</button></form></div>
      </section>}
      <section className="content-grid">
        <div className="panel"><h2>{isAdmin ? "All Projects" : "My Current Projects"}</h2><div className="list">{projects.length===0 && <p className="muted">No projects found</p>}{projects.map(p=><div className="list-card" key={p._id}><div><h3>{p.name}</h3><p>{p.description}</p><span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span></div><strong>{p.members?.length || 0} members</strong></div>)}</div></div>
        <div className="panel"><h2>{isAdmin ? "All Tasks" : "My Assigned Tasks"}</h2><div className="table-wrap"><table><thead><tr><th>Task</th><th>Project</th><th>{isAdmin ? "Assigned To" : "Assigned By"}</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead><tbody>{tasks.length===0 && <tr><td colSpan="6">No tasks found</td></tr>}{tasks.map(t=><tr key={t._id}><td>{t.title}</td><td>{t.project?.name}</td><td>{isAdmin ? t.assignedTo?.name : t.createdBy?.name}</td><td>{new Date(t.dueDate).toLocaleDateString()}</td><td>{t.priority}</td><td><select value={t.status} onChange={(e)=>handleStatusUpdate(t._id,e.target.value)}><option>To Do</option><option>In Progress</option><option>Completed</option></select></td></tr>)}</tbody></table></div></div>
      </section>
    </div>
  );
}
export default Dashboard;
