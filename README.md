# StatusBoard

A full-stack web application for tracking and viewing daily status information. It features an authenticated data input grid (months × days) and a public calendar-based status viewer.

---

## Design Choices

### Frontend — React + Vite
- **React 18** was chosen for its component-based architecture, large ecosystem, and fast development cycle.
- **Vite** provides near-instant HMR (Hot Module Replacement) and fast builds compared to traditional bundlers like Webpack.
- **React Router** handles client-side routing to separate the public viewer, dashboard, login, and signup pages.
- **Tailwind CSS (via utility classes)** and **Radix UI primitives** give a clean, accessible, and responsive UI without heavy custom CSS.
- **react-day-picker** provides the calendar widget for the public viewer, handling all date logic (month lengths, leap years) out of the box.

### Backend — Node.js + Express
- **Express** is lightweight, well-documented, and ideal for building RESTful APIs quickly.
- **TypeScript** is used on both frontend and backend for type safety and better developer experience.
- **Zod** is used for request validation to ensure data integrity at the API boundary.

### Database — PostgreSQL + Prisma ORM
- **PostgreSQL** was chosen as a powerful, open-source SQL database with excellent reliability and feature support.
- **Prisma ORM** provides type-safe database access, auto-generated queries, and declarative schema management — eliminating raw SQL and reducing boilerplate.
- The schema uses two models: `User` (authentication) and `StatusData` (day statuses).
- Status entries are stored with a composite unique constraint on `userId` + `dataKey` (format: `year-month-day`) to prevent duplicates.
- Prisma's `$transaction` API is used for atomic bulk writes when updating status data.

### Authentication — JWT
- **JSON Web Tokens (JWT)** provide stateless authentication — no server-side session storage needed.
- Passwords are hashed with **bcrypt** (cost factor 12) before storage.
- Tokens expire after 7 days for security.
- Protected API routes use a `requireAuth` middleware that verifies the Bearer token.

### API Design
- RESTful API under `/api` with clear separation:
  - `/api/auth/signup` and `/api/auth/login` — authentication endpoints.
  - `/api/status/:userId` (GET/POST, authenticated) — read/write user's status data.
  - `/api/status/public/all` (GET, no auth) — public read access to all status data.

### Data Input Component
- Renders a table with **12 month columns** and **31 day rows**.
- Invalid days (e.g., Feb 30, Apr 31) are marked as "N/A" and disabled, with leap year support.
- Each valid cell has a dropdown to select a status (Available, Busy, Out of Office, Meeting, Travel, Vacation).
- Year selector allows navigating ±5 years from the current year.

### Day Status Viewer Component
- Publicly accessible (no login required) at the root URL (`/`).
- Uses a calendar widget to select any date and displays the status for that day with color-coded indicators.
- Authenticated users see an "Edit" button to navigate to the dashboard; guests see a prompt to sign in.

## Assumptions

- Each day can have a single status value (not multiple).
- All users' status data is shared publicly in the viewer (collaborative model).
- The status options are predefined (Available, Busy, Out of Office, Meeting, Travel, Vacation).
- PostgreSQL is available locally for development; the app can also connect to a remote PostgreSQL instance via the `DATABASE_URL` environment variable.
- The application is designed for modern browsers with JavaScript enabled.

---

## Prerequisites

- **Node.js** (version 16 or higher)
- **PostgreSQL** database server
- **Git**

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd statusboard
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/daystatus"
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Set up the database (applies Prisma migrations to create tables):

```bash
npx prisma migrate dev
```

Build and start the backend:

```bash
npm run build

# Development (with auto-restart on file changes)
npm run dev

# Or production
npm start
```

You can also inspect the database visually with:

```bash
npm run db:studio
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```
VITE_API_BASE_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

---

## Access the Application

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## Project Structure

```
statusboard/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components (Dashboard, PublicViewer, Login, etc.)
│   │   ├── lib/            # API client, utilities
│   │   └── App.tsx         # Routing and auth state
│   └── package.json
├── server/                 # Express backend (TypeScript)
│   ├── prisma/
│   │   ├── migrations/     # Auto-generated SQL migrations
│   │   └── schema.prisma   # Prisma schema (database models)
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── auth.ts         # JWT helpers and middleware
│   │   └── db.ts           # Prisma client instance
│   └── package.json
└── README.md
```
