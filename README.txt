Team Task Manager - Full Stack Assignment

Project Summary
This is a full-stack Team Task Manager app with authentication, role-based access, project-wise team management, task assignment and dashboard tracking.

Tech Stack
Frontend: React + Vite + CSS + Axios + React Router
Backend: Node.js + Express.js
Database: MongoDB + Mongoose
Authentication: JWT + bcryptjs

Main Features
1. Authentication
- Signup and Login
- Password hashing using bcryptjs
- JWT protected APIs
- Role: admin or member

2. Role Based Access
Admin:
- Create projects
- View all projects
- Add registered members to a selected project
- Remove members from a project
- Assign tasks only to members added in that project
- View all tasks and update status

Member:
- View only projects where they are added
- View only assigned tasks
- Update only own task status
- View only own project team
- Cannot create project, add member or assign task

3. Project and Team Management
- Admin creates a project with name, description and deadline
- Project starts with empty members
- Admin adds existing registered members to a project
- Team page shows project-wise team
- Member sees only their own project teams

4. Task Management
- Admin selects project
- Frontend fetches selected project team
- Admin assigns task only to a project member
- Task stores project, assignedTo, createdBy, priority, status and due date
- Member can update status: To Do, In Progress, Completed

5. Dashboard
Admin dashboard shows total projects, members, tasks, completed tasks and overdue tasks.
Member dashboard shows my projects, my tasks, completed tasks, overdue tasks and assigned-by admin.

Validation
Frontend validation: required fields, email format, password length and form checks.
Backend validation: required fields, duplicate email, JWT, admin-only APIs, valid IDs, valid status/priority, due date checks, duplicate project member prevention and task assignment only to project members.

How to Run Locally

Backend:
cd Backend
npm install

Create Backend/.env:
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=change_this_secret_key
CLIENT_URL=http://localhost:5173

Run:
npm run dev

Frontend:
cd Frontend
npm install

Create Frontend/.env:
VITE_API_URL=http://localhost:5000/api

Run:
npm run dev

Open:
http://localhost:5173

Demo Flow
1. Register Admin
2. Register Member
3. Login as Admin
4. Create Project
5. Go to Team page and add Member to project
6. Go to Dashboard and assign task to that project member
7. Login as Member
8. See assigned task with project name and assigned by
9. Update task status
10. Login as Admin and check dashboard progress

Deployment
Backend can be deployed on Railway.
Frontend can be deployed on Railway or Vercel.
Use MongoDB Atlas for production database.
