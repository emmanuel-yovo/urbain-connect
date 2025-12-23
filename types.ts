export enum CategoryType {
  // Top Tier (Daily/High Traffic)
  RESTAURANT = 'Restaurants',
  BAKERY = 'Boulangeries & Pâtisseries',
  BUS = 'Bus',
  MARKET = 'Marchés',
  
  // Tourism & Leisure
  LEISURE = 'Loisirs & Tourisme',
  HOTEL = 'Hôtels',
  
  // Services & Utilities
  HEALTH = 'Santé & Urgences',
  GAS = 'Stations-Service',
  MOBILE = 'Opérateurs',
  CYBERCAFE = 'Cybercafés & Impression',
  
  // Niche / Specific Needs
  WORSHIP = 'Lieux de Culte',
  HAIR = 'Coiffure',
  DRY_CLEANING = 'Pressing',
  REPAIR = 'Réparation',
  SEWING = 'Couture',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: CategoryType;
  description: string;
  position: Coordinates;
  rating: number;
  address: string;
  image?: string;
}

export interface UserLocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
}