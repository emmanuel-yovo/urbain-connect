import { GoogleGenAI } from "@google/genai";
import { Place, CategoryType, Coordinates } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPlaceholderImage = (category: CategoryType, id: string) => {
  return `https://picsum.photos/seed/${id}/400/200`; 
};

const inferCategoryFromTitle = (title: string, defaultCategory: CategoryType | 'ALL'): CategoryType => {
  const t = title.toLowerCase();
  if (t.includes('boulangerie') || t.includes('bakery') || t.includes('pain')) return CategoryType.BAKERY;
  if (t.includes('restaurant') || t.includes('bistrot') || t.includes('pizza') || t.includes('burger')) return CategoryType.RESTAURANT;
  if (t.includes('marche') || t.includes('market') || t.includes('epicerie')) return CategoryType.MARKET;
  if (t.includes('pharmacie') || t.includes('hopital') || t.includes('medecin')) return CategoryType.HEALTH;
  if (t.includes('hotel') || t.includes('hôtel')) return CategoryType.HOTEL;
  if (t.includes('musee') || t.includes('parc') || t.includes('theatre')) return CategoryType.LEISURE;
  
  if (defaultCategory !== 'ALL') return defaultCategory;
  return CategoryType.LEISURE;
};

export const getPlaceInsights = async (place: Place): Promise<string> => {
  try {
    const prompt = `
      You are an expert urban guide. Provide a short, engaging insight about this place:
      Name: ${place.name}
      Category: ${place.category}
      Focus on what makes it unique. Keep it under 60 words.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Information unavailable.";
  } catch (error) {
    return "Insights currently unavailable.";
  }
};

export const searchPlacesWithGemini = async (
  categoryOrQuery: CategoryType | 'ALL' | string, 
  center: Coordinates,
  countryName: string // Ajout du contexte pays
): Promise<Place[]> => {
  try {
    let searchQuery = categoryOrQuery === 'ALL' ? 'main attractions, landmarks, best services' : categoryOrQuery;
    
    const model = 'gemini-2.5-flash';
    const prompt = `
      Find top 15 interesting or useful locations for "${searchQuery}" in ${countryName}, near latitude ${center.lat}, longitude ${center.lng}. 
      Return real locations found on Google Maps.
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
      const mapData = (chunk as any).maps;
      if (mapData && mapData.title && mapData.center) {
        const inferredCategory = inferCategoryFromTitle(mapData.title, 'ALL');
        newPlaces.push({
          id: mapData.placeId || Math.random().toString(36).substr(2, 9),
          name: mapData.title,
          category: inferredCategory, 
          description: "Découvert via Urbain Connect Search.",
          position: {
            lat: mapData.center.latitude,
            lng: mapData.center.longitude
          },
          rating: 4.5,
          address: countryName, 
          image: getPlaceholderImage(inferredCategory, mapData.title)
        });
      }
    });

    return Array.from(new Map(newPlaces.map(item => [item.name + item.position.lat, item])).values());
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};