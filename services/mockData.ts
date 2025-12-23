import { Place, CategoryType } from '../types';

// Nous gardons uniquement quelques lieux emblématiques pour que la carte ne soit pas vide au chargement initial à Paris.
// Tout le reste proviendra désormais de l'API Google Maps réelle.
export const MOCK_PLACES: Place[] = [
  {
    id: '1',
    name: 'Parc des Buttes-Chaumont',
    category: CategoryType.LEISURE,
    description: 'Un grand espace vert avec un lac artificiel et des vues panoramiques.',
    position: { lat: 48.8809, lng: 2.3828 },
    rating: 4.8,
    address: '1 Rue Botzaris, 75019 Paris',
    image: 'https://picsum.photos/400/200?random=1'
  },
  {
    id: '7',
    name: 'Tour Eiffel',
    category: CategoryType.LEISURE,
    description: 'Le monument le plus emblématique de Paris.',
    position: { lat: 48.8584, lng: 2.2945 },
    rating: 4.9,
    address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
    image: 'https://picsum.photos/400/200?random=7'
  },
  {
    id: '8',
    name: 'Musée du Louvre',
    category: CategoryType.LEISURE,
    description: 'Le plus grand musée d\'art du monde.',
    position: { lat: 48.8606, lng: 2.3376 },
    rating: 4.8,
    address: 'Rue de Rivoli, 75001 Paris',
    image: 'https://picsum.photos/400/200?random=8'
  },
  {
    id: '12',
    name: 'Cathédrale Notre-Dame',
    category: CategoryType.WORSHIP,
    description: 'Chef-d\'œuvre de l\'architecture gothique française.',
    position: { lat: 48.8529, lng: 2.3500 },
    rating: 4.8,
    address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris',
    image: 'https://picsum.photos/400/200?random=12'
  },
  {
    id: '10',
    name: 'Le Bouillon Chartier',
    category: CategoryType.RESTAURANT,
    description: 'Un restaurant historique servant une cuisine française traditionnelle.',
    position: { lat: 48.8719, lng: 2.3435 },
    rating: 4.5,
    address: '7 Rue du Faubourg Montmartre, 75009 Paris',
    image: 'https://picsum.photos/400/200?random=10'
  }
];