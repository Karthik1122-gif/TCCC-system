import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createAmbulanceIcon = () => {
  return L.divIcon({
    html: `<div style="width: 30px; height: 30px; background: radial-gradient(circle, #ef4444 0%, #b91c1c 100%); border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(239,68,68,0.8); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚑</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'ambulance-icon'
  });
};

const PoliceMap = ({ activeAmbulances }) => {
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  const ambulances = useMemo(() => Object.values(activeAmbulances || {}), [activeAmbulances]);

  const center = useMemo(() => {
    if (ambulances.length === 0) return [17.436, 78.444];
    const first = ambulances[0]?.location;
    return first ? [first.lat, first.lng] : [17.436, 78.444];
  }, [ambulances]);

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden" style={{ border: '2px solid #60a5fa', boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        {/* CartoDB Voyager - Best for Hyderabad with all small areas */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          maxZoom={20}
          minZoom={10}
        />

        {ambulances.map((amb) => (
          <Marker
            key={amb.driverId}
            position={[amb.location.lat, amb.location.lng]}
            icon={createAmbulanceIcon()}
            eventHandlers={{
              click: () => setSelectedAmbulance(amb),
            }}
          >
            <Popup>
              <div className="w-56 rounded-lg p-3 text-white" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
                <div className="font-bold text-center px-2 py-1 mb-2 rounded text-xs uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                  🚑 Active Ambulance
                </div>
                <p className="font-bold text-base mb-1">{amb.driverName}</p>
                <p className="text-blue-200 text-xs mb-2">{amb.vehicleNumber}</p>
                <div className="space-y-1 text-xs">
                  <p>📍 Lat: {amb.location.lat.toFixed(5)}</p>
                  <p>📍 Lng: {amb.location.lng.toFixed(5)}</p>
                  <p>⚡ Speed: {(amb.location.speed ? amb.location.speed * 3.6 : 0).toFixed(1)} km/h</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PoliceMap;
