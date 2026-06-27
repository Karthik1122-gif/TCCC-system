/**
 * Real-Time GPS Tracking System with Auto-Recalculation
 * Features:
 * - High-accuracy GPS tracking with watchPosition
 * - Haversine distance calculation
 * - Automatic route recalculation when ambulance moves > 50m
 * - Error handling and fallback mechanisms
 * - Speed and heading tracking
 */

/**
 * Haversine Formula - Calculate distance between two GPS coordinates
 * Returns distance in kilometers
 */
export const calculateHaversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * GPS Error Codes and Messages
 */
export const GPS_ERRORS = {
  PERMISSION_DENIED: {
    code: 1,
    message: 'GPS permission denied. Please enable location access in your browser settings.',
    action: 'Enable GPS in Settings'
  },
  POSITION_UNAVAILABLE: {
    code: 2,
    message: 'GPS position unavailable. Check if location services are enabled on your device.',
    action: 'Check Device Settings'
  },
  TIMEOUT: {
    code: 3,
    message: 'GPS request timed out. Retrying...',
    action: 'Retrying Connection'
  },
  NOT_SUPPORTED: {
    code: 4,
    message: 'Geolocation is not supported by your browser.',
    action: 'Update Browser'
  }
};

/**
 * Real-Time GPS Tracker Class
 */
export class RealtimeGPSTracker {
  constructor(options = {}) {
    this.watchId = null;
    this.lastPosition = null;
    this.recalculationThreshold = options.recalculationThreshold || 50; // meters
    this.updateInterval = options.updateInterval || 2000; // ms
    this.enableHighAccuracy = options.enableHighAccuracy !== false;
    this.maxAge = options.maxAge || 5000;
    this.timeout = options.timeout || 10000;
    
    // Callbacks
    this.onLocationUpdate = options.onLocationUpdate || (() => {});
    this.onRouteRecalculation = options.onRouteRecalculation || (() => {});
    this.onError = options.onError || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    
    // State
    this.isTracking = false;
    this.errorCount = 0;
    this.totalDistance = 0;
    this.startTime = null;
  }
  
  /**
   * Start GPS tracking
   */
  start() {
    if (!navigator.geolocation) {
      this.handleError({
        code: GPS_ERRORS.NOT_SUPPORTED.code,
        message: GPS_ERRORS.NOT_SUPPORTED.message
      });
      return false;
    }
    
    if (this.isTracking) {
      console.warn('GPS tracking is already active');
      return true;
    }
    
    this.isTracking = true;
    this.startTime = Date.now();
    this.onStatusChange({ status: 'starting', message: 'Initializing GPS...' });
    
    // Request initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.handlePositionSuccess(position);
        this.onStatusChange({ status: 'active', message: 'GPS Tracking Active' });
      },
      (error) => {
        this.handleError(error);
      },
      {
        enableHighAccuracy: this.enableHighAccuracy,
        timeout: this.timeout,
        maximumAge: this.maxAge
      }
    );
    
    // Start continuous tracking
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.handlePositionSuccess(position);
      },
      (error) => {
        this.handleError(error);
      },
      {
        enableHighAccuracy: this.enableHighAccuracy,
        timeout: this.timeout,
        maximumAge: this.maxAge
      }
    );
    
    return true;
  }
  
  /**
   * Stop GPS tracking
   */
  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    this.isTracking = false;
    this.onStatusChange({ status: 'stopped', message: 'GPS Tracking Stopped' });
  }
  
  /**
   * Handle successful position update
   */
  handlePositionSuccess(position) {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;
    const timestamp = position.timestamp;
    
    const currentPosition = {
      lat: latitude,
      lng: longitude,
      accuracy: accuracy,
      speed: speed || 0, // m/s
      heading: heading || 0, // degrees
      timestamp: timestamp
    };
    
    // Reset error count on success
    this.errorCount = 0;
    
    // Check if we need to recalculate route
    let shouldRecalculate = false;
    let distanceMoved = 0;
    
    if (this.lastPosition) {
      distanceMoved = calculateHaversineDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        currentPosition.lat,
        currentPosition.lng
      ) * 1000; // Convert to meters
      
      this.totalDistance += distanceMoved;
      
      // Trigger recalculation if moved more than threshold
      if (distanceMoved > this.recalculationThreshold) {
        shouldRecalculate = true;
      }
    }
    
    // Update last position
    this.lastPosition = currentPosition;
    
    // Callbacks
    this.onLocationUpdate({
      position: currentPosition,
      distanceMoved: distanceMoved,
      totalDistance: this.totalDistance,
      uptime: Date.now() - this.startTime
    });
    
    if (shouldRecalculate) {
      this.onRouteRecalculation({
        position: currentPosition,
        reason: 'Distance threshold exceeded',
        distanceMoved: distanceMoved
      });
    }
  }
  
  /**
   * Handle GPS errors
   */
  handleError(error) {
    this.errorCount++;
    
    let errorInfo = {
      code: error.code,
      message: error.message,
      errorCount: this.errorCount
    };
    
    // Match with known error types
    switch (error.code) {
      case 1:
        errorInfo = { ...errorInfo, ...GPS_ERRORS.PERMISSION_DENIED };
        break;
      case 2:
        errorInfo = { ...errorInfo, ...GPS_ERRORS.POSITION_UNAVAILABLE };
        break;
      case 3:
        errorInfo = { ...errorInfo, ...GPS_ERRORS.TIMEOUT };
        break;
      default:
        errorInfo.action = 'Unknown Error';
    }
    
    this.onError(errorInfo);
    this.onStatusChange({ 
      status: 'error', 
      message: errorInfo.message,
      errorCount: this.errorCount
    });
    
    // Auto-stop after too many errors
    if (this.errorCount > 5) {
      this.stop();
      this.onStatusChange({ 
        status: 'failed', 
        message: 'GPS tracking failed after multiple attempts'
      });
    }
  }
  
  /**
   * Get current position snapshot
   */
  getCurrentPosition() {
    return this.lastPosition;
  }
  
  /**
   * Get tracking statistics
   */
  getStatistics() {
    return {
      isTracking: this.isTracking,
      totalDistance: this.totalDistance,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      errorCount: this.errorCount,
      lastPosition: this.lastPosition
    };
  }
  
  /**
   * Force route recalculation
   */
  forceRecalculation() {
    if (this.lastPosition) {
      this.onRouteRecalculation({
        position: this.lastPosition,
        reason: 'Manual trigger',
        distanceMoved: 0
      });
    }
  }
}

/**
 * Create GPS tracker with default settings
 */
export const createGPSTracker = (options) => {
  return new RealtimeGPSTracker(options);
};

/**
 * Check if browser supports high-accuracy GPS
 */
export const supportsHighAccuracyGPS = () => {
  return navigator.geolocation && 'watchPosition' in navigator.geolocation;
};

/**
 * Get optimal GPS settings based on device
 */
export const getOptimalGPSSettings = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return {
    enableHighAccuracy: true,
    timeout: isMobile ? 15000 : 10000,
    maximumAge: isMobile ? 3000 : 5000,
    recalculationThreshold: isMobile ? 30 : 50 // meters
  };
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  }
  return `${(distanceInMeters / 1000).toFixed(2)}km`;
};

/**
 * Format speed for display
 */
export const formatSpeed = (speedInMps) => {
  const speedInKmph = speedInMps * 3.6;
  return `${speedInKmph.toFixed(1)} km/h`;
};

/**
 * Calculate ETA based on distance and current speed
 */
export const calculateETA = (distanceInKm, speedInMps) => {
  if (!speedInMps || speedInMps < 0.5) {
    return null; // Speed too low to calculate
  }
  
  const speedInKmph = speedInMps * 3.6;
  const timeInHours = distanceInKm / speedInKmph;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  return timeInMinutes;
};
