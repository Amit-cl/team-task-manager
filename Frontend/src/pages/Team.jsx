import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
function Team() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [team, setTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [message, setMessage] = useState("");
  const loadTeam = async (projectId) => {
    if (!projectId) return;
    try { const res = await api.get(`/projects/${projectId}/team`); setTeam(res.data); }
    catch (err) { setTeam(null); setMessage(err.response?.data?.message || "Could not load team"); }
  };
  const loadData = async () => {
    const projectRes = await api.get("/projects");
    setProjects(projectRes.data);
    if (projectRes.data.length > 0) { setSelectedProject(projectRes.data[0]._id); loadTeam(projectRes.data[0]._id); }
    if (isAdmin) { const memberRes = await api.get("/users/members"); setMembers(memberRes.data); }
  };
  useEffect(() => { loadData(); }, []);
  const handleProjectChange = (e) => { setSelectedProject(e.target.value); loadTeam(e.target.value); };
  const alreadyInTeam = (memberId) => team?.members?.some((m) => m._id === memberId);
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedMember) return setMessage("Select project and member");
    try { await api.post(`/projects/${selectedProject}/members`, { memberId: selectedMember }); setSelectedMember(""); setMessage("Member added"); loadData(); loadTeam(selectedProject); }
    catch (err) { setMessage(err.response?.data?.message || "Could not add member"); }
  };
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from project?")) return;
    try { await api.delete(`/projects/${selectedProject}/members/${memberId}`); setMessage("Member removed"); loadData(); loadTeam(selectedProject); }
    catch (err) { setMessage(err.response?.data?.message || "Could not remove member"); }
  };
  return (
    <div className="page">
      {message && <div className="toast">{message}</div>}
      <div className="panel"><h2>{isAdmin ? "Team Management" : "My Project Teams"}</h2><p className="muted">{isAdmin ? "Admin can manage project-wise teams." : "Member can view only their own project teams."}</p><div className="toolbar"><select value={selectedProject} onChange={handleProjectChange}><option value="">Select project</option>{projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></div></div>
      {team && <section className="team-grid">
        <div className="panel"><h2>{team.projectName}</h2><p className="muted">{team.description}</p><div className="manager-card"><span>Project Admin</span><strong>{team.projectAdmin?.name}</strong><p>{team.projectAdmin?.email}</p></div>{isAdmin && <form className="inline-form" onSubmit={handleAddMember}><select value={selectedMember} onChange={(e)=>setSelectedMember(e.target.value)}><option value="">Select member to add</option>{members.filter(m=>!alreadyInTeam(m._id)).map(m=><option key={m._id} value={m._id}>{m.name} - {m.email}</option>)}</select><button className="primary-btn">Add Member</button></form>}</div>
        <div className="panel"><h2>Project Team Members</h2><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th>{isAdmin && <th>Action</th>}</tr></thead><tbody>{team.members.length===0 && <tr><td colSpan={isAdmin ? 4 : 3}>No members added yet</td></tr>}{team.members.map(m=><tr key={m._id}><td>{m.name}</td><td>{m.email}</td><td>{m.role}</td>{isAdmin && <td><button className="danger-btn" onClick={()=>handleRemoveMember(m._id)}>Remove</button></td>}</tr>)}</tbody></table></div>{isAdmin && <p className="muted small-note">Assign tasks from Dashboard. Only selected project's members appear in Assign To dropdown.</p>}</div>
      </section>}
    </div>
  );
}
export default Team;
