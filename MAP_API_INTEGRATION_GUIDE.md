# 🗺️ Map API Integration Guide for Hyderabad Ambulance System

This guide provides step-by-step instructions to integrate accurate maps with detailed place names and streets for Hyderabad.

---

## Option 1: **Mappls (MapmyIndia)** - RECOMMENDED for India 🇮🇳

**Best for:** Hyderabad, India-specific POIs, Detailed Indian addresses

### Step 1: Get API Key

1. Visit [https://apis.mappls.com/console/](https://apis.mappls.com/console/)
2. Click **"Sign Up"** (or login if you have an account)
3. Complete registration with email, name, and company details
4. After login, go to **"API Keys"** → **"Create New Key"**
5. Fill in:
   - **App Name:** Hyderabad Ambulance TCCC
   - **Bundle ID:** com.ambulance.hyderabad
6. Copy your **REST API Key** and **MAP SDK Key**

### Step 2: Install Mappls SDK

```bash
npm install mappls-web-maps
```

### Step 3: Integration Code

Create `src/utils/mapConfig.js`:

```javascript
// Mappls Configuration
export const MAPPLS_CONFIG = {
  restApiKey: 'YOUR_MAPPLS_REST_API_KEY', // Replace with your key
  mapSdkKey: 'YOUR_MAPPLS_MAP_SDK_KEY',   // Replace with your key
  version: '3.0',
  region: 'india'
};
```

Create `src/components/MapplsMap.jsx`:

```javascript
import { useEffect, useRef } from 'react';
import { MAPPLS_CONFIG } from '../utils/mapConfig';

const MapplsMap = ({ currentLocation, destinationLocation, onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Mappls script
    const script = document.createElement('script');
    script.src = `https://apis.mappls.com/advancedmaps/api/${MAPPLS_CONFIG.mapSdkKey}/map_sdk?layer=vector&v=${MAPPLS_CONFIG.version}`;
    script.async = true;
    script.onload = initializeMap;
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!window.mappls || !mapContainerRef.current) return;

    // Initialize Mappls Map
    mapRef.current = new window.mappls.Map(mapContainerRef.current, {
      center: currentLocation 
        ? [currentLocation.lat, currentLocation.lng] 
        : [17.436, 78.444], // Hyderabad center
      zoom: 14,
      zoomControl: true,
      location: true, // Shows current location
      search: true,   // Search box
      traffic: true,  // Traffic layer
      clickableIcons: true
    });

    onMapReady?.(mapRef.current);
  };

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add ambulance marker
    if (currentLocation) {
      const ambulanceMarker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat: currentLocation.lat, lng: currentLocation.lng },
        icon: 'https://apis.mappls.com/map_v3/1.png', // Custom icon
        title: 'Ambulance Location'
      });
      markersRef.current.push(ambulanceMarker);
    }

    // Add destination marker
    if (destinationLocation) {
      const destMarker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat: destinationLocation.lat, lng: destinationLocation.lng },
        icon: 'https://apis.mappls.com/map_v3/2.png',
        title: 'Hospital Destination'
      });
      markersRef.current.push(destMarker);
    }
  }, [currentLocation, destinationLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    />
  );
};

export default MapplsMap;
```

### Step 4: Routing with Mappls

```javascript
// In routeCalculator.js - Add Mappls routing
export const fetchMapplsRoute = async (start, end) => {
  const { restApiKey } = MAPPLS_CONFIG;
  
  const url = `https://apis.mappls.com/advancedmaps/v1/${restApiKey}/route_adv/driving/${start.lng},${start.lat};${end.lng},${end.lat}?alternatives=true`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return data.routes.map((route, index) => ({
        path: route.geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] })),
        distance: route.distance / 1000, // km
        duration: route.duration / 60,   // minutes
        label: \`Route \${index + 1}\`
      }));
    }
  } catch (error) {
    console.error('Mappls routing error:', error);
  }
  
  return [];
};
```

---

## Option 2: **Google Maps** - Universal High Quality

**Best for:** Global coverage, Business locations, Real-time traffic

### Step 1: Get API Key

1. Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create a new project: **"Hyderabad Ambulance System"**
3. Go to **APIs & Services** → **Library**
4. Enable these APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Places API**
   - **Geocoding API**
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy your API key
7. **Restrict the key:**
   - Application restrictions: **HTTP referrers**
   - Add: `http://localhost:*`, `https://yourdomain.com/*`
   - API restrictions: Select the 4 APIs above

### Step 2: Install Google Maps React

```bash
npm install @react-google-maps/api
```

### Step 3: Integration Code

Create `src/utils/mapConfig.js`:

```javascript
export const GOOGLE_MAPS_CONFIG = {
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your key
  libraries: ['places', 'geometry', 'directions']
};
```

Create `src/components/GoogleMapComponent.jsx`:

```javascript
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useCallback } from 'react';
import { GOOGLE_MAPS_CONFIG } from '../utils/mapConfig';

const GoogleMapComponent = ({ currentLocation, destinationLocation }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);

  const center = currentLocation || { lat: 17.436, lng: 78.444 };

  const mapStyles = {
    height: '100%',
    width: '100%',
    minHeight: '500px'
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Calculate route when both locations available
  useEffect(() => {
    if (!currentLocation || !destinationLocation || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: currentLocation,
        destination: destinationLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true // Get 3 alternative routes
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        }
      }
    );
  }, [currentLocation, destinationLocation]);

  return (
    <LoadScript 
      googleMapsApiKey={GOOGLE_MAPS_CONFIG.apiKey}
      libraries={GOOGLE_MAPS_CONFIG.libraries}
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={14}
        center={center}
        onLoad={onLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [] // Add custom styles here
        }}
      >
        {/* Ambulance Marker */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/512/3448/3448653.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            title="Ambulance Location"
          />
        )}

        {/* Hospital Marker */}
        {destinationLocation && (
          <Marker
            position={destinationLocation}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/512/3004/3004016.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            title="Hospital Destination"
          />
        )}

        {/* Route Polylines */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#60a5fa',
                strokeWeight: 5
              }
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
```

---

## Option 3: **OpenStreetMap (Free)** - No API Key Required

**Best for:** No cost, Open source, Good coverage

### Step 1: No API Key Needed!

OpenStreetMap is free and requires no API key.

### Step 2: Already Implemented!

Your current implementation uses **CartoDB Voyager tiles** (OpenStreetMap based), which provides excellent label quality.

### Step 3: Enhance Current Implementation

Current code in `DriverMap.jsx` is already optimized:

```javascript
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  attribution='&copy; OpenStreetMap contributors &copy; CARTO'
  maxZoom={20}
  minZoom={10}
  subdomains={['a', 'b', 'c', 'd']}
/>
```

**To add even more details, stack additional layers:**

```javascript
{/* Base Map */}
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  maxZoom={20}
/>

{/* Labels Overlay for Enhanced Readability */}
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
  maxZoom={20}
  pane="overlayPane"
/>

{/* Optional: Traffic Layer (requires Stadia Maps API - free tier) */}
<TileLayer
  url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
  maxZoom={20}
  opacity={0.5}
/>
```

---

## 📊 Comparison Table

| Feature | Mappls (MapmyIndia) | Google Maps | OpenStreetMap |
|---------|-------------------|-------------|---------------|
| **Cost** | Free tier: 10K requests/month | Free tier: $200 credit/month | Completely Free |
| **India Coverage** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good | ⭐⭐⭐ Good |
| **Hyderabad Details** | Native street names, landmarks | English names, POIs | Mixed quality |
| **Real-time Traffic** | ✅ Yes | ✅ Yes | ❌ No |
| **API Key Required** | ✅ Yes | ✅ Yes | ❌ No |
| **Routing Quality** | ⭐⭐⭐⭐⭐ Best for India | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good (OSRM) |
| **Setup Complexity** | Medium | Medium | Easy |

---

## 🎯 Recommendation

**For Production (Hyderabad):** Use **Mappls (MapmyIndia)**  
- Native Indian street names
- Best accuracy for Hyderabad addresses
- Free tier sufficient for testing

**For Development:** Continue with **OpenStreetMap (Current)**  
- No API key needed
- Good enough for testing
- Already implemented

**For Global Deployment:** Use **Google Maps**  
- Universal coverage
- Familiar interface
- Premium features

---

## 🔧 Quick Switch Instructions

### To switch to Mappls:

1. Get API keys from [https://apis.mappls.com/console/](https://apis.mappls.com/console/)
2. Replace `DriverMap.jsx` import with `MapplsMap.jsx`
3. Update routing in `routeCalculator.js` to use `fetchMapplsRoute()`

### To switch to Google Maps:

1. Get API key from Google Cloud Console
2. Replace `DriverMap.jsx` import with `GoogleMapComponent.jsx`  
3. Use Google Directions API for routing

### To keep OpenStreetMap (Current):

No changes needed! Your current implementation is already optimal.

---

## 🆘 Troubleshooting

**Issue:** "API key invalid"  
**Solution:** Check API key restrictions, ensure domain is whitelisted

**Issue:** "Quota exceeded"  
**Solution:** Monitor usage in console, upgrade plan if needed

**Issue:** "Map not loading"  
**Solution:** Check browser console for errors, verify network connectivity

**Issue:** "Poor label quality"  
**Solution:** Increase zoom level, use higher quality tile providers

---

## 📞 Support

- **Mappls:** [support@mappls.com](mailto:support@mappls.com)
- **Google Maps:** [Cloud Console Support](https://cloud.google.com/support)
- **OpenStreetMap:** [Community Forum](https://community.openstreetmap.org/)
