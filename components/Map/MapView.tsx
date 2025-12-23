import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Polyline, CircleMarker, Popup, Marker } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { Place, Coordinates } from '../../types';
import { MAP_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../constants';
import CustomMarker from './CustomMarker';
import { MapPin, Plus } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  userLocation: Coordinates | null;
  onMarkerClick: (place: Place) => void;
  mapStyle: string;
  onCenterChange?: (coords: Coordinates) => void;
  favorites: string[];
  route: { start: Coordinates; end: Coordinates } | null;
  // New props for Click-to-Add
  onMapClick?: (coords: Coordinates) => void;
  tempLocation?: Coordinates | null;
  onAddPlaceAtLocation?: () => void;
  // Trigger when user interacts (pans/zooms)
  onMapInteraction?: () => void;
}

const ZOOM_THRESHOLD_LABELS = 15;

//--- Helper Components ---

const LocationFlyTo: React.FC<{ coords: Coordinates | null }> = ({ coords }) => {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (coords && !hasCenteredRef.current) {
         map.flyTo([coords.lat, coords.lng], 16, { duration: 1.5 });
         hasCenteredRef.current = true;
    } else if (!coords) {
      hasCenteredRef.current = false;
    }
  }, [coords, map]);
  
  return null;
};

const MapEventsHandler: React.FC<{ 
    onCenterChange?: (coords: Coordinates) => void;
    onMapClick?: (coords: Coordinates) => void; 
    onMapInteraction?: () => void;
}> = ({ onCenterChange, onMapClick, onMapInteraction }) => {
  const map = useMap();

  const updateMapClasses = useCallback(() => {
    const z = map.getZoom();
    const container = map.getContainer();
    
    if (z < ZOOM_THRESHOLD_LABELS) container.classList.add('hide-labels');
    else container.classList.remove('hide-labels');

    container.classList.remove('map-zoom-low', 'map-zoom-med', 'map-zoom-high');
    if (z < 13) container.classList.add('map-zoom-low');
    else if (z >= 13 && z < 16) container.classList.add('map-zoom-med');
    else container.classList.add('map-zoom-high');
  }, [map]);

  useMapEvents({
    zoomend: updateMapClasses,
    moveend: () => {
      if (onCenterChange) {
        const center = map.getCenter();
        onCenterChange({ lat: center.lat, lng: center.lng });
      }
    },
    dragstart: () => {
        if (onMapInteraction) onMapInteraction();
    },
    zoomstart: () => {
        if (onMapInteraction) onMapInteraction();
    },
    load: () => {
       updateMapClasses();
       if (onCenterChange) {
         const center = map.getCenter();
         onCenterChange({ lat: center.lat, lng: center.lng });
       }
    },
    click: (e) => {
        if (onMapClick) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
    }
  });
  
  useEffect(() => {
     updateMapClasses();
  }, [map, updateMapClasses]);

  return null;
};

const ZoomDisplay = () => {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  useMapEvents({
    zoom: (e) => setZoom(e.target.getZoom()),
    zoomend: (e) => setZoom(e.target.getZoom())
  });

  return (
    <div className="absolute bottom-6 left-4 z-[400] pointer-events-none">
      <div className="bg-white/90 backdrop-blur-md text-slate-700 px-3 py-1.5 rounded-lg shadow-lg border border-slate-100 text-xs font-bold font-mono flex items-center gap-2">
        <span>ZOOM:</span>
        <span className="text-blue-600">{zoom.toFixed(1)}</span>
      </div>
    </div>
  );
};

//--- Main Component ---

const MapView: React.FC<MapViewProps> = ({ 
    places, 
    userLocation, 
    onMarkerClick, 
    mapStyle, 
    onCenterChange, 
    favorites, 
    route,
    onMapClick,
    tempLocation,
    onAddPlaceAtLocation,
    onMapInteraction
}) => {
  
  // Create a temporary "New Place" icon
  const tempMarkerIcon = useMemo(() => {
    const iconHtml = renderToStaticMarkup(
        <div className="relative w-10 h-10 flex items-center justify-center -translate-x-[1px] -translate-y-[13px]">
            <MapPin size={40} className="text-slate-500 drop-shadow-lg fill-white" />
            <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-800 rounded-full animate-pulse"></div>
        </div>
    );
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
  }, []);

  // Ref to automatically open popup when tempLocation changes
  const tempMarkerRef = useRef<L.Marker>(null);
  
  useEffect(() => {
      if (tempLocation && tempMarkerRef.current) {
          tempMarkerRef.current.openPopup();
      }
  }, [tempLocation]);

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
            onMapClick={onMapClick}
            onMapInteraction={onMapInteraction}
        />
        <ZoomDisplay />

        {/* Route Polyline */}
        {route && (
            <Polyline 
                positions={[[route.start.lat, route.start.lng], [route.end.lat, route.end.lng]]}
                pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.7, dashArray: '10, 10', lineCap: 'round' }}
            />
        )}

        {/* Existing Places */}
        {places.map((place) => (
          <CustomMarker 
            key={place.id} 
            place={place} 
            onClick={onMarkerClick}
            isFavorite={favorites.includes(place.id)}
          />
        ))}

        {/* Temporary "Dropped Pin" for adding new place */}
        {tempLocation && (
            <Marker
                ref={tempMarkerRef}
                position={[tempLocation.lat, tempLocation.lng]}
                icon={tempMarkerIcon}
            >
                <Popup minWidth={160} closeButton={false} className="custom-popup-clean">
                    <div className="text-center p-1 font-sans">
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Lieu sélectionné</p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent map click
                                if(onAddPlaceAtLocation) onAddPlaceAtLocation();
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow hover:bg-slate-800 transition-colors"
                        >
                            <Plus size={14} />
                            Ajouter ce lieu
                        </button>
                    </div>
                </Popup>
            </Marker>
        )}

        {/* User Location */}
        {userLocation && (
           <>
            <CircleMarker 
              center={[userLocation.lat, userLocation.lng]}
              radius={8}
              pathOptions={{ fillColor: '#2563eb', color: '#ffffff', weight: 2, fillOpacity: 1 }}
            >
               <Popup>Vous êtes ici</Popup>
            </CircleMarker>
            <CircleMarker 
              center={[userLocation.lat, userLocation.lng]}
              radius={24}
              pathOptions={{ fillColor: '#2563eb', color: 'transparent', weight: 0, fillOpacity: 0.15 }}
            />
           </>
        )}
        
        <LocationFlyTo coords={userLocation} />
        
      </MapContainer>
    </div>
  );
};

export default MapView;