import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { Place, Coordinates } from '../../types';
import { MAP_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../constants';
import CustomMarker from './CustomMarker';

interface MapViewProps {
  places: Place[];
  userLocation: Coordinates | null;
  selectedCountryCoords: [number, number];
  selectedCountryZoom: number;
  onMarkerClick: (place: Place) => void;
  mapStyle: string;
  onCenterChange?: (coords: Coordinates) => void;
  favorites: string[];
  route: { start: Coordinates; end: Coordinates } | null;
  onMapInteraction?: () => void;
}

// Handler pour gérer les mouvements de caméra
const ViewHandler: React.FC<{ 
  countryCoords: [number, number], 
  countryZoom: number,
  userLocation: Coordinates | null 
}> = ({ countryCoords, countryZoom, userLocation }) => {
  const map = useMap();
  const prevCountryRef = useRef<string>("");
  const prevUserLocRef = useRef<string>("");

  // Effet pour le changement de pays
  useEffect(() => {
    const countryKey = `${countryCoords[0]}-${countryCoords[1]}`;
    if (countryKey !== prevCountryRef.current) {
      map.flyTo(countryCoords, countryZoom, { 
        duration: 2.5,
        easeLinearity: 0.1
      });
      prevCountryRef.current = countryKey;
    }
  }, [countryCoords, countryZoom, map]);

  // Effet pour le zoom automatique sur la position utilisateur (quand le bouton est pressé)
  useEffect(() => {
    if (userLocation) {
      const userKey = `${userLocation.lat}-${userLocation.lng}`;
      if (userKey !== prevUserLocRef.current) {
        map.flyTo([userLocation.lat, userLocation.lng], 16, {
          duration: 1.5,
          easeLinearity: 0.2
        });
        prevUserLocRef.current = userKey;
      }
    }
  }, [userLocation, map]);
  
  return null;
};

const MapEventsHandler: React.FC<{ 
    onCenterChange?: (coords: Coordinates) => void;
    onMapInteraction?: () => void;
}> = ({ onCenterChange, onMapInteraction }) => {
  const map = useMap();

  useMapEvents({
    moveend: () => {
      if (onCenterChange) {
        const center = map.getCenter();
        onCenterChange({ lat: center.lat, lng: center.lng });
      }
    },
    dragstart: () => onMapInteraction?.(),
    zoomstart: () => onMapInteraction?.()
  });
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ 
    places, 
    userLocation, 
    selectedCountryCoords,
    selectedCountryZoom,
    onMarkerClick, 
    mapStyle, 
    onCenterChange, 
    favorites, 
    route,
    onMapInteraction
}) => {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution={MAP_ATTRIBUTION}
          url={mapStyle}
          maxZoom={20}
        />

        <MapEventsHandler 
            onCenterChange={onCenterChange} 
            onMapInteraction={onMapInteraction}
        />

        {route && (
            <Polyline 
                positions={[[route.start.lat, route.start.lng], [route.end.lat, route.end.lng]]}
                pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
            />
        )}

        {places.map((place) => (
          <CustomMarker 
            key={place.id} 
            place={place} 
            onClick={onMarkerClick}
            isFavorite={favorites.includes(place.id)}
          />
        ))}

        {userLocation && (
           <>
            <CircleMarker 
              center={[userLocation.lat, userLocation.lng]}
              radius={8}
              pathOptions={{ fillColor: '#2563eb', color: '#ffffff', weight: 2, fillOpacity: 1 }}
            >
               <Popup>Ma position</Popup>
            </CircleMarker>
            <CircleMarker 
              center={[userLocation.lat, userLocation.lng]}
              radius={24}
              pathOptions={{ fillColor: '#2563eb', color: 'transparent', weight: 0, fillOpacity: 0.15 }}
            />
           </>
        )}
        
        <ViewHandler 
          countryCoords={selectedCountryCoords} 
          countryZoom={selectedCountryZoom}
          userLocation={userLocation}
        />
        
      </MapContainer>
    </div>
  );
};

export default MapView;