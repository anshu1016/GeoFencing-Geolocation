import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useCallback } from 'react';

const MapClickHandler = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      if (e.latlng) {
        setPosition(e.latlng);
      }
    },
  });

  return null;
};

const DraggableMarker = ({ position, onClickReturn }) => {
  const [originalPosition, setOriginalPosition] = useState(position);

  const handleClick = () => {
    onClickReturn();
  };

  useEffect(() => {
    if (position) {
      setOriginalPosition(position);
    }
  }, [position]);

  return (
    <>
      {position && (
        <Marker position={position}>
          <Popup>
            You are here. <br /> Click the icon to return.
          </Popup>
        </Marker>
      )}
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'white',
          border: 'none',
          padding: '10px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        My Location
      </button>
    </>
  );
};

const Map = () => {
  const [currentPos, setCurrentPos] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    async function getPositions() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentPos(pos);
            setMarkerPosition(pos);
          },
          function (error) {
            console.error('Error fetching location:', error);
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    }
    getPositions();
  }, []);

  const returnToOriginalPosition = useCallback(() => {
    const originalPos = JSON.parse(localStorage.getItem('originalPosition'));
    if (originalPos) {
      setMarkerPosition(originalPos);
    }
  }, []);

  if (currentPos.latitude === 0 && currentPos.longitude === 0) {
    return <div>Error: Unable to fetch location.</div>;
  }

  return (
    <div className="h-screen max-w-[50%] relative flex items-center bg-red-500 border border-y-red-500">
      <MapContainer
        center={[currentPos.latitude, currentPos.longitude]}
        zoom={11}
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
        <MapClickHandler setPosition={setMarkerPosition} />
        <DraggableMarker
          position={markerPosition}
          onClickReturn={returnToOriginalPosition}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
