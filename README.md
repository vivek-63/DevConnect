# DevConnect — Developer Social Networking Platform

DevConnect is a full-stack, developer-focused social networking platform built with the modern JavaScript ecosystem. It enables software engineers to showcase projects, share technical posts, connect with other developers, exchange direct messages in real time, and receive instant interactive notifications.

---

## 🚀 Features

### 1. Authentication & Security
- **Secure Register & Login:** Bcrypt hashed passwords with JWT authentication stored in HTTP-only cookies.
- **Persistent Sessions:** State rehydration via `/getMe` ensures sessions survive page refresh.
- **Route Protection:** Protected routes guard authenticated pages and redirect unauthorized traffic.

### 2. Developer Profiles
- **Comprehensive Profile:** Bio, avatar, college, designation/role, skills tags, GitHub and LinkedIn links.
- **Public Profile:** Inspect other developers' profiles, their showcased projects, published posts, and follower counts.
- **Profile Customization:** Seamless inline profile editor that synchronizes state immediately across the UI.
- **One-Click Share:** Copy profile link to clipboard with visual feedback.

### 3. Posts & Community Feed
- **Rich Developer Feed:** Displays community posts ordered by recency with author badges and timestamps.
- **Post Creation:** Inline feed post creator with character counter and optional cover image previews.
- **Full Post Management:** Edit and delete own posts with cascade database cleanup.
- **Dedicated Post View:** Dedicated permalinks (`/posts/:id`) with lazy comments, likes, and back navigation.

### 4. Interactive Like & Comment System
- **Optimistic Likes:** Heart animations with instant counter updates and compound unique constraint enforcement (`userId_postId`) to prevent duplicate likes.
- **Discussion Threads:** Inline comment section with lazy-loaded comments, real-time comment author details, and owner comment deletion.

### 5. Follow & Networking System
- **Follow / Unfollow:** Connect with fellow developers with instant follower/following counter reflection.
- **Developer Suggestions:** Sidebar and search widget highlighting community developers to follow.

### 6. Real-Time Notifications
- **Socket.IO Powered:** Instant notifications pushed for post likes, comments, and new followers without reloading.
- **Interactive Notification Bell:** Unread badge, dropdown panel, mark individual/all as read, and delete notifications.

### 7. Search & Discovery
- **Multi-Entity Search:** Search across developers, posts, and projects by keyword, skills, designation, or college.
- **Filter Tabs:** Tabbed search views for People, Posts, and Projects.

### 8. Projects Showcase
- **Portfolio Showcase:** Display open-source projects with live demo URLs, GitHub links, and tech stack tags.
- **Explore & Manage:** Switch between Explore All and My Projects.

### 9. Real-Time Direct Messaging
- **Conversation Hub:** One-on-one developer chat powered by Socket.IO and PostgreSQL.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19, Vite
- **Routing:** React Router v7
- **Styling:** TailwindCSS v4 with clean, developer-focused styling
- **Icons:** React Icons (`react-icons`), Lucide React (`lucide-react`)
- **HTTP Client:** Axios (configured with credentials and baseURL)
- **Real-Time:** Socket.IO Client

### Backend
- **Runtime:** Node.js
- **Server Framework:** Express.js 5
- **ORM:** Prisma Client
- **Database:** PostgreSQL
- **Security:** Helmet, Cookie-Parser, Bcrypt, JsonWebToken, Express-Rate-Limit
- **Real-Time Engine:** Socket.IO Server

---

## 📁 Architecture Overview

```text
DevConnect/
├── server/
│   ├── prisma/
│   │   └── schema.prisma         # Database models (User, Post, Like, Comment, Follow, Notification, Conversation, Message, Project)
│   ├── src/
│   │   ├── config/               # Database and environment configurations
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/          # JWT auth, rate limiters, validation, error handlers
│   │   ├── routes/               # API endpoints
│   │   ├── socket/               # Real-time user registry & Socket.IO handlers
│   │   ├── utils/                # Notification & AppError utilities
│   │   └── validators/           # Joi input schemas
│   ├── app.js                    # Express application configuration
│   └── server.js                 # HTTP server + Socket.IO initialization
│
└── vite-project/
    ├── src/
    │   ├── components/           # Reusable UI components (Navbar, Sidebar, PostCard, ProjectCard, SuggestedUsers)
    │   ├── context/              # AuthContext & NotificationContext
    │   ├── hooks/                # useAuth, useNotification
    │   ├── pages/                # Home/Feed, Profile, PublicProfile, EditProfile, Projects, Chat, Search, Posts
    │   ├── services/             # Axios API service integrations
    │   ├── socket/               # Socket.IO client instance
    │   ├── App.jsx               # Route definitions
    │   └── main.jsx              # React DOM bootstrap
    └── vite.config.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL running locally or remotely

### 1. Backend Setup
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Configure environment variables in .env
# DATABASE_URL="postgresql://<user>:<password>@localhost:5432/DevConnect"
# JWT_SECRET="your_secure_secret_key"

# Run Prisma migrations / generate client
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
# Server will run on http://localhost:8080
```

### 2. Frontend Setup
```bash
# Navigate to the vite-project folder
cd vite-project

# Install dependencies
npm install

# Start the Vite development server
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🌐 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register a new developer account | No |
| POST | `/login` | Authenticate and issue HTTP-only cookie | No |
| POST | `/logout` | Clear cookie and invalidate session | No |
| GET | `/getMe` | Fetch authenticated user data & counts | Yes |
| GET | `/profile` | Fetch complete profile of current user | Yes |
| GET | `/profile/:username` | Fetch public profile by username | Optional |
| PUT | `/profile/edit` | Update profile information and skills | Yes |
| GET | `/users/suggested` | Fetch suggested developers to follow | Optional |
| GET | `/feed` | Fetch community posts feed | Optional |
| POST | `/posts` | Create a new post | Yes |
| GET | `/posts/:id` | Fetch single post with comments & likes | Optional |
| PUT | `/posts/:id` | Update a post (owner only) | Yes |
| DELETE | `/posts/:id` | Delete a post and related records | Yes |
| POST | `/posts/:id/like` | Like a post | Yes |
| DELETE | `/posts/:id/unlike`| Unlike a post | Yes |
| GET | `/posts/:id/comments` | Fetch comments for a post | Optional |
| POST | `/posts/:id/comments` | Add a comment to a post | Yes |
| DELETE | `/comments/:id` | Delete a comment (owner only) | Yes |
| POST | `/follow/:id` | Follow a developer | Yes |
| DELETE | `/follow/:id` | Unfollow a developer | Yes |
| GET | `/notifications` | Fetch notifications & unread count | Yes |
| PATCH | `/notifications/read` | Mark all notifications as read | Yes |
| GET | `/search?q=...` | Global search across users, posts, projects | Optional |
| GET | `/projects/explore` | Fetch all public projects | Optional |
| POST | `/user/projects` | Showcase a new project | Yes |

---


