import { create } from 'zustand';
import { io } from 'socket.io-client';
import useAuthStore from './useAuthStore';

const useSocketStore = create((set, get) => ({
  socket: null,
  activeAmbulances: {},
  alarms: [],
  officerSignalRequests: [],
  isConnected: false,

  connectSocket: () => {
    const { user } = useAuthStore.getState();
    if (!user || !user.token) return;

    if (get().socket) {
      get().socket.disconnect();
    }

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: user.token
      }
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('ambulance_location_update', (data) => {
      set((state) => ({
        activeAmbulances: {
          ...state.activeAmbulances,
          [data.driverId]: data
        }
      }));
    });

    socket.on('emergency_alarm', (data) => {
      set((state) => ({
        alarms: [...state.alarms, data]
      }));
      // trigger browser audio alarm logic here later 
    });

    socket.on('officer_signal_request', (data) => {
      set((state) => ({
        officerSignalRequests: [data, ...state.officerSignalRequests].slice(0, 100)
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, activeAmbulances: {}, alarms: [], officerSignalRequests: [] });
    }
  },

  emitLocationUpdate: (locationData) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('update_location', locationData);
    }
  },

  emitTriggerAlarm: (alarmData) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('trigger_alarm', alarmData);
    }
  },

  emitOfficerSignalRequest: (requestData) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('request_officer_signal_override', requestData);
    }
  }
}));

export default useSocketStore;
