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
  Shirt,
  Map as MapIcon,
  Layers,
  Moon,
  Sun,
  Globe
} from 'lucide-react';

export interface CountryConfig {
  id: string;
  name: string;
  flag: string;
  coords: [number, number];
  zoom: number;
}

export const COUNTRIES: CountryConfig[] = [
  { id: 'fr', name: 'France', flag: '🇫🇷', coords: [46.2276, 2.2137], zoom: 6 },
  { id: 'ci', name: 'Côte d\'Ivoire', flag: '🇨🇮', coords: [7.54, -5.5471], zoom: 7 },
  { id: 'sn', name: 'Sénégal', flag: '🇸🇳', coords: [14.4974, -14.4524], zoom: 7 },
  { id: 'ma', name: 'Maroc', flag: '🇲🇦', coords: [31.7917, -7.0926], zoom: 6 },
  { id: 'cm', name: 'Cameroun', flag: '🇨🇲', coords: [7.3697, 12.3547], zoom: 7 },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', coords: [56.1304, -106.3468], zoom: 4 },
];

export const MAP_STYLES = [
  { 
    id: 'exploration', 
    label: 'Exploration', 
    icon: MapIcon,
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
  },
  { 
    id: 'light', 
    label: 'Clair', 
    icon: Sun,
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
  },
  { 
    id: 'dark', 
    label: 'Sombre', 
    icon: Moon,
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
  },
  { 
    id: 'satellite', 
    label: 'Satellite', 
    icon: Globe,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
  },
];

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

export const DEFAULT_CENTER: [number, number] = [46.2276, 2.2137];
export const DEFAULT_ZOOM = 6;