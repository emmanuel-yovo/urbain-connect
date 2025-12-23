import React, { useState, useEffect } from 'react';
import { Coordinates, Place } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { X, Star, MapPin, Sparkles, Navigation, Heart, CornerUpRight, ExternalLink } from 'lucide-react';
import { getPlaceInsights } from '../services/geminiService';
import { calculateDistance, formatDistance } from '../services/geoUtils';

interface PlaceDetailsProps {
  place: Place | null;
  onClose: () => void;
  userLocation: Coordinates | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onRoute: (target: Coordinates) => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ 
    place, 
    onClose, 
    userLocation, 
    isFavorite, 
    onToggleFavorite,
    onRoute
}) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);

  // Reset insight and calc distance when place changes
  useEffect(() => {
    setInsight(null);
    setLoadingAi(false);
    
    if (place && userLocation) {
        const dist = calculateDistance(userLocation, place.position);
        setDistance(formatDistance(dist));
    } else {
        setDistance(null);
    }
  }, [place, userLocation]);

  if (!place) return null;

  const config = CATEGORY_CONFIG[place.category];
  const Icon = config.icon;

  const handleAskAI = async () => {
    setLoadingAi(true);
    const result = await getPlaceInsights(place);
    setInsight(result);
    setLoadingAi(false);
  };
  
  const handleOpenGoogleMaps = () => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.position.lat},${place.position.lng}`;
      window.open(url, '_blank');
  };

  return (
    <div className="fixed z-[1000] bottom-0 left-0 right-0 md:right-0 md:left-auto md:top-0 md:bottom-auto md:h-full md:w-[400px] bg-white shadow-2xl rounded-t-3xl md:rounded-none md:rounded-l-3xl transform transition-transform duration-300 ease-in-out flex flex-col max-h-[85vh] md:max-h-full">
      {/* Header Image */}
      <div className="relative h-48 md:h-56 w-full shrink-0">
        <img 
          src={place.image} 
          alt={place.name} 
          className="w-full h-full object-cover rounded-t-3xl md:rounded-tl-3xl md:rounded-tr-none"
        />
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <X size={20} />
        </button>
        <div className="absolute bottom-4 left-4 flex gap-2">
           <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wider ${config.color}`}>
             {place.category}
           </span>
           {distance && (
               <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 shadow-sm flex items-center gap-1">
                   <Navigation size={10} />
                   {distance}
               </span>
           )}
        </div>
        
        <button 
            onClick={() => onToggleFavorite(place.id)}
            className="absolute -bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-105 transition-all z-10"
        >
            <Heart size={24} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 pt-8 overflow-y-auto flex-1">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight pr-4">{place.name}</h2>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold text-sm shrink-0">
            <Star size={14} className="fill-yellow-500 text-yellow-500 mr-1" />
            {place.rating}
          </div>
        </div>

        <div className="flex items-center text-slate-500 mb-6 text-sm">
          <MapPin size={16} className="mr-1 shrink-0" />
          <span className="truncate">{place.address}</span>
        </div>

        <p className="text-slate-600 leading-relaxed mb-6 text-sm">
          {place.description}
        </p>

        {/* AI Section */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" />
              Urban AI Insight
            </h3>
            {!insight && !loadingAi && (
              <button 
                onClick={handleAskAI}
                className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
              >
                Générer
              </button>
            )}
          </div>
          
          {loadingAi && (
            <div className="space-y-2 animate-pulse relative z-10">
              <div className="h-2 bg-slate-200 rounded w-3/4"></div>
              <div className="h-2 bg-slate-200 rounded w-1/2"></div>
            </div>
          )}

          {insight && (
            <div className="text-sm text-slate-700 italic border-l-2 border-purple-500 pl-3 relative z-10">
              "{insight}"
            </div>
          )}
          
          {/* Decorative background element */}
          <Sparkles className="absolute -bottom-4 -right-4 text-purple-100 w-24 h-24 rotate-12 z-0" />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button 
            onClick={() => onRoute(place.position)}
            disabled={!userLocation}
            className={`
                flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors
                ${userLocation 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
            title={!userLocation ? "Activez la localisation pour l'itinéraire" : ""}
          >
            <CornerUpRight size={18} />
            Itinéraire
          </button>
          
          <button 
            onClick={handleOpenGoogleMaps}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            <ExternalLink size={18} />
            Google Maps
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;