import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import * as turf from '@turf/turf';

const LocationMarker = () => {
  const [initialPosition, setInitialPosition] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [circle, setCircle] = useState(null);

  const map = useMap();

  useEffect(() => {
    // Options for geolocation
    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 1800000, // 30 minutes cache
      timeout: 10000, // Timeout after 10 seconds
    };

    // Fetch the user's initial location
    const getInitialPosition = () => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const initialCoords = [longitude, latitude];

          // Set initial position
          setInitialPosition(initialCoords);

          // Create a 500m radius circle around initial location
          const turfCircle = turf.circle(initialCoords, 0.115, {
            units: 'kilometers',
          });
          setCircle(turfCircle);

          // Pan map to initial position
          map.flyTo([latitude, longitude], map.getZoom());
        },
        error => {
          console.error('Error fetching initial location:', error);
        },
        geoOptions
      );
    };

    // Live tracking for current position
    const watcher = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newCoords = {
          lat: latitude,
          lng: longitude,
        };

        // Update current position for live tracking
        setCurrentPosition(newCoords);

        // Log new coordinates for live tracking
        console.log('New coordinates: ', newCoords);

        // Pan map to the new position
        map.flyTo([latitude, longitude], map.getZoom());
      },
      error => {
        console.error('Error tracking position:', error);
      },
      geoOptions
    );

    // Initial position on component mount
    getInitialPosition();

    // Cleanup the watcher on component unmount
    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [map]);

  return (
    <>
      {currentPosition && (
        <Marker position={currentPosition}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {/* Render the GeoJSON circle created by Turf.js */}
      {circle && <GeoJSON data={circle} />}
    </>
  );
};

const Map = () => {
  return (
    <div className="h-screen max-w-[50%] relative flex items-center bg-red-500 border border-y-red-500">
      <MapContainer
        center={{ lat: 51.505, lng: -0.09 }}
        zoom={50}
        scrollWheelZoom={false}
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default Map;
