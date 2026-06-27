# 🚦 Advanced Emergency Response System (TCCC)

An advanced emergency traffic control and response system featuring real-time GPS tracking, automatic route recalculation, and intelligent traffic signal preemption for emergency vehicles (ambulances).

## 🚀 Key Features

* **🚑 Emergency Signal Preemption**: Traffic signals automatically turn **GREEN** and override normal cycle times when an emergency vehicle (ambulance) is within 500 meters.
* **⏰ Time-of-Day Traffic Patterns**: Realistic traffic congestion cycles adjusting signal wait times based on morning peaks, evening peaks, night mode, or normal daytime.
* **📍 Production-Grade GPS Tracking**: Continuous real-time GPS tracking via browser geolocation with automatic route recalculation if the ambulance deviates by more than 50 meters.
* **🗺️ Multi-Map Support**: Comprehensive guides for integrating Google Maps, Mappls (MapmyIndia), and built-in Leaflet (OpenStreetMap) tiles.
* **💬 Voice Assistant & Alarms**: Audio indicators, alarms, and voice integration to notify drivers of approaching traffic signals and safety alerts.

---

## 📁 Repository Structure

```
TCCC/
├── backend/                  # Node.js + Express Backend
│   ├── config/               # Database configurations
│   ├── controllers/          # Business logic controllers
│   ├── middleware/           # Express middlewares (JWT auth)
│   ├── models/               # MongoDB Mongoose models
│   ├── routes/               # Express routing
│   ├── server.js             # Express application entry
│   └── socketHandler.js      # Socket.io realtime coordination
│
├── frontend/                 # Vite + React Frontend
│   ├── src/
│   │   ├── components/       # Reusable React components (Maps, Finders)
│   │   ├── pages/            # View dashboards (Driver, Police, Control Center)
│   │   ├── store/            # Zustand state management
│   │   └── utils/            # Geolocation, signal control, algorithms
│   └── vite.config.js        # Vite compilation setup
│
├── IMPLEMENTATION_SUMMARY.md # Detailed implementation & testing checklist
└── MAP_API_INTEGRATION_GUIDE.md # Map provider configuration guide
```

---

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Set up your MongoDB connection and JWT secret in backend/.env
npm run dev # Runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev # Runs on http://localhost:5173
```

---

## 📝 Documentation
For deeper insights and manual verification checklists, check the following documents:
* [Implementation Summary](file:///c:/Users/banot/OneDrive/Desktop/TCCC/IMPLEMENTATION_SUMMARY.md) — Detailed feature breakdowns, architecture, and verification checklists.
* [Map API Integration Guide](file:///c:/Users/banot/OneDrive/Desktop/TCCC/MAP_API_INTEGRATION_GUIDE.md) — Instructions for setting up MapmyIndia, Google Maps, and OpenStreetMap.
