# DigitalTwin

DigitalTwin is a hackathon MVP for building a behavior-aware personal digital twin. The app combines onboarding signals, public career integrations, backend scoring, and a Flask AI engine to generate a personalized dashboard for health, finance, career, wellness, and daily intelligence.

## What It Does

- Authenticates users with email/password and JWT.
- Guides users through onboarding for priorities, lifestyle, finances, and integrations.
- Verifies public GitHub and LeetCode profiles where possible.
- Stores LinkedIn as an unverified career signal for the MVP.
- Generates adaptive dashboard analytics from onboarding data.
- Uses threshold intelligence to show green, orange, or red states for healthy, warning, or critical patterns.
- Separates AI insights from adaptive recommendations:
  - AI Insights explain what the system understands about the user.
  - Adaptive Recommendations suggest what the user should do next.
- Connects a Node.js backend to a Flask AI engine for burnout, productivity, and correlation analysis, with rule-based fallback logic.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT
- AI Engine: Flask, scikit-learn, pandas, numpy
- Integrations: GitHub public API, LeetCode public/GraphQL endpoints, LinkedIn profile-link signal

## Project Structure

```text
Digital Twin/
├── client/      # React frontend
├── server/      # Express API, MongoDB models, auth, onboarding, dashboard logic
└── ai-engine/   # Flask AI prediction and correlation service
```

## Workflow

1. User signs up or logs in.
2. Signup redirects to onboarding.
3. Onboarding collects behavior, finance, lifestyle, and integration signals.
4. Backend saves the onboarding profile and calls the Flask AI engine.
5. If the AI engine is unavailable, backend rule-based scoring creates fallback analytics.
6. Dashboard fetches `/api/dashboard` for personalized analytics, insights, recommendations, charts, streak state, and integration intelligence.
7. The UI adapts colors and content based on calculated user thresholds.

## Local Setup

### 1. Backend

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

The backend runs on `http://localhost:5000`.

### 2. AI Engine

```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

The AI engine runs on `http://localhost:5050`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Environment Variables

Real secrets should stay only in local `.env` files. This repo includes `.env.example` templates only.

Backend examples:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lifetwin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FLASK_AI_URL=http://localhost:5050
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

AI engine examples:

```env
FLASK_PORT=5050
SECRET_KEY=your-secret-key-change-in-production
NODE_BACKEND_URL=http://localhost:5000
```

## Core API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/onboarding`
- `GET /api/dashboard`
- `POST /api/daily-goals/complete`
- `GET /api/integrations/github/:username`
- `GET /api/integrations/leetcode/:username`
- `POST /api/integrations/linkedin`

## Security Notes

- `.env`, dependency folders, build output, virtual environments, caches, and logs are ignored.
- JWT is required for onboarding, dashboard, daily goal, and integration routes.
- Dashboard data is user-scoped.
- Passwords are hashed and never returned in API responses.
- LinkedIn is not verified through OAuth in this MVP; it is stored as a profile-link signal only.
