import { GoogleGenAI } from "@google/genai";
import { Place, CategoryType, Coordinates } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to get a random image based on category
const getPlaceholderImage = (category: CategoryType, id: string) => {
  // Utilisation de mots clés pour l'image placeholder pour que ça soit plus cohérent
  let term = 'city';
  if (category === CategoryType.RESTAURANT) term = 'restaurant';
  if (category === CategoryType.LEISURE) term = 'park';
  if (category === CategoryType.HOTEL) term = 'hotel';
  if (category === CategoryType.BAKERY) term = 'bakery';
  if (category === CategoryType.MARKET) term = 'market';
  
  // Utilisation de seed/random pour varier les images
  return `https://picsum.photos/seed/${id}/400/200`; 
};

/**
 * C'est le COEUR du système de personnalisation.
 * Cette fonction prend n'importe quel titre venant de Google Maps
 * et détermine quelle icône de VOTRE application doit être affichée.
 */
const inferCategoryFromTitle = (title: string, defaultCategory: CategoryType | 'ALL'): CategoryType => {
  const t = title.toLowerCase();

  // 1. Alimentation & Restauration
  if (t.includes('boulangerie') || t.includes('pâtisserie') || t.includes('bakery') || t.includes('pain') || t.includes('brioche')) return CategoryType.BAKERY;
  if (t.includes('restaurant') || t.includes('bistrot') || t.includes('brasserie') || t.includes('cafe') || t.includes('café') || t.includes('pizza') || t.includes('burger') || t.includes('sushi') || t.includes('wok') || t.includes('tacos') || t.includes('mcdo') || t.includes('kfc')) return CategoryType.RESTAURANT;
  if (t.includes('marche') || t.includes('marché') || t.includes('market') || t.includes('supermarche') || t.includes('carrefour') || t.includes('leclerc') || t.includes('monoprix') || t.includes('lidl') || t.includes('auchan') || t.includes('epicerie')) return CategoryType.MARKET;

  // 2. Services du Quotidien
  if (t.includes('pharmacie') || t.includes('hopital') || t.includes('hôpital') || t.includes('clinique') || t.includes('medecin') || t.includes('docteur') || t.includes('dentiste') || t.includes('laboratoire')) return CategoryType.HEALTH;
  if (t.includes('coiffure') || t.includes('coiffeur') || t.includes('barber') || t.includes('hair') || t.includes('salon') || t.includes('beauté')) return CategoryType.HAIR;
  if (t.includes('pressing') || t.includes('sec') || t.includes('laverie') || t.includes('blanchisserie')) return CategoryType.DRY_CLEANING;
  if (t.includes('couture') || t.includes('retouche') || t.includes('fil') || t.includes('tailleur')) return CategoryType.SEWING;
  if (t.includes('cyber') || t.includes('imprimerie') || t.includes('copy') || t.includes('informatique') || t.includes('internet')) return CategoryType.CYBERCAFE;
  
  // 3. Transport & Auto
  if (t.includes('station') || t.includes('total') || t.includes('bp') || t.includes('shell') || t.includes('esso') || t.includes('essence') || t.includes('service')) return CategoryType.GAS;
  if (t.includes('garage') || t.includes('auto') || t.includes('reparation') || t.includes('pneu') || t.includes('mecanique')) return CategoryType.REPAIR;
  if (t.includes('bus') || t.includes('gare') || t.includes('ratp') || t.includes('sncf') || t.includes('metro') || t.includes('tram') || t.includes('arret')) return CategoryType.BUS;

  // 4. Tourisme & Hébergement
  if (t.includes('hotel') || t.includes('hôtel') || t.includes('ibis') || t.includes('novotel') || t.includes('mercure') || t.includes('residence') || t.includes('bnb')) return CategoryType.HOTEL;
  if (t.includes('eglise') || t.includes('église') || t.includes('cathedrale') || t.includes('mosquee') || t.includes('synagogue') || t.includes('temple') || t.includes('basilique')) return CategoryType.WORSHIP;
  if (t.includes('musee') || t.includes('musée') || t.includes('parc') || t.includes('jardin') || t.includes('cinema') || t.includes('theatre') || t.includes('stade') || t.includes('piscine') || t.includes('monument') || t.includes('tour')) return CategoryType.LEISURE;

  // 5. Tech
  if (t.includes('orange') || t.includes('sfr') || t.includes('bouygues') || t.includes('free') || t.includes('mobile') || t.includes('phone') || t.includes('telephonie')) return CategoryType.MOBILE;

  // Si on a sélectionné une catégorie spécifique dans le filtre (ex: l'utilisateur a cliqué sur "Hôtels"), on force cette catégorie
  if (defaultCategory !== 'ALL') return defaultCategory;
  
  // Fallback si rien n'est trouvé
  return CategoryType.LEISURE;
};

export const getPlaceInsights = async (place: Place): Promise<string> => {
  try {
    const prompt = `
      You are an expert urban guide. Provide a short, engaging, and practical insight (max 80 words) about this specific place or this type of service in this location.
      
      Place Name: ${place.name}
      Category: ${place.category}
      Location Context: Paris, France (inferred)
      Description: ${place.description}

      Focus on what makes it unique or a useful tip for a visitor. Keep it plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Information unavailable at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI insights are currently unavailable. Please check your connection.";
  }
};

export const searchPlacesWithGemini = async (
  categoryOrQuery: CategoryType | 'ALL' | string, 
  center: Coordinates
): Promise<Place[]> => {
  try {
    // Construction de la requête pour Google Maps
    let searchQuery = '';
    let categoryForInference: CategoryType | 'ALL' = 'ALL';

    if (Object.values(CategoryType).includes(categoryOrQuery as CategoryType)) {
        // Si c'est une de nos catégories
        searchQuery = categoryOrQuery;
        categoryForInference = categoryOrQuery as CategoryType;
    } else if (categoryOrQuery === 'ALL') {
        // Si c'est "Tout"
        searchQuery = 'popular places, restaurants, hotels, bakeries, parks, pharmacies, supermarkets, monuments';
    } else {
        // Si c'est une recherche libre (ex: "Sushi", "Coiffeur")
        searchQuery = categoryOrQuery;
    }
    
    // On utilise Gemini avec Google Maps Grounding
    const model = 'gemini-2.5-flash';
    
    // Prompt optimisé pour agir comme un "Scraper" intelligent via l'API
    const prompt = `
      Find up to 20 distinct locations matching "${searchQuery}" near latitude ${center.lat}, longitude ${center.lng}. 
      Prioritize high-rated and popular places.
      Ensure the list contains real, physical locations available on Google Maps.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: center.lat,
              longitude: center.lng
            }
          }
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const newPlaces: Place[] = [];

    chunks.forEach((chunk) => {
      // Les données brutes de Google Maps (Titre, Lat/Lng, PlaceID)
      const mapData = (chunk as any).maps;

      if (mapData && mapData.title && mapData.center) {
        
        // MAGIE : On mappe le résultat Google vers VOS catégories
        const inferredCategory = inferCategoryFromTitle(mapData.title, categoryForInference);

        newPlaces.push({
          id: mapData.placeId || Math.random().toString(36).substr(2, 9),
          name: mapData.title,
          category: inferredCategory, 
          description: "Lieu identifié via Google Maps. Cliquez pour voir les détails.",
          position: {
            lat: mapData.center.latitude,
            lng: mapData.center.longitude
          },
          rating: 4.5, // Note par défaut si non disponible, Gemini Grounding ne renvoie pas toujours la note exacte
          address: "Adresse Google Maps", 
          image: getPlaceholderImage(inferredCategory, mapData.title)
        });
      }
    });

    // Suppression des doublons stricts
    const uniquePlaces = Array.from(new Map(newPlaces.map(item => [item.name + item.position.lat, item])).values());

    return uniquePlaces;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};