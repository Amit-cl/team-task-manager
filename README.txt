Team Task Manager - Full Stack Assignment

Live Application URL:
https://team-task-manager-production-621d.up.railway.app

Backend API URL:
https://triumphant-playfulness-production-be22.up.railway.app

GitHub Repository:
https://github.com/Amit-cl/team-task-manager

Project Summary
Team Task Manager is a full-stack web application where admins can create projects, manage project-wise team members, assign tasks, and track progress. Members can view their assigned tasks, check their project team, and update task status.

Tech Stack
Frontend: React, Vite, CSS, Axios, React Router
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Authentication: JWT, bcryptjs
Deployment: Railway

Main Features

1. Authentication

* User signup and login
* Password hashing using bcryptjs
* JWT-based protected APIs
* Role selection: Admin or Member

2. Role-Based Access Control

Admin:

* Create projects
* View all projects
* Add registered members to a selected project
* Remove members from a project
* Assign tasks only to members added in that project
* View all tasks and update task status

Member:

* View only projects where they are added
* View only their assigned tasks
* Update only their own task status
* View only their own project team
* Cannot create projects, add members, remove members, or assign tasks

3. Project and Team Management

* Admin creates a project with name, description, and deadline
* Each project starts with an empty team
* Admin adds existing registered members to a selected project
* Team page shows project-wise team members
* Members can only view teams of projects where they are added

4. Task Management

* Admin selects a project before assigning a task
* Frontend fetches members of the selected project
* Admin can assign tasks only to project team members
* Each task stores project, assigned member, assigned by, priority, status, and due date
* Member can update task status: To Do, In Progress, Completed

5. Dashboard
   Admin dashboard shows:

* Total projects
* Total members
* Total tasks
* Completed tasks
* Overdue tasks
* All projects and tasks

Member dashboard shows:

* My projects
* My assigned tasks
* Completed tasks
* Overdue tasks
* Project name
* Assigned by admin

Validation
Frontend validation:

* Required fields
* Email format
* Password length
* Form-level checks before API call

Backend validation:

* Required fields
* Duplicate email check
* JWT token verification
* Admin-only route protection
* Valid MongoDB IDs
* Valid task status and priority
* Due date validation
* Duplicate project member prevention
* Task assignment allowed only to members added in that project

How to Run Locally

Backend:
cd Backend
npm install

Create Backend/.env:
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=change_this_secret_key
CLIENT_URL=http://localhost:5173

Run backend:
npm run dev

Backend will run on:
http://localhost:5000

Frontend:
cd Frontend
npm install

Create Frontend/.env:
VITE_API_URL=http://localhost:5000/api

Run frontend:
npm run dev

Frontend will run on:
http://localhost:5173

Demo Flow

1. Register an Admin account
2. Register a Member account
3. Login as Admin
4. Create a project
5. Go to Team page and add member to that project
6. Go to Dashboard and assign task to that project member
7. Logout and login as Member
8. Member sees assigned task with project name and assigned by
9. Member updates task status
10. Login as Admin again and check updated dashboard progress

Deployment
Frontend is deployed on Railway:
https://team-task-manager-production-621d.up.railway.app

Backend is deployed on Railway:
https://triumphant-playfulness-production-be22.up.railway.app

MongoDB Atlas is used as the production database.



