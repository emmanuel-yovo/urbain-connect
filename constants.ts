import { CategoryType } from './types';
import { 
  Ticket,
  Utensils, 
  ShoppingBasket, 
  Scissors, 
  UserCheck, 
  Bus, 
  Smartphone, 
  Bed,
  Landmark,
  HeartPulse,
  Croissant,
  Printer,
  Fuel,
  Wrench,
  Shirt
} from 'lucide-react';

export const MAP_STYLES = [
  { 
    id: 'carto-voyager', 
    label: 'Exploration (Moderne)', 
    // Style "Voyager" : Très coloré mais pastel, idéal pour le tourisme, ressemble à Google Maps
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
  },
  { 
    id: 'carto-light', 
    label: 'Épuré (Clair)', 
    // Style "Positron" : Très blanc/gris, idéal pour faire ressortir les données
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
  },
  { 
    id: 'carto-dark', 
    label: 'Mode Sombre', 
    // Style "Dark Matter" : Contraste fort, look "Tech"
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
  },
  { 
    id: 'esri-satellite', 
    label: 'Satellite', 
    // Imagerie Satellite haute qualité
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
  },
];

// On utilise CartoDB Voyager par défaut pour un look très propre et lisible
export const MAP_TILE_LAYER = MAP_STYLES[0].url;
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const CATEGORY_CONFIG: Record<CategoryType, { icon: any, color: string, label: string }> = {
  [CategoryType.LEISURE]: { icon: Ticket, color: 'bg-purple-500', label: 'Loisirs & Tourisme' },
  [CategoryType.RESTAURANT]: { icon: Utensils, color: 'bg-red-500', label: 'Restaurants' },
  [CategoryType.MARKET]: { icon: ShoppingBasket, color: 'bg-emerald-500', label: 'Marchés' },
  
  [CategoryType.HOTEL]: { icon: Bed, color: 'bg-indigo-500', label: 'Hôtels' },
  [CategoryType.WORSHIP]: { icon: Landmark, color: 'bg-slate-500', label: 'Lieux de Culte' },
  [CategoryType.HEALTH]: { icon: HeartPulse, color: 'bg-rose-600', label: 'Santé' },
  [CategoryType.BAKERY]: { icon: Croissant, color: 'bg-amber-500', label: 'Boulangeries' },
  [CategoryType.CYBERCAFE]: { icon: Printer, color: 'bg-cyan-600', label: 'Cybercafés' },
  [CategoryType.GAS]: { icon: Fuel, color: 'bg-gray-600', label: 'Stations' },
  [CategoryType.REPAIR]: { icon: Wrench, color: 'bg-stone-500', label: 'Réparation' },
  [CategoryType.DRY_CLEANING]: { icon: Shirt, color: 'bg-teal-500', label: 'Pressing' },

  [CategoryType.SEWING]: { icon: Scissors, color: 'bg-pink-500', label: 'Couture' },
  [CategoryType.HAIR]: { icon: UserCheck, color: 'bg-yellow-500', label: 'Coiffure' },
  [CategoryType.BUS]: { icon: Bus, color: 'bg-blue-500', label: 'Bus' },
  [CategoryType.MOBILE]: { icon: Smartphone, color: 'bg-violet-600', label: 'Opérateurs' },
};

export const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522]; // Paris
export const DEFAULT_ZOOM = 13;