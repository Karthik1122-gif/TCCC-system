const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

const isMockMode = () => process.env.USE_MOCK_DATA === 'true';
const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());

const buildCorsOptions = () => {
  if (corsOrigins.includes('*')) {
    return { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] };
  }

  return {
     origin: (origin, callback) => {
       // Allow server-to-server tools and local dev origins.
       if (!origin) return callback(null, true);
       if (corsOrigins.includes(origin)) return callback(null, true);
       if (/^https?:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
       return callback(new Error('Not allowed by CORS'));
     },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  };
};

const { Server } = require('socket.io');
const socketHandler = require('./socketHandler');

const io = new Server(server, {
  cors: buildCorsOptions()
});
socketHandler(io);

// Connect Database for production-like mode.
// In mock mode, API still runs without requiring MongoDB.
app.use(cors(buildCorsOptions()));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/signals', require('./routes/signalRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
  res.send('AmbulanceSync API is running...');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!isMockMode()) {
      try {
        await connectDB();
      } catch (error) {
        // Keep backend available even if Atlas is temporarily unreachable.
        console.error(`MongoDB unavailable (${error.message}). Falling back to mock mode.`);
        process.env.USE_MOCK_DATA = 'true';
      }
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Mode: ${isMockMode() ? 'mock' : 'atlas/db'}`);
    });
  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
