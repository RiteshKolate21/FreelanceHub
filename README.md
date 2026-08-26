# FreelanceHub — Editorial Freelance Marketplace

**FreelanceHub** is a modern MERN stack freelance marketplace connecting Clients, Freelancers, and Administrators.

Designed with an **editorial workspace aesthetic** (warm neutral tones, high-contrast serif/sans typography, split-view panels, and micro-interactions), FreelanceHub offers a professional platform for posting projects, comparing bids, real-time messaging, work delivery, ratings & reviews, notifications, and platform administration.

---

## 🌟 Key Features

### 🏢 Client Workspace
- **Dashboard**: High-level metrics, active projects, pending proposals requiring attention, submission review alerts.
- **Project Posting & Management**: Create, edit, and delete open projects with budget, skills, and deadlines.
- **Applicant Comparison Interface**: Compare candidate bids, completion estimates, ratings, and proposals side-by-side. Approve or reject applicants with automatic workspace assignment.
- **Deliverable Completion**: Review freelancer submissions and complete projects.
- **Rating & Review System**: Submit 1–5 star reviews with written feedback upon project completion, automatically updating freelancer average ratings.

### 💻 Freelancer Workspace
- **Dashboard**: Track total earnings, average rating, active assigned projects, and client feedback.
- **Discovery Marketplace**: Search projects by title/keyword, filter by skills and budget, submit proposals with bid amounts and estimated timelines.
- **Proposal Tracker**: Track status of submitted applications (`Pending`, `Approved`, `Rejected`).
- **My Work Workspace**: Manage assigned projects in progress, submit completed work for client approval.
- **Portfolio Editor**: Personalize summary bio, tech stack skills, and years of experience.

### 🛡️ Admin Console
- **Platform Overview**: System-wide statistics for users, projects, applications, and reviews.
- **User Moderation**: Filter users by role (`Client`, `Freelancer`, `Admin`), search by username/email, and enable/disable problematic user accounts.
- **Project & Review Moderation**: Moderate projects and reviews with automated freelancer rating recalculation.

### 🔔 System Notifications
- Automated system notifications for new applications, approvals, rejections, freelancer assignment, work submissions, completions, and chat messages.
- Read/unread indicators, unread badge counter, and single/bulk mark-as-read controls.

### 💬 Project Messaging
- Project-based chat thread between client and assigned freelancer.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (v19), Vite, React Router DOM (v7), Lucide Icons, Custom Editorial Vanilla CSS.
- **Backend**: Node.js, Express.js (v5), MongoDB, Mongoose.
- **Security**: JWT Authentication, bcryptjs password hashing, role-based middleware (`authorizeRoles`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

---

### Setup Instructions

#### 1. Backend Server Setup
```bash
cd Server
npm install
```
Create a `.env` file in `Server/` (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/freelancehub
JWT_SECRET=your_jwt_super_secret_key
```
Start the backend server:
```bash
npm run dev
# Server runs at http://localhost:5000
```

#### 2. Frontend React Setup
```bash
cd Client
npm install
npm run dev
# Client runs at http://localhost:5173
```

---

## 📖 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user (`userType`: Client / Freelancer / Admin)
- `POST /api/auth/login` — Login user & return JWT token
- `GET /api/auth/me` — Retrieve currently authenticated user profile

### Projects (`/api/projects`)
- `GET /api/projects` — Fetch open projects (Supports `skill`, `search`, `minBudget`, `maxBudget`)
- `GET /api/projects/:id` — Fetch project details with populated client & freelancer
- `POST /api/projects` — Create project (`Client` only)
- `PUT /api/projects/:id` — Update project (`Client` owner only)
- `DELETE /api/projects/:id` — Delete project (`Client` owner only)
- `PATCH /api/projects/:projectId/submit` — Submit work (`Freelancer` assigned only)
- `PATCH /api/projects/:projectId/complete` — Mark project complete (`Client` owner only)

### Applications (`/api/applications`)
- `POST /api/applications` — Submit application (`Freelancer` only)
- `GET /api/applications/my-applications` — Get freelancer's applications
- `GET /api/applications/client-received` — Get client's received applications
- `GET /api/applications/project/:projectId` — Get applications for a project
- `PATCH /api/applications/:applicationId/status` — Approve/Reject application (`Client` owner only)

### Freelancers (`/api/freelancers`)
- `GET /api/freelancers` — Browse freelancers with search, skill, minRating, pagination
- `GET /api/freelancers/:userId` — Fetch freelancer profile & ratings
- `POST /api/freelancers` — Create freelancer profile (`Freelancer` only)
- `PUT /api/freelancers` — Update freelancer profile (`Freelancer` only)

### Reviews (`/api/reviews`)
- `POST /api/reviews` — Submit review for completed project (`Client` owner only)
- `GET /api/reviews/freelancer/:freelancerId` — Fetch reviews for freelancer
- `GET /api/reviews/project/:projectId` — Fetch review for project

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user's notifications
- `GET /api/notifications/unread-count` — Get count of unread notifications
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all notifications read

### Dashboards (`/api/dashboard`)
- `GET /api/dashboard/freelancer` — Freelancer metrics, work, reviews, earnings
- `GET /api/dashboard/client` — Client metrics, projects, applications

### Admin Console (`/api/admin`)
- `GET /api/admin/stats` — Platform metrics (`Admin` only)
- `GET /api/admin/users` — List platform users (`Admin` only)
- `PATCH /api/admin/users/:userId/status` — Enable/Disable user account (`Admin` only)
- `GET /api/admin/projects` — List platform projects (`Admin` only)
- `DELETE /api/admin/projects/:projectId` — Moderate project (`Admin` only)
- `GET /api/admin/reviews` — List platform reviews (`Admin` only)
- `DELETE /api/admin/reviews/:reviewId` — Moderate review (`Admin` only)

---

## 🧪 Testing Backend

Run automated end-to-end backend tests:
```bash
cd Server
node server.js
```
