# Lumenlearn — Full-Stack LMS Platform

A complete, working Learning Management System built with React (Vite), Tailwind CSS, Node.js/Express, and MongoDB. Students can browse and enroll in courses, watch lectures, take quizzes, track progress, earn certificates, and leave reviews. Instructors can create and manage courses and see student/revenue stats.

## Stack

- **Frontend:** Vite, React, React Router, Redux Toolkit, Axios, Tailwind CSS, Framer Motion, React Hook Form, React Player, react-hot-toast
- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT auth, bcryptjs, Multer + Cloudinary, Nodemailer, express-validator, Helmet, CORS, rate limiting

## Project structure

```
lms-platform/
├── client/     # React frontend (Vite)
└── server/     # Express API + MongoDB models
```

## Prerequisites

- Node.js 18+
- A MongoDB database (local `mongod`, or a free MongoDB Atlas cluster)
- (Optional, for file uploads) A Cloudinary account
- (Optional, for emails) SMTP credentials, e.g. a Gmail App Password

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set at minimum:

```
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=some_long_random_string
JWT_REFRESH_SECRET=a_different_long_random_string
```

Cloudinary and SMTP variables are optional for local development — file upload routes and emails will simply fail gracefully (logged to console) if left as placeholders, so you can build/run the rest of the app without them.

Seed the database with sample instructors, students, courses, quizzes, enrollments, and reviews:

```bash
npm run seed
```

This creates:
- 5 instructors: `instructor1@lms.com` … `instructor5@lms.com` (password: `password123`)
- 20 students: `student1@lms.com` … `student20@lms.com` (password: `password123`)
- 1 admin: `admin@lms.com` (password: `admin123`)
- 12 published courses across 6 categories, each with a quiz
- Random enrollments, progress, and reviews for the seeded students

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`, health check at `GET /api/health`.

## 2. Frontend setup

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the backend (see `vite.config.js`), so no separate `VITE_API_URL` env variable is needed for local dev.

Log in with any of the seeded accounts above, or register a new account (choose "student" or "instructor" at signup).

## API overview

All endpoints are prefixed with `/api`.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/update-profile`, `PUT /auth/change-password`, `POST /auth/forgot-password`, `PUT /auth/reset-password/:token` |
| Courses | `GET /courses`, `GET /courses/:id`, `POST /courses`, `PUT /courses/:id`, `DELETE /courses/:id`, `POST /courses/:id/lessons`, `PUT /courses/:id/lessons/:lessonId`, `DELETE /courses/:id/lessons/:lessonId`, `GET /courses/instructor/:id` |
| Enrollments | `POST /enrollments`, `GET /enrollments/user/:userId`, `GET /enrollments/course/:courseId`, `PUT /enrollments/:id/progress`, `DELETE /enrollments/:id` |
| Progress | `GET /progress/:userId/:courseId`, `PUT /progress/:userId/:courseId`, `POST /progress/complete-lecture`, `GET /progress/:userId` |
| Quizzes | `GET /quizzes/course/:courseId`, `POST /quizzes`, `POST /quizzes/:id/submit`, `GET /quizzes/:id/results` |
| Reviews | `POST /reviews`, `GET /reviews/course/:courseId`, `PUT /reviews/:id`, `DELETE /reviews/:id` |
| Users | `GET /users/:id`, `GET /users` (admin), `POST /users/wishlist/:courseId`, `GET /users/wishlist`, `PUT /users/:id/deactivate` (admin) |

Auth uses a Bearer JWT (`Authorization: Bearer <token>`), issued on register/login (7-day expiry by default, configurable via `JWT_EXPIRE`). Course/quiz-authoring routes are restricted to `instructor`/`admin` roles via the `authorize()` middleware.

Certificates are issued automatically: when a student's `completedLectures` reach 100% of a course's lectures, the progress controller creates a `Certificate` document, marks progress as `certificateIssued`, and sends a notification email.

## What's implemented vs. simplified

**Fully implemented end-to-end:** registration/login/JWT auth, password reset flow, course CRUD with sections/lectures, search/filter/sort/pagination, enrollment, lecture completion + automatic progress percentage + automatic certificate issuance, quiz taking with scoring and time limits, reviews with auto-recalculated course ratings, wishlist, instructor dashboard with course management and revenue estimates, student dashboard with in-progress/completed views.

**Simplified for this build** (clearly marked in code, straightforward to extend):
- File uploads: Multer + Cloudinary middleware is wired up and ready (`middleware/upload.js`), but the actual "upload thumbnail/video" UI forms in the instructor dashboard aren't built — the create-course form takes a title/description/price and you'd add file inputs calling those existing endpoints.
- Certificate PDF rendering (React PDF) and a dedicated "View certificate" page aren't included — certificates exist as database records with verification codes; add a `/certificates/:id` page that fetches and renders one when needed.
- Refresh-token rotation: both access and refresh tokens are issued, but the client only stores/uses the access token. Add an axios response interceptor that calls a `/auth/refresh` endpoint (not yet implemented server-side) to silently renew expired sessions.
- Admin analytics dashboard isn't built (the `admin` role and its authorization checks exist throughout the API).

## Deployment notes

- **Frontend:** Deploy `client/` to Vercel/Netlify. Set the build command to `npm run build`, output directory `dist`. Since the app currently relies on Vite's dev-server proxy for `/api`, add an environment-aware base URL in `src/services/api.js` (e.g. `baseURL: import.meta.env.VITE_API_URL || '/api'`) and set `VITE_API_URL` to your deployed API's URL.
- **Backend:** Deploy `server/` to Render/Railway. Set all `.env` variables in the host's dashboard, and set `CLIENT_URL` to your deployed frontend's URL (used for CORS and password-reset links).
- **Database:** Use MongoDB Atlas; set `MONGODB_URI` to your Atlas connection string with a database user scoped to that database.
