import React, { useState, useEffect, useRef } from 'react';
import { Place, CategoryType, Coordinates } from './types';
import { MOCK_PLACES } from './services/mockData';
import { MAP_STYLES } from './constants';
import MapView from './components/Map/MapView';
import PlaceDetails from './components/PlaceDetails';
import CategoryChip from './components/ui/CategoryChip';
import AddPlaceModal from './components/AddPlaceModal';
import { searchPlacesWithGemini } from './services/geminiService';
import { 
  Locate, 
  Search, 
  Menu, 
  User, 
  X, 
  Heart, 
  Settings, 
  LogOut, 
  Info,
  Map as MapIcon,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  MapPin,
  MapPinOff,
  CloudDownload
} from 'lucide-react';

const App: React.FC = () => {
  // Filters and Categories
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'ALL' | 'FAVORITES'>('ALL');
  
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Data
  const [fetchedPlaces, setFetchedPlaces] = useState<Place[]>([]);
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [displayPlaces, setDisplayPlaces] = useState<Place[]>(MOCK_PLACES);
  
  // User State
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Ref pour éviter de spammer l'API Google Maps au chargement initial
  const hasInitialSearchDoneRef = useRef(false);
  
  // Settings State
  const [isGeoEnabled, setIsGeoEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('urban-connect-geo-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Map State
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES[0].url);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 48.8566, lng: 2.3522 }); // Default Paris
  const [route, setRoute] = useState<{start: Coordinates, end: Coordinates} | null>(null);
  
  // Interaction State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Place Flow
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<Coordinates | null>(null);

  // Load favorites
  useEffect(() => {
      const savedFavs = localStorage.getItem('urban-connect-favorites');
      if (savedFavs) {
          try {
              setFavorites(JSON.parse(savedFavs));
          } catch (e) { console.error("Error loading favorites"); }
      }
  }, []);

  // Géolocalisation Temps Réel
  useEffect(() => {
    localStorage.setItem('urban-connect-geo-enabled', JSON.stringify(isGeoEnabled));
    
    let watchId: number | null = null;

    if (isGeoEnabled) {
        if (navigator.geolocation) {
            const geoOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(newCoords);

                    // AUTO-SEARCH: La première fois qu'on trouve l'utilisateur
                    if (!hasInitialSearchDoneRef.current) {
                        hasInitialSearchDoneRef.current = true;
                        performSearch(activeCategory === 'FAVORITES' ? 'ALL' : activeCategory, newCoords);
                    }
                },
                (error) => {
                    console.error("Erreur de géolocalisation", error);
                },
                geoOptions
            );
        } else {
             alert("La géolocalisation n'est pas supportée par votre navigateur.");
             setIsGeoEnabled(false);
        }
    } else {
        setUserLocation(null);
        setRoute(null);
        hasInitialSearchDoneRef.current = false;
    }

    return () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isGeoEnabled]);

  // Update displayed places
  useEffect(() => {
    const allPlaces = [...MOCK_PLACES, ...fetchedPlaces];
    setPlaces(allPlaces);

    if (activeCategory === 'ALL') {
      setDisplayPlaces(allPlaces);
    } else if (activeCategory === 'FAVORITES') {
      setDisplayPlaces(allPlaces.filter(p => favorites.includes(p.id)));
    } else {
      setDisplayPlaces(allPlaces.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, fetchedPlaces, favorites]);

  const handleLocateMe = () => {
    setIsGeoEnabled(!isGeoEnabled);
  };

  const toggleGeolocation = () => {
      setIsGeoEnabled(!isGeoEnabled);
  };

  const performSearch = async (queryOrCat: string | CategoryType | 'ALL', center: Coordinates) => {
    setIsSearching(true);
    try {
        const results = await searchPlacesWithGemini(queryOrCat, center);
        if (results.length > 0) {
            setFetchedPlaces(prev => {
                const existingNames = new Set(prev.map(p => p.name));
                const newUnique = results.filter(r => !existingNames.has(r.name));
                return [...prev, ...newUnique];
            });
        } else {
            alert("Aucun nouveau lieu trouvé dans cette zone.");
        }
    } catch (e) {
        console.error("Search failed", e);
    } finally {
        setIsSearching(false);
    }
  };

  const handleSearchArea = () => {
      // Si une recherche texte est active, on l'utilise, sinon on utilise la catégorie
      const searchParam = searchQuery.trim() ? searchQuery : (activeCategory === 'FAVORITES' ? 'ALL' : activeCategory);
      performSearch(searchParam, mapCenter);
  };
  
  const handleTextSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim()) {
          performSearch(searchQuery, mapCenter);
      }
  };

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
    setRoute(null);
    setTempLocation(null); // Clear temp marker if clicking a real place
  };

  const handleMapClick = (coords: Coordinates) => {
    // Si un lieu est sélectionné, on le désélectionne
    if (selectedPlace) {
        setSelectedPlace(null);
        return;
    }
    // Sinon, on place un marqueur temporaire (Pin)
    setTempLocation(coords);
  };

  const toggleLogin = () => {
    if (!isLoggedIn) {
        const confirmLogin = window.confirm("Voulez-vous vous connecter ? (Simulation)");
        if (confirmLogin) setIsLoggedIn(true);
    } else {
        setIsLoggedIn(false);
    }
  };
  
  const handleAddPlaceSubmit = (placeData: Omit<Place, 'id' | 'rating' | 'address'>) => {
    const newPlace: Place = {
      ...placeData,
      id: `custom-${Date.now()}`,
      rating: 5.0, 
      address: 'Lieu ajouté par utilisateur',
      // Use provided image or fallback to random
      image: placeData.image || `https://picsum.photos/400/200?random=${Date.now()}`
    };
    
    setFetchedPlaces(prev => [newPlace, ...prev]);
    setMapCenter(newPlace.position); 
    setSelectedPlace(newPlace);
    setTempLocation(null); // Remove temp pin after adding
  };

  const toggleFavorite = (id: string) => {
      let newFavs;
      if (favorites.includes(id)) {
          newFavs = favorites.filter(fid => fid !== id);
      } else {
          newFavs = [...favorites, id];
      }
      setFavorites(newFavs);
      localStorage.setItem('urban-connect-favorites', JSON.stringify(newFavs));
  };

  const handleRoute = (target: Coordinates) => {
      if (!isGeoEnabled) {
          alert("Veuillez activer la géolocalisation pour l'itinéraire.");
          return;
      }
      if (userLocation) {
          setRoute({ start: userLocation, end: target });
      } else {
          alert("Recherche du signal GPS en cours...");
      }
  };

  const categories = Object.values(CategoryType);

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden flex flex-col">
      
      {/* ---------------- Sidebar / Menu ---------------- */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[2000] backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white z-[2100] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">U</div>
             <span className="font-bold text-lg">Urban Connect</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* ... (Menu content stays similar but shortened for brevity) ... */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
             {/* Navigation Items */}
             <button onClick={() => { setActiveCategory('ALL'); setIsMenuOpen(false); }} className="flex items-center w-full p-3 rounded-xl hover:bg-slate-50 gap-3 font-medium text-slate-700">
                <MapIcon size={20} className="text-slate-400" /> Explorer la carte
             </button>
             {/* ... */}
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-4 pointer-events-none">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
                <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 shrink-0">
                    <Menu size={20} />
                </button>
                
                {/* SEARCH BAR - Replaces Title */}
                <form onSubmit={handleTextSearchSubmit} className="flex-1 relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Chercher sur Google Maps (ex: Sushi, Coiffeur)..." 
                        className="w-full h-10 pl-10 pr-4 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </form>
            </div>

            {/* Right Buttons */}
            <div className="flex gap-2 ml-2">
                <button onClick={handleLocateMe} className={`w-10 h-10 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center transition-colors ${isGeoEnabled ? 'bg-blue-600 text-white' : 'bg-white/90 text-slate-700'}`}>
                  {isGeoEnabled ? <Locate size={20} /> : <MapPinOff size={20} />}
                </button>
                <button onClick={toggleLogin} className="h-10 px-3 min-w-[40px] bg-white/90 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center text-slate-700">
                    {isLoggedIn ? <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">JD</div> : <User size={20} />}
                </button>
            </div>
          </div>

          {/* Chips */}
          <div className="flex overflow-x-auto pb-2 gap-2 pointer-events-auto no-scrollbar mask-gradient">
             <button onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }} className={`px-4 py-2 rounded-full shadow-sm text-sm font-medium whitespace-nowrap ${activeCategory === 'ALL' && !searchQuery ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>Tous</button>
             {categories.map((cat) => (
                <CategoryChip key={cat} category={cat} isSelected={activeCategory === cat && !searchQuery} onClick={(c) => { setActiveCategory(c); setSearchQuery(''); }} />
             ))}
          </div>
        </div>
      </div>

      {/* ---------------- Search Button ---------------- */}
      {activeCategory !== 'FAVORITES' && (
      <div className="absolute top-36 left-0 right-0 z-[450] flex justify-center pointer-events-none">
        <button onClick={handleSearchArea} disabled={isSearching} className={`pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl text-sm font-semibold transition-all ${isSearching ? 'bg-slate-100 text-slate-400' : 'bg-white/90 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
          {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <CloudDownload size={16} />}
          {isSearching ? 'Chargement Google Maps...' : 'Charger les lieux de la zone'}
        </button>
      </div>
      )}

      {/* ---------------- Right Action Buttons ---------------- */}
      <div className="absolute bottom-6 right-4 z-[400] flex flex-col items-end gap-3 pointer-events-auto">
        {/* ADD PLACE BUTTON (General) */}
        <button
          onClick={() => {
              setTempLocation(mapCenter); // Si on clique sur le bouton "+", on met le pin au centre
              setIsAddPlaceOpen(true);
          }}
          className="w-14 h-14 bg-slate-900 text-white shadow-xl rounded-full flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95"
          title="Ajouter un lieu"
        >
          <Plus size={28} />
        </button>

        {/* Style Switcher ... */}
        <button onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)} className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600">
          <Layers size={24} />
        </button>
        {isStyleMenuOpen && (
          <div className="bg-white rounded-xl shadow-xl p-2 mb-2 min-w-[140px] absolute bottom-16 right-0 border border-slate-100">
            {MAP_STYLES.map((style) => (
              <button key={style.id} onClick={() => { setCurrentMapStyle(style.url); setIsStyleMenuOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm rounded-lg ${currentMapStyle === style.url ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                {style.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Main Map ---------------- */}
      <div className="flex-1 w-full h-full">
        <MapView 
          places={displayPlaces} 
          userLocation={userLocation}
          onMarkerClick={handleMarkerClick}
          mapStyle={currentMapStyle}
          onCenterChange={setMapCenter}
          favorites={favorites}
          route={route}
          // New Props
          onMapClick={handleMapClick}
          tempLocation={tempLocation}
          onAddPlaceAtLocation={() => setIsAddPlaceOpen(true)}
        />
      </div>

      <PlaceDetails 
        place={selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
        userLocation={userLocation}
        isFavorite={selectedPlace ? favorites.includes(selectedPlace.id) : false}
        onToggleFavorite={toggleFavorite}
        onRoute={handleRoute}
      />
      
      {/* Modal is initialized with tempLocation (the dropped pin) OR the map center */}
      <AddPlaceModal 
        isOpen={isAddPlaceOpen}
        onClose={() => setIsAddPlaceOpen(false)}
        onSubmit={handleAddPlaceSubmit}
        initialPosition={tempLocation || mapCenter}
      />
      
    </div>
  );
};

export default App;