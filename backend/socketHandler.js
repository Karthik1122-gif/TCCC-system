const jwt = require('jsonwebtoken');
const User = require('./models/User');

const useMockData = () => process.env.USE_MOCK_DATA === 'true';

const socketHandler = (io) => {
  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;

      if (useMockData()) {
        user = {
          _id: decoded.id,
          name: 'Test User',
          role: 'driver',
          vehicleNumber: 'TS09',
          junctionLocation: 'Banjara Hills'
        };
      } else {
        user = await User.findById(decoded.id).lean();
      }

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    // Drivers join 'drivers' room, Police join 'police' room 
    // AND police can join specific zones/junctions if needed
    if (socket.user.role === 'driver') {
      socket.join('drivers');
    } else if (socket.user.role === 'police') {
      socket.join('police');
      if (socket.user.junctionLocation) {
         socket.join(`junction_${socket.user.junctionLocation}`);
      }
    }

    // Driver emits their current location continuously
    socket.on('update_location', (data) => {
      // data: { lat, lng, speed, heading, activeIncident }
      
      // Broadcast to all police dashboards
      io.to('police').emit('ambulance_location_update', {
        driverId: socket.user._id,
        driverName: socket.user.name,
        vehicleNumber: socket.user.vehicleNumber,
        location: data,
        timestamp: new Date()
      });
      
      // Also broadcast to specific junction if necessary
      // (This logic can be expanded using geo queries or client-side distance calcs)
    });

    // Alert specific junction about approaching ambulance
    socket.on('trigger_alarm', (data) => {
      // data: { junctionId, eta }
      io.to(`junction_${data.junctionId}`).emit('emergency_alarm', {
        driverId: socket.user._id,
        eta: data.eta,
        message: `Ambulance approaching ${data.junctionName}. ETA: ${data.eta} mins.`
      });
    });

    // Driver can request manual officer intervention for officer-operated signals.
    socket.on('request_officer_signal_override', (data = {}) => {
      if (socket.user.role !== 'driver') {
        return;
      }

      const requestPayload = {
        requestId: `${socket.user._id}_${Date.now()}_${data.signalId || 'unknown'}`,
        type: 'officer_signal_request',
        signalId: data.signalId,
        junctionName: data.junctionName || 'Unknown Junction',
        junctionLocation: data.junctionLocation || null,
        ambulanceLocation: data.ambulanceLocation || null,
        eta: data.eta || null,
        note: data.note || 'Ambulance requesting manual green signal',
        driverId: socket.user._id,
        driverName: socket.user.name,
        vehicleNumber: socket.user.vehicleNumber,
        timestamp: new Date()
      };

      io.to('police').emit('officer_signal_request', requestPayload);

      if (data.junctionId) {
        io.to(`junction_${data.junctionId}`).emit('officer_signal_request', requestPayload);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = socketHandler;
