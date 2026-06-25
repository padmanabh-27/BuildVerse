# BuildVerse 🚀

> **Co-build the future of software.** BuildVerse is a full-stack startup collaboration platform that connects developers, matches teams using AI, coordinates tasks via Kanban boards, and tracks verified reputation — all in one place.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User Registration & Login with **JWT** (Access + Refresh tokens)
- Automatic JWT refresh support
- Protected API routes and protected frontend routes
- Secure logout (client-side token clearing)

### 👤 User Profile System
- **Profile fields**: Bio, Country, State, City, Timezone, GitHub URL, LinkedIn URL, Experience Years, Available for Work
- **Profile Summary API** — Returns username, email, skills, role reputation, skill reputation, projects joined, tasks completed
- **Public Profile** — Anyone can view username, skills, reputation, experience, projects joined, tasks completed

### 🛠️ Skills System
- Add & remove skills
- Duplicate prevention
- Per-user skill storage

### 📁 Projects Module
- Full CRUD: Create, Update, Delete, View Projects
- Project categories and status (`recruiting`, `active`, `completed`)
- Define **required roles** (with slot counts) and **required skills** (with min experience)
- Join request system — send, approve, decline with role assignment
- Team roster management
- Project completion tracking

### 📋 Task Management (Kanban)
- Create, update, delete tasks per project
- **3-column Kanban board**: To Do → In Progress → Completed
- Assign tasks to team members
- Move tasks between columns
- Only project members can view/edit their project's tasks

### 💬 Team Chat
- Real-time team messaging per project
- Scrollable message history with sender and timestamp
- Send button with keyboard support

### 📄 Documents Hub
- Upload and manage project documents per workspace
- Document listing per project

### 🤖 AI Matching Engine
- **Groq LLaMA-powered** neural recruit engine
- Describe your ideal team member in natural language
- AI extracts required skills and experience
- Matches against registered developers using a smart scoring algorithm
- Match percentage displayed per candidate
- Invite candidates directly from results

### 🔔 Notifications System
- Real-time notification polling
- Unread count badge in sidebar
- Mark all as read

### ⭐ Reputation & Reviews
- Rate collaborators after project completion
- **Role reputation** (how well you fill a role)
- **Skill reputation** (verified skill scores)
- Public reputation displayed on profiles

### 📊 Dashboard
- Personal command center with stats
- Projects joined count, tasks completed count
- Activity feed
- Onboarding checklist widget
- Quick navigation to AI Matcher and Project Feed

### 🔍 Search & Discovery
- Search developers by name, handles, or technical skills
- Filter by availability, minimum experience, location/city
- View builder badges: Verified, Top Contributor, AI Expert, Project Leader
- Profile & Invite from search results

### 👥 Teams Workspace
- View all projects you're part of
- See full team roster per project
- Owner and member role display
- Quick-access project workspace links

### 🎨 Portfolio System
- Portfolio entries per user
- Availability for work toggle
- Visible on public profiles

---

## 🖥️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.12+ | Core language |
| **Django** | 6.0.6 | Web framework |
| **Django REST Framework** | 3.17.1 | REST API layer |
| **djangorestframework-simplejwt** | 5.5.1 | JWT authentication |
| **django-cors-headers** | 4.9.0 | CORS handling |
| **PostgreSQL** | 14+ | Primary database |
| **psycopg2-binary** | 2.9.12 | PostgreSQL adapter |
| **OpenAI SDK** | 2.43.0 | Groq API (LLaMA) integration |
| **python-dotenv** | 1.2.2 | Environment variable loading |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.7 | UI framework |
| **Vite** | 8.1.0 | Build tool & dev server |
| **React Router DOM** | 7.18.0 | Client-side routing |
| **Tailwind CSS** | 4.3.1 | Utility-first styling |
| **Axios** | 1.18.1 | HTTP client |
| **Lucide React** | 0.469.0 | Icon library |
| **OGL** | 1.0.11 | WebGL for LightRays background |
| **Headless UI** | 2.2.10 | Accessible UI primitives |

---

## 📂 Project Structure

```
BuildVerse/
├── .env                          # 🔒 Local secrets (never commit!)
├── .env.example                  # ✅ Safe template — copy to .env
├── .gitignore
├── manage.py
├── requirements.txt
│
├── buildverse_backend/           # Django project config
│   ├── settings.py               # Reads all secrets from .env
│   ├── urls.py
│   └── wsgi.py
│
├── accounts/                     # Auth: register, login, JWT
├── profiles/                     # User profiles & summary API
├── skills/                       # User skills management
├── projects/                     # Project CRUD & join requests
├── teams/                        # Team roster management
├── tasks/                        # Kanban task management
├── chats/                        # Team chat messages
├── documents/                    # Project documents
├── notifications/                # Notification system
├── ai_matching/                  # Groq LLaMA AI matching engine
├── reviews/                      # Peer review system
├── reputation/                   # Reputation scores
├── portfolio/                    # User portfolio entries
├── dashboard/                    # Dashboard stats API
├── activity/                     # Activity feed
├── search_app/                   # Developer search & filtering
│
└── frontend/                     # React + Vite frontend
    ├── public/
    └── src/
        ├── components/
        │   ├── LightRays.jsx     # ✨ WebGL light rays background
        │   ├── LightRays.css
        │   ├── Layout.jsx
        │   ├── ProtectedRoute.jsx
        │   └── Skeletons.jsx
        ├── layouts/
        │   └── DashboardLayout.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Projects.jsx
        │   ├── ProjectWorkspace.jsx
        │   ├── Teams.jsx
        │   ├── SearchDevelopers.jsx
        │   ├── AIMatching.jsx
        │   ├── Profile.jsx
        │   ├── PublicProfile.jsx
        │   └── Notifications.jsx
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/padmanabh-27/BuildVerse.git
cd BuildVerse
```

---

### 2. Backend Setup

#### Create & activate virtual environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Configure environment variables
```bash
# Copy the template
copy .env.example .env       # Windows
cp .env.example .env         # macOS/Linux
```

Edit `.env` and fill in your values:
```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True

DB_NAME=buildverse_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

GROQ_API_KEY=your-groq-api-key-here
```

> 💡 **Get a Groq API key** free at [console.groq.com](https://console.groq.com)

> 💡 **Generate a Django secret key**:
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

#### Create the PostgreSQL database
```sql
-- In pgAdmin or psql:
CREATE DATABASE buildverse_db;
```

#### Run migrations
```bash
python manage.py migrate
```

#### (Optional) Create a superuser
```bash
python manage.py createsuperuser
```

#### Start the backend server
```bash
python manage.py runserver
```
> Backend runs at: **http://127.0.0.1:8000**

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```
> Frontend runs at: **http://localhost:5173**

---

### 4. Open the App

Navigate to **http://localhost:5173** in your browser.

Register a new account and start building! 🚀

---

## 🚀 Running the Project

You need **two terminals running simultaneously**:

| Terminal | Directory | Command | URL |
|---|---|---|---|
| **Terminal 1** (Backend) | `BuildVerse/` | `python manage.py runserver` | http://127.0.0.1:8000 |
| **Terminal 2** (Frontend) | `BuildVerse/frontend/` | `npm run dev` | http://localhost:5173 |

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key (keep it secret!) |
| `DEBUG` | ✅ | `True` for development, `False` for production |
| `DB_NAME` | ✅ | PostgreSQL database name |
| `DB_USER` | ✅ | PostgreSQL username |
| `DB_PASSWORD` | ✅ | PostgreSQL password |
| `DB_HOST` | ✅ | Database host (usually `localhost`) |
| `DB_PORT` | ✅ | Database port (usually `5432`) |
| `GROQ_API_KEY` | ✅ | Groq API key for AI matching feature |

> ⚠️ **Never commit your `.env` file to Git.** It is already listed in `.gitignore`.

---

## 🌐 API Endpoints Overview

| Module | Endpoint | Description |
|---|---|---|
| Auth | `POST /api/register/` | Register new user |
| Auth | `POST /api/login/` | Login and get JWT tokens |
| Auth | `POST /api/token/refresh/` | Refresh access token |
| Profile | `GET/PUT /api/profile/details/` | Get or update own profile |
| Profile | `GET /api/profile/summary/` | Get profile summary with stats |
| Profile | `GET /api/profile/public/<id>/` | View any user's public profile |
| Skills | `GET/POST /api/skills/` | List or add skills |
| Skills | `DELETE /api/skills/<id>/` | Remove a skill |
| Projects | `GET/POST /api/projects/` | List or create projects |
| Projects | `GET/PUT/DELETE /api/projects/<id>/` | Manage a project |
| Projects | `POST /api/projects/<id>/join/` | Request to join project |
| Tasks | `GET/POST /api/tasks/project/<id>/` | Get or create tasks |
| Tasks | `PATCH /api/tasks/<id>/status/` | Update task status |
| Chat | `GET /api/chats/<id>/messages/` | Get chat messages |
| Chat | `POST /api/chats/<id>/send/` | Send a message |
| AI | `POST /api/ai-matching/match/` | Run AI team matcher |
| Reviews | `POST /api/reviews/` | Submit a review |
| Dashboard | `GET /api/dashboard/` | Get dashboard stats |
| Search | `GET /api/search/developers/` | Search developers |
| Notifications | `GET /api/notifications/` | Get notifications |

---

## 🎨 Design System

BuildVerse uses a **silver-spotlight dark theme**:

- **Background**: Deep charcoal `#0c0d12`
- **Accents**: Silver-slate (`#cbd5e1`, `#94a3b8`)
- **Typography**: Outfit + Plus Jakarta Sans (Google Fonts)
- **Effect**: Interactive WebGL LightRays background (white top-center spotlight, mouse-responsive)
- **Glass panels**: `backdrop-filter: blur(20px)` with subtle borders
- **Animations**: Fade-in, slide-up, pulse-glow micro-animations

---

## 🛡️ Security Notes

- All secrets are stored in `.env` (git-ignored)
- JWT tokens stored in `localStorage` on the frontend
- Django `SECRET_KEY` is loaded from environment — never hardcoded
- Database credentials loaded from environment
- CORS configured via `django-cors-headers`

---

## 📝 License

This project is for educational and portfolio purposes.

---

## 👨‍💻 Author

**Padmanabh** — [GitHub](https://github.com/padmanabh-27)

> Built with ❤️ using Django, React, PostgreSQL, and Groq AI
