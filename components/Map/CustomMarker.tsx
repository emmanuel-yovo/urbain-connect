import React, { useMemo } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Place } from '../../types';
import { CATEGORY_CONFIG } from '../../constants';
import { Heart } from 'lucide-react';

// Fonction pour générer le HTML de l'icône personnalisée
const createCustomIcon = (place: Place, isFavorite: boolean) => {
  // Récupération de la config visuelle (Icône + Couleur) basée sur la catégorie du lieu
  const config = CATEGORY_CONFIG[place.category] || Object.values(CATEGORY_CONFIG)[0];
  const IconComponent = config.icon;
  const colorClass = config.color; 
  
  // Rendu de l'icône Lucide en string SVG
  const iconSvgString = renderToStaticMarkup(
    <IconComponent 
      size={20} 
      strokeWidth={2.5} 
      className="text-white" 
    />
  );

  const heartIconString = renderToStaticMarkup(
    <Heart size={10} fill="currentColor" className="text-white" />
  );
  
  // HTML du marqueur : Forme "Goutte" (Pin)
  // La div colorée (absolute w-9 h-9) utilise 'colorClass' définie dans constants.ts
  const html = `
    <div class="custom-marker-pin-wrapper relative w-12 h-12 flex items-center justify-center group cursor-pointer hover:z-[1000]">
      
      <!-- L'Épingle (Fond coloré) -->
      <div class="absolute w-10 h-10 ${colorClass} rounded-full rounded-br-none transform rotate-45 border-[2px] border-white shadow-xl z-10 transition-transform duration-200 group-hover:scale-110 origin-center mb-3"></div>
      
      <!-- L'Icône (Centrée sur l'épingle) -->
      <div class="absolute z-20 mb-3 drop-shadow-md opacity-95">
         ${iconSvgString}
      </div>

      <!-- Badge Favori (si actif) -->
      ${isFavorite ? `
      <div class="absolute top-0 right-0 z-30 bg-yellow-400 text-white rounded-full p-1.5 border-2 border-white shadow-sm flex items-center justify-center">
         ${heartIconString}
      </div>
      ` : ''}

      <!-- Label du nom (Affiché au survol ou selon zoom) -->
      <div class="marker-name-label absolute top-full -mt-1 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap z-40 transition-opacity">
        ${place.name}
      </div>
    </div>
  `;
  
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: html,
    iconSize: [48, 48],
    iconAnchor: [24, 46], // La pointe de l'épingle touche la carte
    popupAnchor: [0, -46],
  });
};

interface CustomMarkerProps {
  place: Place;
  onClick: (place: Place) => void;
  isFavorite: boolean;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ place, onClick, isFavorite }) => {
  const map = useMap();

  const icon = useMemo(() => createCustomIcon(place, isFavorite), [place.name, place.category, isFavorite]);

  return (
    <Marker 
      position={[place.position.lat, place.position.lng]} 
      icon={icon}
      eventHandlers={{
        click: () => {
            onClick(place);
            map.flyTo([place.position.lat, place.position.lng], 16, {
                duration: 1.0,
                easeLinearity: 0.25
            });
        },
      }}
    />
  );
};

export default CustomMarker;