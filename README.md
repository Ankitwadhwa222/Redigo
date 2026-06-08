
# 🚗 RideShare Platform

A full-stack carpooling / ride-sharing platform where users can **publish rides**, **book rides**, and **manage their trips**.  
Built with a **MERN stack** (MongoDB, Express.js, React, Node.js) and integrated with **Google Places API** for location autocomplete.

---

## ✨ Features (Current Progress)
- 🔑 **Authentication** (JWT based) – secure login & signup.  
- 🚘 **Publish Ride** – drivers can add rides with details like from, to, date, time, price, seats, car info.  
- ✏️ **Edit Ride** – drivers can update their ride (auto-filled form on edit).  
- ❌ **Delete Ride** – rides are removed from both Ride collection & User’s ride list.  
- 📍 **Google Maps Autocomplete** for "from" & "to" fields.  
- 📊 **User Dashboard** – view all rides created by a user.  
- ⏱ **Timestamps** – rides have createdAt and updatedAt tracking.  

---

## 🛠 Tech Stack
**Frontend**
- React + Vite  
- TailwindCSS (custom components, no prebuilt UI lib)  
- Lucide Icons  

**Backend**
- Node.js + Express.js  
- MongoDB + Mongoose ODM  

**Other**
- JWT Authentication  
- Google Places API (Autocomplete + Place Details)  

---

## 📂 Project Structure
```
/client        → React frontend
/server        → Node.js + Express backend
  /models      → Mongoose schemas
  /controllers → Express route controllers
  /services    → Business logic layer
  /routes      → API routes
```

---

## 🚀 Setup & Installation

### 1️⃣ Clone Repo
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2️⃣ Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `server/`:
```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
```

Run backend:
```bash
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd client
npm install
```

Create `.env` file in `client/`:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_api_key
```

Run frontend:
```bash
npm run dev
```

---

## 🔗 API Endpoints (So Far)

### Rides
- `POST /api/rides/addRide` → Add new ride  
- `GET /api/rides/:rideId` → Get single ride  
- `PUT /api/rides/:rideId` → Update ride  
- `DELETE /api/rides/:rideId` → Delete ride (also removes from user profile)  

---

## 🧪 GitHub Actions CI

This repository includes a GitHub Actions workflow that runs on push and pull requests. It performs the following checks:
- Installs frontend dependencies, runs `npm run lint`, and builds the frontend (`redigoFrontend`).
- Installs backend dependencies (`Redigobackend`) and runs a lightweight dependency/audit check.

To enable CI on GitHub:
1. Commit and push the `.github/workflows/ci.yml` file to your repository.
2. On GitHub, verify the workflow runs on the Actions tab.
3. Add any required repository secrets (e.g., API keys, DB connection strings) under Settings → Secrets.

If you'd like, I can add deployment steps (e.g., to Heroku, Vercel, or Docker hub) next.

### Recommended CI enhancements (already applied)

- Node matrix: tests run on Node 18 and 20 to ensure compatibility.
- Caching: `node_modules` caching for faster builds.
- Conditional scripts: lint/test steps run only when scripts exist in `package.json`.
- Dependency review: PR-time dependency review via `github/dependency-review-action`.
- Docker build: optional Docker image build and push to GitHub Container Registry when `GHCR_PAT` secret is set.

### Badges
Add a CI badge to the top of this `README.md` by replacing `<owner>` and `<repo>` with your GitHub repository details:

`![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)`

### Required repository secrets
- `MONGO_URI` — MongoDB connection string (if you enable deploys that require DB).
- `JWT_SECRET` — JWT secret for production runs.
- `GHCR_PAT` — Personal access token with `write:packages` to push Docker images to GitHub Container Registry (optional).
- `VERCEL_TOKEN` or `HEROKU_API_KEY` — If you want automated deploys to Vercel/Heroku.

### Next steps I can take for you
- Add a `Dockerfile` for the backend and a small `Dockerfile` for the frontend (if you want containerized deploys).
- Add deployment workflows (Vercel, Heroku, or Kubernetes manifests).
- Add automated semantic versioning and changelog via `semantic-release`.

If you want any of these, tell me which target (Heroku, Vercel, or GHCR + k8s) you prefer and I'll implement it.

 