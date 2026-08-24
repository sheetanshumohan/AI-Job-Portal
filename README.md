# 🚀 AI Resume Analyzer & Job Portal

> **An Enterprise-Grade, Full-Stack AI-Powered Recruitment Platform & Candidate Screening Engine**

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI Engine-Google%20Gemini-8E44AD?logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![OpenAI](https://img.shields.io/badge/AI Engine-OpenAI%20GPT--4o-00A67E?logo=openai&logoColor=white)](https://openai.com/)
[![Frontend Deployment](https://img.shields.io/badge/Frontend--Hosted--on-Vercel-000000?logo=vercel&logoColor=white)](https://ai-job-portal-d5kp.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Backend--Hosted--on-Render-46E3B7?logo=render&logoColor=white)](https://ai-job-portal-6c5n.onrender.com)

The **AI Resume Analyzer & Job Portal** is an end-to-end recruitment platform designed to eliminate hiring friction for recruiters and empower job seekers with instant feedback. Driven by **Google Gemini AI** and **OpenAI GPT models**, the platform automatically parses resumes, ranks applicants based on semantic job alignment, generates tailored mock interview simulations, and delivers rich analytics for hiring managers.

---

## 🌐 Live Deployments

| Service | Live URL | Hosting Platform | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | [https://ai-job-portal-d5kp.vercel.app](https://ai-job-portal-d5kp.vercel.app/) | **Vercel** | ![Active](https://img.shields.io/badge/Status-Live-brightgreen) |
| **Backend REST API** | [https://ai-job-portal-6c5n.onrender.com](https://ai-job-portal-6c5n.onrender.com) | **Render** | ![Active](https://img.shields.io/badge/Status-Live-brightgreen) |

---

## 📌 Executive Summary & Key Features

### 👨‍🎓 For Candidates / Job Seekers
- **Smart Job Discovery**: Search, filter, bookmark, and apply for opportunities matching candidate skills and career tracks.
- **Instant AI Resume Matcher**: Upload resumes (PDF/Doc) upon application to instantly receive a detailed match score, identified skill gaps, structural recommendations, and keyword alignment against job descriptions.
- **AI Mock Interview Simulator**: Take real-time, interactive technical and behavioral mock interviews dynamically tailored to target job posts, featuring automated response evaluations and actionable feedback.
- **Application Pipeline Tracking**: Monitor active application statuses in real-time (`Pending`, `Shortlisted`, `Rejected`, `Interview Scheduled`).
- **Profile & Asset Management**: Maintain single-source student profiles with persistent resume storage powered by Cloudinary.
- **Real-Time Notification Hub**: Instant alerts when application status changes or when interviews are scheduled.

### 💼 For Recruiters / Hiring Managers
- **Job Lifecycle Management**: Post, edit, close, and manage multi-skill job openings with customizable requirements.
- **Automated Candidate Ranking & Screening**: Process incoming applicants automatically sorted by their AI-generated compatibility match score, saving hours of manual resume triage.
- **Recruitment Analytics Dashboard**: Visual dashboards utilizing **Recharts** displaying candidate conversion funnels, application metrics, skill distributions, and hiring trends.
- **Comprehensive Candidate Assessment**: Deep dive into individual candidate profiles, PDF resume previews, AI match breakdown metrics, and automated interview feedback scores.

---

## 🏗️ System Architecture & Workflow Diagrams

### 1. High-Level Architecture Overview

```mermaid
graph TD
    subgraph Client Layer
        A["React SPA (Vite + TailwindCSS)"]
        B["Zustand State Store"]
        C["Framer Motion & Recharts UI"]
    end

    subgraph API & Gateway Layer
        D["Render Web Service / Node.js Router"]
        E["Express Middleware Engine"]
        F["JWT / OAuth 2.0 Auth Guard"]
    end

    subgraph Data & Storage Layer
        G[("MongoDB Atlas Database")]
        H["Cloudinary Storage (Resumes & Avatars)"]
    end

    subgraph External AI & Communication Services
        I["Google Gemini 1.5 API Engine"]
        J["OpenAI GPT-4o API Engine"]
        K["Nodemailer (SMTP Mail Service)"]
    end

    A <-->|"REST API / HTTPs"| D
    A --- B
    B --- C
    D --> E --> F
    F --> G
    E --> H
    E <-->|"Structured Prompt JSON"| I
    E <-->|"Fallback Analysis"| J
    E -->|"OTP & Notifications"| K
```

---

### 2. AI Resume Parsing & Match Scoring Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate / Student
    participant UI as Frontend App (React)
    participant API as Express API Server (Render)
    participant Storage as Cloudinary CDN
    participant Parser as PDF Parser Middleware
    participant AI as Gemini / OpenAI LLM
    participant DB as MongoDB Atlas
    actor Recruiter as Recruiter Dashboard

    Candidate->>UI: Select Job & Upload Resume (PDF)
    UI->>API: POST /api/v1/applications/apply (FormData)
    API->>Storage: Store Resume File
    Storage-->>API: Return Cloudinary Secure File URL
    API->>Parser: Extract Plain Text from Resume PDF Buffer
    Parser-->>API: Return Structured Extracted Text
    API->>AI: Send Prompt (Resume Text + Job Description + Requirements)
    Note over AI: Performs Semantic Match,<br/>Skill Extraction & Gap Analysis
    AI-->>API: Return JSON Response (Match Score %, Strengths, Gaps)
    API->>DB: Persist Application (Score, Feedback, Resume URL, Status: Pending)
    API-->>UI: Return Application Confirmation & AI Insights
    Recruiter->>UI: View Applicants for Posted Job
    UI->>API: GET /api/v1/recruiter/jobs/:id/applicants
    API->>DB: Query Applications (Sorted by matchScore DESC)
    DB-->>API: Return Applicant List
    API-->>UI: Render Pre-Ranked Candidate Table
```

---

### 3. Dynamic AI Mock Interview Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Student / Interviewee
    participant UI as React Interview Interface
    participant API as Backend Interview Controller (Render)
    participant AI as AI Question Engine
    participant DB as MongoDB Database

    Candidate->>UI: Initiate AI Mock Interview for Job
    UI->>API: POST /api/v1/interview/start (jobId)
    API->>DB: Fetch Job Stack & Tech Requirements
    API->>AI: Prompt AI to generate tech questions tailored to stack
    AI-->>API: Return Structured Question Set (Behavioral & Technical)
    API->>DB: Create Interview Record (Status: In-Progress)
    API-->>UI: Return Interview Session & First Question
    
    loop Interview Question Loop
        UI->>Candidate: Present Question to Candidate
        Candidate->>UI: Submit Response (Text/Audio Transcript)
        UI->>API: POST /api/v1/interview/submit-answer
        API->>AI: Evaluate Answer Depth, Accuracy, & Structure
        AI-->>API: Score (0-100) & Provide Direct Constructive Feedback
        API-->>UI: Show Immediate AI Evaluation & Load Next Question
    end

    API->>DB: Finalize Overall Session Score & Key Recommendations
    API-->>UI: Display Complete Performance Analytics & Feedback Report
```

---

### 4. Security & Role-Based Access Control (RBAC) Flow

```mermaid
flowchart TD
    Req["Incoming HTTP Request"] --> AuthCheck{"Has Bearer JWT Token or Cookie?"}
    
    AuthCheck -- No --> AuthPublic{"Route Public?"}
    AuthPublic -- Yes --> ExecPublic["Execute Controller"]
    AuthPublic -- No --> Unauthorized["Return 401 Unauthorized"]

    AuthCheck -- Yes --> TokenValid{"Verify JWT Signature & Expiry"}
    TokenValid -- Invalid --> TokenErr["Return 403 Forbidden / Expired"]
    TokenValid -- Valid --> AttachUser["Attach req.user Payload"]

    AttachUser --> RoleGuard{"Check Required Route Role"}
    RoleGuard -- "Role: Student" --> IsStudent{"User is Student?"}
    RoleGuard -- "Role: Recruiter" --> IsRecruiter{"User is Recruiter?"}
    
    IsStudent -- Yes --> ExecStudent["Execute Student Controller"]
    IsStudent -- No --> AccessDenied["Return 403 Forbidden"]

    IsRecruiter -- Yes --> ExecRecruiter["Execute Recruiter Controller"]
    IsRecruiter -- No --> AccessDenied
```

---

## 🛠️ Detailed Tech Stack Architecture

| Subsystem | Technology | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Frontend Framework** | `React 18` + `Vite` | Lightning-fast build tooling, modern component architecture, client-side routing with `react-router-dom`. |
| **State Management** | `Zustand` | Atomic, lightweight global state stores managing auth sessions, jobs, applications, and modal states. |
| **UI Components & Styling** | `Tailwind CSS` + `Lucide React` | Utility-first responsive styling with modern iconography and dark-mode compatible layout components. |
| **Animations & Visuals** | `Framer Motion` + `Recharts` | Interactive UI transitions, animated data visualizers, recruiter pipeline funnels, and performance graphs. |
| **Backend Runtime** | `Node.js` + `Express.js` | RESTful API architecture, JSON middleware, centralized error handling, asynchronous controller wrappers. |
| **Database & ODM** | `MongoDB` + `Mongoose` | NoSQL document storage, schemas with strict validation, population hooks, indexing on job and application records. |
| **AI Processing Engines** | `Google Gemini SDK` + `OpenAI API` | LLM prompt engineering for JSON-mode structured response generation, resume evaluation, match scoring, and mock interview questions. |
| **File Storage & Parsing** | `Multer` + `Cloudinary` + `pdf-parse` | In-memory multipart parsing, PDF buffer text extraction, cloud storage for student resume PDFs and avatar photos. |
| **Authentication & Mail** | `JWT` + `@react-oauth/google` + `Nodemailer` | HttpOnly cookie / Bearer JWT access control, Google OAuth 2.0 authentication integration, Nodemailer SMTP email verification and password resets. |
| **Security & Utilities** | `Helmet` + `CORS` + `bcryptjs` | Request header sanitization, strict CORS policy configuration, salted password hashing. |
| **Deployment Infrastructure** | `Vercel` (Frontend) & `Render` (Backend) | Frontend SPA client hosted on Vercel; Node.js Express REST API hosted as a cloud Web Service on Render. |

---

## 📁 Project Directory Structure

```
AI-Resume-Analyzer-Project/
├── backend/                              # Express Node.js Backend API Application (Hosted on Render)
│   ├── src/
│   │   ├── config/                       # Core Configuration Layer
│   │   │   ├── db.js                     # MongoDB connection pool initializer
│   │   │   └── cloudinary.js             # Cloudinary API storage config & upload engine
│   │   ├── controllers/                  # Route Logic Controllers
│   │   │   ├── application.controller.js # Application submission, AI scoring & retrieval
│   │   │   ├── auth.controller.js        # User signup, login, Google OAuth, OTP verification
│   │   │   ├── interview.controller.js   # AI Mock Interview generation & response grading
│   │   │   ├── job.controller.js         # Recruiter job postings, filtering, updates & deletion
│   │   │   ├── notification.controller.js# User alert management (Read/Unread)
│   │   │   ├── recruiter.controller.js   # Recruiter analytics, dashboards & applicant management
│   │   │   └── student.controller.js     # Student profile, saved jobs & dashboard summaries
│   │   ├── middleware/                   # Express HTTP Middleware
│   │   │   ├── auth.middleware.js        # JWT Token verifier & Role-Based guards (isRecruiter/isStudent)
│   │   │   └── upload.middleware.js      # Multer memory storage configuration for file uploads
│   │   ├── models/                       # Mongoose Database Schemas
│   │   │   ├── Application.model.js      # Application tracking schema with embedded AI evaluation
│   │   │   ├── Interview.model.js        # Mock interview transcript & score schema
│   │   │   ├── Job.model.js              # Job posting schema with tags & requirements
│   │   │   ├── Notification.model.js     # In-app user notifications schema
│   │   │   └── User.model.js             # Unified user schema for Students & Recruiters
│   │   ├── routes/                       # Express Route Handlers
│   │   │   ├── application.routes.js     # /api/v1/applications endpoints
│   │   │   ├── auth.routes.js            # /api/v1/auth endpoints
│   │   │   ├── interview.routes.js       # /api/v1/interview endpoints
│   │   │   ├── job.routes.js            # /api/v1/jobs endpoints
│   │   │   ├── notification.routes.js   # /api/v1/notifications endpoints
│   │   │   ├── recruiter.routes.js       # /api/v1/recruiter endpoints
│   │   │   └── student.routes.js         # /api/v1/student endpoints
│   │   ├── utils/                        # System Utility Modules
│   │   │   ├── generateToken.js          # JWT sign & cookie utility
│   │   │   ├── matching.service.js       # Dynamic AI resume match scoring helper
│   │   │   ├── openai.service.js         # OpenAI & Gemini LLM Prompt Engineering Service
│   │   │   ├── pdfParser.js              # PDF buffer buffer-to-text extractor
│   │   │   └── sendEmail.js              # Nodemailer email verification dispatch helper
│   │   ├── app.js                        # Express Application instance & global middleware
│   │   └── index.js                      # Server startup entry point
│   └── package.json                      # Backend dependencies & scripts
│
├── frontend/                             # React 18 + Vite Web Client (Hosted on Vercel)
│   ├── public/                           # Static Web Assets & Favicon
│   ├── src/
│   │   ├── components/                   # Reusable Visual Components
│   │   │   ├── common/                   # Navbars, Footers, Modals, Buttons, Badges
│   │   │   ├── recruiter/                # Recruiter visual charts & candidate score cards
│   │   │   └── student/                  # Job filters, match detail popups & interview widgets
│   │   ├── lib/                          # Utility & Axios Setup
│   │   │   └── axios.js                  # Pre-configured Axios client instance
│   │   ├── pages/                        # Role-Based Page Components
│   │   │   ├── auth/                     # Login, Registration, Google Auth, Reset Password
│   │   │   ├── recruiter/                # Analytics, Dashboard, Job Management, Candidate Ranking
│   │   │   ├── student/                  # Job Search, Apply Modal, AI Interviewer, Profile
│   │   │   └── Home.jsx                  # Main Landing Page
│   │   ├── store/                        # Global Zustand State Stores
│   │   │   └── authStore.js              # User auth state, token handler & session sync
│   │   ├── App.css                       # Layout CSS overrides
│   │   ├── App.jsx                       # Main Router, Layout Wrappers & Protected Routes
│   │   ├── index.css                     # Tailwind CSS base imports & styling rules
│   │   └── main.jsx                      # Vite React Root mount point
│   ├── package.json                      # Frontend dependencies & scripts
│   └── vercel.json                       # Single Page Application Vercel Rewrite Configuration
└── README.md                             # Comprehensive Project Documentation
```

---

## 🗄️ Database Schemas & Data Model Specifications

```
+-----------------------------------------------------------------------------------+
|                                 USER COLLECTION                                   |
+-----------------------------------------------------------------------------------+
| _id          : ObjectId (Primary Key)                                            |
| name         : String (Required)                                                  |
| email        : String (Unique, Lowercase, Indexed)                                |
| password     : String (Hashed with bcryptjs)                                      |
| role         : String Enum ["student", "recruiter"] (Default: "student")          |
| avatar       : String (Cloudinary URL)                                            |
| isVerified   : Boolean (Default: false)                                           |
| bio          : String (Profile Bio)                                               |
| skills       : Array of Strings (Candidate Skills)                                |
| experience   : Array of Objects [{ company, role, duration, description }]       |
| education    : Array of Objects [{ institution, degree, year }]                   |
| companyName  : String (Recruiter specific)                                        |
| companyWebsite: String (Recruiter specific)                                       |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 1:N (Posted Jobs)
                                         v
+-----------------------------------------------------------------------------------+
|                                 JOB COLLECTION                                    |
+-----------------------------------------------------------------------------------+
| _id          : ObjectId (Primary Key)                                            |
| recruiterId  : ObjectId (Ref: User, Indexed)                                      |
| title        : String (Required)                                                  |
| company      : String (Required)                                                  |
| location     : String (e.g. "Remote", "New York, NY")                            |
| jobType      : String Enum ["Full-Time", "Part-Time", "Contract", "Internship"]  |
| experienceLevel: String Enum ["Entry", "Mid", "Senior", "Lead"]                  |
| salaryRange  : String (e.g. "$100,000 - $130,000")                                |
| description  : String (Full Job Description Text)                                 |
| requirements : Array of Strings (Required Technical & Soft Skills)                |
| status       : String Enum ["Active", "Closed"] (Default: "Active")               |
| createdAt    : Date (Timestamp)                                                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 1:N (Applications)
                                         v
+-----------------------------------------------------------------------------------+
|                             APPLICATION COLLECTION                                |
+-----------------------------------------------------------------------------------+
| _id          : ObjectId (Primary Key)                                            |
| jobId        : ObjectId (Ref: Job, Indexed)                                       |
| studentId    : ObjectId (Ref: User, Indexed)                                    |
| resumeUrl    : String (Cloudinary PDF Link)                                       |
| matchScore   : Number (AI Generated Percentage 0 - 100)                          |
| matchFeedback: Object {                                                           |
|                  strengths: [String],                                             |
|                  gaps: [String],                                                  |
|                  recommendations: [String]                                        |
|                }                                                                  |
| status       : String Enum ["Pending", "Shortlisted", "Rejected"]                 |
| appliedAt    : Date (Timestamp)                                                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 1:N (Interview Sessions)
                                         v
+-----------------------------------------------------------------------------------+
|                             INTERVIEW COLLECTION                                  |
+-----------------------------------------------------------------------------------+
| _id          : ObjectId (Primary Key)                                            |
| studentId    : ObjectId (Ref: User, Indexed)                                    |
| jobId        : ObjectId (Ref: Job, Indexed)                                       |
| questions    : Array of Objects [{                                                |
|                  question: String,                                                |
|                  answer: String,                                                  |
|                  score: Number,                                                   |
|                  feedback: String                                                 |
|                }]                                                                 |
| overallScore : Number (Average Score 0 - 100)                                     |
| status       : String Enum ["In-Progress", "Completed"]                           |
| completedAt  : Date (Timestamp)                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 🤖 AI Engine & Prompt Engineering Infrastructure

The platform leverages **Google Gemini 1.5** (with fallback support to **OpenAI GPT-4o**) using enforced JSON schema constraints to deliver deterministic, structured responses.

### 1. Resume Parsing & Scoring Engine (`matching.service.js` & `openai.service.js`)
When a student submits an application:
1. `pdf-parse` extracts raw body text from the resume buffer.
2. The AI Engine formats a system prompt containing:
   - Extracted Resume Body
   - Job Title & Technical Requirements List
   - Expected Output JSON Structure
3. The AI returns a validated JSON payload:

```json
{
  "matchScore": 87,
  "strengths": [
    "5+ years of experience with React and Node.js backend services",
    "Strong background in MongoDB data modeling and performance optimization"
  ],
  "gaps": [
    "Lacks explicit cloud architecture experience with AWS or GCP",
    "No unit testing frameworks (Jest/Cypress) mentioned in recent work"
  ],
  "recommendations": [
    "Highlight experience with Docker and CI/CD pipelines",
    "Include quantitative metrics for previous web application scale"
  ]
}
```

### 2. Interactive Mock Interview Generator (`interview.controller.js`)
During a candidate mock interview:
- The AI Engine synthesizes 5 context-aware questions tailored specifically to the job position's listed tech stack.
- As the candidate responds to each question, the answer is passed to the AI to score technical accuracy, depth, and relevance on a scale of 0-100, accompanied by constructive feedback.

---

## 🔌 Complete REST API Endpoints Specification

### 🔑 Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new Candidate or Recruiter account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue JWT auth cookie/token |
| `POST` | `/api/v1/auth/google` | Public | Authenticate or register using Google OAuth 2.0 |
| `POST` | `/api/v1/auth/logout` | Private | Clear authentication session token |
| `GET` | `/api/v1/auth/me` | Private | Get authenticated user profile details |
| `POST` | `/api/v1/auth/verify-email` | Public | Verify account using OTP sent via email |
| `POST` | `/api/v1/auth/forgot-password` | Public | Send password reset token to user email |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset account password using token |

### 💼 Job Management Routes (`/api/v1/jobs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/jobs` | Public | List all active job postings with search & filter params |
| `GET` | `/api/v1/jobs/:id` | Public | Get full details of a specific job posting |
| `POST` | `/api/v1/jobs` | Recruiter | Create and publish a new job opening |
| `PUT` | `/api/v1/jobs/:id` | Recruiter | Update an existing job opening |
| `DELETE`| `/api/v1/jobs/:id` | Recruiter | Remove/Archive a job posting |

### 📄 Application Routes (`/api/v1/applications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/applications/apply` | Student | Apply to job with resume upload (Triggers AI Matcher) |
| `GET` | `/api/v1/applications/student` | Student | List all applications submitted by candidate |
| `PATCH`| `/api/v1/applications/:id/status`| Recruiter | Update candidate application status (`Shortlisted`/`Rejected`) |

### 📊 Recruiter Portal Routes (`/api/v1/recruiter`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/recruiter/analytics` | Recruiter | Fetch recruitment pipeline metrics, funnel charts & skill data |
| `GET` | `/api/v1/recruiter/jobs` | Recruiter | List all jobs created by authenticated recruiter |
| `GET` | `/api/v1/recruiter/jobs/:id/applicants` | Recruiter | Get applicants for a job automatically sorted by AI match score |

### 🎤 AI Mock Interview Routes (`/api/v1/interview`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/interview/start` | Student | Initialize AI Mock Interview session for a target job |
| `POST` | `/api/v1/interview/submit-answer` | Student | Submit question response & get instant AI grade & feedback |
| `GET` | `/api/v1/interview/my-interviews` | Student | Retrieve history of completed AI mock interview sessions |

### 🔔 Notification Routes (`/api/v1/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Private | Retrieve user notification inbox |
| `PATCH`| `/api/v1/notifications/:id/read` | Private | Mark specific notification as read |

---

## ⚙️ Environment Variables Configuration

### Backend Setup (`backend/.env`)

```env
# Node Environment & Server Config
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ai-job-portal-d5kp.vercel.app

# Database Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-job-portal?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_signing_key_here
JWT_EXPIRES_IN=7d

# Google OAuth 2.0 Client Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# SMTP Nodemailer Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Models Integration API Keys
GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Frontend Setup (`frontend/.env`)

```env
# API Base Endpoint URL (Render Backend Production URL)
VITE_API_BASE_URL=https://ai-job-portal-6c5n.onrender.com/api/v1

# Google OAuth Client ID for React Button
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 💻 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn** package manager
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Connection URI
- **API Keys**: Google Gemini API key, Cloudinary credentials, Nodemailer SMTP details

### Step 1: Repository Cloning
```bash
git clone https://github.com/sheetanshumohan/AI-Job-Portal.git
cd AI-Job-Portal
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
# Edit .env with your credentials

# Launch backend in development mode with nodemon
npm run dev
```
*The backend API server will run on `http://localhost:5000` locally.*

### Step 3: Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
# Edit .env with your credentials

# Launch Vite development server
npm run dev
```
*The frontend React client will launch on `http://localhost:5173` locally.*

---

## ☁️ Deployment Architecture (Vercel & Render)

The architecture is deployed across dedicated cloud infrastructure tailored for optimal performance:

### 1. Backend Service (Render Web Service)
The Node.js + Express API server runs as a continuous cloud **Web Service** on [Render](https://render.com/):
- **Build Command**: `npm install`
- **Start Command**: `npm start` (Runs `node src/index.js`)
- **Live Endpoint**: [https://ai-job-portal-6c5n.onrender.com](https://ai-job-portal-6c5n.onrender.com)
- Environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLOUDINARY_*`, etc.) are configured directly in Render Environment Settings.

### 2. Frontend Application (Vercel SPA)
The React + Vite single-page application is hosted on [Vercel](https://vercel.com/):
- **Live URL**: [https://ai-job-portal-d5kp.vercel.app](https://ai-job-portal-d5kp.vercel.app/)
- **Configuration (`frontend/vercel.json`)**: Configured with client-side route rewrites for React Router DOM:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔒 Security, Performance & Code Quality Highlights

- **JWT Authentication & Token Security**: Passwords hashed using `bcryptjs` with salt rounds. Tokens signed with secure secrets and stored in secure cookies or client headers.
- **Role-Based Guards**: Protected routes rigorously validate identity and user roles (`student` vs. `recruiter`), denying unauthorized cross-role requests.
- **Input Sanitization & Buffer Security**: File uploads process strictly via memory storage buffers (`Multer`), validated for PDF mime-types before streaming to Cloudinary.
- **Resilient AI Service Fallbacks**: Built-in fallback strategy that automatically routes resume evaluation queries to OpenAI if Google Gemini API hits rate limits or quota boundaries.
- **Production HTTP Headers**: Server guarded with `Helmet` middleware for XSS protection, anti-clickjacking, and MIME sniffing protection.

---

## 🚀 Future Enhancements Roadmap

- [ ] **ATS Interactive Resume Builder**: Built-in visual resume builder exporting AI-optimized PDFs.
- [ ] **AI Video Interview Assessment**: Real-time video/audio response processing with speech analysis and confidence scoring.
- [ ] **Direct Recruiter-Candidate Messaging**: WebSocket-based real-time chat between hiring managers and shortlisted candidates.
- [ ] **Automated Assessment Tests**: Customizable technical coding challenges integrated directly into the application process.

---

## 📄 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with ❤️ by **Sheetanshu Mohan** and Contributor Team.
For inquiries, support, or security feedback, please submit an issue on the [GitHub Repository](https://github.com/sheetanshumohan/AI-Job-Portal).
