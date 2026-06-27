# Backend and Frontend Separation (MongoDB Atlas)

This project is already split into separate apps:
- Backend: `TCCC/backend`
- Frontend: `TCCC/frontend`

## 1) Backend setup (Atlas)

1. Open `backend/.env`
2. Set:
   - `USE_MOCK_DATA=false`
   - `MONGODB_URI=<your mongodb atlas connection string>`
   - `JWT_SECRET=<strong random secret>`
   - `CORS_ORIGIN=http://localhost:5173`

## 2) Run backend only

```powershell
cd C:\Users\kotap\Downloads\TCCC\TCCC\backend
npm install
npm run dev
```

Backend API stays the same:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/ai/hospital-rank`
- `GET/POST /api/signals/*`

## 3) Run frontend separately

```powershell
cd C:\Users\kotap\Downloads\TCCC\TCCC\frontend
npm install
npm run dev
```

Ensure `frontend/.env` has:
- `VITE_API_URL=http://localhost:5000`

## 4) Optional mock mode

If you want backend without Atlas temporarily:
- Set `USE_MOCK_DATA=true` in `backend/.env`

In mock mode, routes and response structure are preserved.

Note:
- This backend now uses only one environment file: `backend/.env`
