export enum CategoryType {
  RESTAURANT = 'Restaurants',
  BAKERY = 'Boulangeries & Pâtisseries',
  BUS = 'Bus',
  MARKET = 'Marchés',
  LEISURE = 'Loisirs & Tourisme',
  HOTEL = 'Hôtels',
  HEALTH = 'Santé & Urgences',
  GAS = 'Stations-Service',
  MOBILE = 'Opérateurs',
  CYBERCAFE = 'Cybercafés & Impression',
  WORSHIP = 'Lieux de Culte',
  HAIR = 'Coiffure',
  DRY_CLEANING = 'Pressing',
  REPAIR = 'Réparation',
  SEWING = 'Couture',
}

export type SponsorTier = 'BASIC' | 'PREMIUM' | 'VIP';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceStats {
  views: number;
  clicks: number;
  directions: number;
}

export interface Place {
  id: string;
  name: string;
  category: CategoryType;
  description: string;
  position: Coordinates;
  rating: number;
  reviewCount?: number;
  address: string;
  image?: string;
  isBoosted?: boolean;
  sponsorTier?: SponsorTier;
  status?: 'active' | 'pending';
  ownerId?: string;
  stats?: PlaceStats;
  phone?: string;
  hours?: string;
}

export interface UserLocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
}