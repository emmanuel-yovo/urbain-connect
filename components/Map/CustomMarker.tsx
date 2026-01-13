import React, { useMemo } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Place } from '../../types';
import { CATEGORY_CONFIG } from '../../constants';
import { Heart, Sparkles } from 'lucide-react';

const createCustomIcon = (place: Place, isFavorite: boolean) => {
  const config = CATEGORY_CONFIG[place.category] || Object.values(CATEGORY_CONFIG)[0];
  const IconComponent = config.icon;
  const colorClass = config.color; 
  
  const iconSvgString = renderToStaticMarkup(
    <IconComponent 
      size={18} 
      strokeWidth={2.5} 
      className="text-white" 
    />
  );

  const boostBadge = place.isBoosted ? `
    <div class="absolute -top-2 -right-4 z-40 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-white uppercase tracking-tighter">
      Boosté
    </div>
  ` : '';
  
  const html = `
    <div class="custom-marker-pin-wrapper relative w-12 h-12 flex items-center justify-center group cursor-pointer hover:z-[1000]">
      ${boostBadge}
      
      <!-- Épingle -->
      <div class="absolute w-9 h-9 ${colorClass} rounded-full rounded-br-none transform rotate-45 border-[2px] border-white shadow-xl z-10 transition-transform duration-200 group-hover:scale-110 origin-center mb-2"></div>
      
      <!-- Icône -->
      <div class="absolute z-20 mb-2 drop-shadow-md opacity-95">
         ${iconSvgString}
      </div>

      <!-- Label -->
      <div class="marker-name-label absolute top-full -mt-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-slate-700 whitespace-nowrap z-40 transition-opacity">
        ${place.name}
      </div>
    </div>
  `;
  
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -38],
  });
};

interface CustomMarkerProps {
  place: Place;
  onClick: (place: Place) => void;
  isFavorite: boolean;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ place, onClick, isFavorite }) => {
  const map = useMap();
  const icon = useMemo(() => createCustomIcon(place, isFavorite), [place.name, place.category, isFavorite, place.isBoosted]);

  return (
    <Marker 
      position={[place.position.lat, place.position.lng]} 
      icon={icon}
      eventHandlers={{
        click: () => {
            onClick(place);
            map.flyTo([place.position.lat, place.position.lng], 16, { duration: 1.0 });
        },
      }}
    />
  );
};

export default CustomMarker;