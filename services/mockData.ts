import { Place, CategoryType } from '../types';

export const MOCK_PLACES: Place[] = [
  {
    id: 'boost-1',
    name: 'Le Gourmet',
    category: CategoryType.RESTAURANT,
    description: 'Restaurant gastronomique français réputé pour son cadre exceptionnel et sa cuisine raffinée.',
    position: { lat: 48.8610, lng: 2.3450 },
    rating: 4.8,
    reviewCount: 124,
    address: '12 Rue de Rivoli, 75001 Paris',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    isBoosted: true,
    sponsorTier: 'VIP',
    status: 'active',
    ownerId: 'user-123',
    stats: { views: 1240, clicks: 450, directions: 89 },
    phone: '+33 1 42 36 00 00',
    hours: 'Ouvert jusqu\'à 23:00'
  },
  {
    id: 'boost-2',
    name: 'Café de la Paix',
    category: CategoryType.RESTAURANT,
    description: 'Un café historique face à l\'Opéra Garnier.',
    position: { lat: 48.8712, lng: 2.3315 },
    rating: 4.6,
    reviewCount: 2150,
    address: '5 Place de l\'Opéra, 75009 Paris',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    isBoosted: true,
    sponsorTier: 'PREMIUM',
    status: 'active',
    ownerId: 'user-123',
    stats: { views: 850, clicks: 120, directions: 45 }
  },
  {
    id: '1',
    name: 'Parc des Buttes-Chaumont',
    category: CategoryType.LEISURE,
    description: 'Un grand espace vert avec un lac artificiel.',
    position: { lat: 48.8809, lng: 2.3828 },
    rating: 4.8,
    address: '1 Rue Botzaris, 75019 Paris',
    image: 'https://picsum.photos/seed/park/800/600'
  },
  {
    id: '10',
    name: 'Boulangerie Pâtisserie',
    category: CategoryType.BAKERY,
    description: 'Artisans boulangers traditionnels.',
    position: { lat: 48.8650, lng: 2.3550 },
    rating: 4.7,
    address: '24 Rue des Archives, 75004 Paris',
    isBoosted: true,
    sponsorTier: 'BASIC',
    image: 'https://picsum.photos/seed/bakery/800/600'
  }
];