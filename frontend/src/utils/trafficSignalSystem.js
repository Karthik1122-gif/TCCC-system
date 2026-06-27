/**
 * Advanced Traffic Signal Management System
 * Features:
 * - Time-of-day cycle patterns (peak hours, off-peak, night)
 * - Emergency preemption (forces GREEN within 500m of ambulance)
 * - Dynamic routing weights based on signal timings
 */

import { calculateDistance } from './routeCalculator';
import { HYDERABAD_SIGNALS } from './hyderabadData';

const STANDARD_RED_TIME_SECONDS = 59;
const STANDARD_YELLOW_TIME_SECONDS = 3;
const STANDARD_GREEN_TIME_SECONDS = 59;

// Time-of-day cycle patterns
const TIME_PATTERNS = {
  // Morning Peak: 7 AM - 10 AM
  MORNING_PEAK: {
    startHour: 7,
    endHour: 10,
    redMultiplier: 1.3,    // 30% longer red times
    greenMultiplier: 1.1,  // 10% longer green times
    yellowMultiplier: 1.0
  },
  // Evening Peak: 5 PM - 9 PM
  EVENING_PEAK: {
    startHour: 17,
    endHour: 21,
    redMultiplier: 1.4,    // 40% longer red times
    greenMultiplier: 1.2,  // 20% longer green times
    yellowMultiplier: 1.0
  },
  // Night: 10 PM - 6 AM
  NIGHT: {
    startHour: 22,
    endHour: 6,
    redMultiplier: 0.7,    // 30% shorter red times
    greenMultiplier: 0.8,  // 20% shorter green times
    yellowMultiplier: 1.0
  },
  // Normal: Default multipliers
  NORMAL: {
    redMultiplier: 1.0,
    greenMultiplier: 1.0,
    yellowMultiplier: 1.0
  }
};

/**
 * Get current time pattern based on hour of day
 */
export const getCurrentTimePattern = () => {
  const hour = new Date().getHours();
  
  // Morning peak
  if (hour >= TIME_PATTERNS.MORNING_PEAK.startHour && 
      hour < TIME_PATTERNS.MORNING_PEAK.endHour) {
    return TIME_PATTERNS.MORNING_PEAK;
  }
  
  // Evening peak
  if (hour >= TIME_PATTERNS.EVENING_PEAK.startHour && 
      hour < TIME_PATTERNS.EVENING_PEAK.endHour) {
    return TIME_PATTERNS.EVENING_PEAK;
  }
  
  // Night
  if (hour >= TIME_PATTERNS.NIGHT.startHour || 
      hour < TIME_PATTERNS.NIGHT.endHour) {
    return TIME_PATTERNS.NIGHT;
  }
  
  // Normal hours
  return TIME_PATTERNS.NORMAL;
};

/**
 * Emergency Preemption System
 * Forces traffic signals to GREEN when ambulance is within 500m
 */
export const applyEmergencyPreemption = (signal, ambulanceLocation, options = {}) => {
  if (!ambulanceLocation) {
    return null; // No preemption
  }
  
  const distance = calculateDistance(
    ambulanceLocation.lat,
    ambulanceLocation.lng,
    signal.location.lat,
    signal.location.lng
  ) * 1000; // Convert to meters
  
  const preemptionThreshold = options.preemptionThreshold || 500; // 500 meters default
  
  if (distance <= preemptionThreshold) {
    // EMERGENCY PREEMPTION ACTIVATED
    return {
      isPreempted: true,
      color: 'green',
      text: '🚑 EMERGENCY PREEMPTION',
      waitTime: 0,
      preemptionDistance: Math.floor(distance),
      nextChangeIn: 60, // Hold green for 60 seconds
      emergencyMode: true
    };
  }
  
  return null; // No preemption needed
};

/**
 * Enhanced Signal Status with Time-of-Day and Emergency Preemption
 */
export const getEnhancedSignalStatus = (signal, options = {}) => {
  const { 
    timestampMs = Date.now(), 
    side = 'N',
    ambulanceLocation = null,
    preemptionEnabled = true
  } = options;
  
  // Check for emergency preemption first
  if (preemptionEnabled && ambulanceLocation) {
    const preemption = applyEmergencyPreemption(signal, ambulanceLocation, options);
    if (preemption) {
      return { ...preemption, side };
    }
  }
  
  // Standardized cycle requested for route signal behavior.
  const timePattern = getCurrentTimePattern();
  const redTime = STANDARD_RED_TIME_SECONDS;
  const yellowTime = STANDARD_YELLOW_TIME_SECONDS;
  const greenTime = STANDARD_GREEN_TIME_SECONDS;
  const cycleTime = redTime + yellowTime + greenTime;
  
  const initialState = signal.currentState || signal.status || 'red';
  
  // Start each signal at its configured initial state
  const stateStartOffset =
    initialState === 'green' ? redTime :
    initialState === 'yellow' ? redTime + greenTime :
    0;
  
  // Deterministic junction-specific seed
  const idSeed = (signal.id || 'signal').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const baseOffset = idSeed % cycleTime;
  
  // Per-side offset (four-way junction)
  const sideOffsets = {
    N: 0,
    E: Math.floor(cycleTime * 0.25),
    S: Math.floor(cycleTime * 0.5),
    W: Math.floor(cycleTime * 0.75)
  };
  const sideOffset = sideOffsets[side] || 0;
  
  const elapsedSeconds = Math.floor(timestampMs / 1000);
  const inCycle = (elapsedSeconds + baseOffset + sideOffset + stateStartOffset) % cycleTime;
  
  // Determine current state
  if (inCycle < redTime) {
    return {
      color: 'red',
      text: 'Stop',
      waitTime: redTime - inCycle,
      side,
      nextChangeIn: redTime - inCycle,
      emergencyMode: false,
      timePattern: getPatternName(timePattern)
    };
  }
  
  if (inCycle < redTime + greenTime) {
    const remaining = redTime + greenTime - inCycle;
    return {
      color: 'green',
      text: 'Clear',
      waitTime: 0,
      side,
      nextChangeIn: remaining,
      emergencyMode: false,
      timePattern: getPatternName(timePattern)
    };
  }
  
  const remaining = cycleTime - inCycle;
  return {
    color: 'yellow',
    text: 'Caution',
    waitTime: remaining,
    side,
    nextChangeIn: remaining,
    emergencyMode: false,
    timePattern: getPatternName(timePattern)
  };
};

/**
 * Calculate routing weight based on signal wait times
 * Lower weight = better route
 */
export const calculateSignalRoutingWeight = (signalsOnRoute, ambulanceLocation, currentTime) => {
  let totalWeight = 0;
  
  signalsOnRoute.forEach(signal => {
    const status = getEnhancedSignalStatus(signal, {
      timestampMs: currentTime,
      ambulanceLocation,
      preemptionEnabled: true
    });
    
    // Add wait time to route weight
    if (status.emergencyMode) {
      totalWeight += 0; // Preempted signals have no wait
    } else if (status.color === 'red') {
      totalWeight += status.waitTime * 1.5; // Red signals heavily penalize route
    } else if (status.color === 'yellow') {
      totalWeight += status.waitTime * 0.5; // Yellow signals slightly penalize
    }
    // Green signals add no weight
  });
  
  return totalWeight;
};

/**
 * Find best route considering signal timings
 */
export const findOptimalRoute = (routes, ambulanceLocation) => {
  if (!routes || routes.length === 0) return null;
  
  const currentTime = Date.now();
  
  const scoredRoutes = routes.map(route => {
    const signalWeight = calculateSignalRoutingWeight(
      route.signalsOnRoute || [],
      ambulanceLocation,
      currentTime
    );
    
    // Combined score: distance + signal wait time
    const totalScore = route.distance * 60 + signalWeight; // Distance in seconds + wait time
    
    return {
      ...route,
      signalWeight,
      totalScore
    };
  });
  
  // Sort by total score (lowest is best)
  scoredRoutes.sort((a, b) => a.totalScore - b.totalScore);
  
  return scoredRoutes;
};

/**
 * Get pattern name for display
 */
const getPatternName = (pattern) => {
  if (pattern === TIME_PATTERNS.MORNING_PEAK) return 'Morning Peak';
  if (pattern === TIME_PATTERNS.EVENING_PEAK) return 'Evening Peak';
  if (pattern === TIME_PATTERNS.NIGHT) return 'Night Mode';
  return 'Normal';
};

/**
 * Get all signals within preemption range
 */
export const getSignalsInPreemptionRange = (ambulanceLocation, signals = HYDERABAD_SIGNALS, threshold = 500) => {
  if (!ambulanceLocation) return [];
  
  return signals
    .map(signal => {
      const distance = calculateDistance(
        ambulanceLocation.lat,
        ambulanceLocation.lng,
        signal.location.lat,
        signal.location.lng
      ) * 1000; // Convert to meters
      
      return {
        ...signal,
        distanceToAmbulance: Math.floor(distance)
      };
    })
    .filter(signal => signal.distanceToAmbulance <= threshold)
    .sort((a, b) => a.distanceToAmbulance - b.distanceToAmbulance);
};
