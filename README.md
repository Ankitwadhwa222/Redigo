
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

 