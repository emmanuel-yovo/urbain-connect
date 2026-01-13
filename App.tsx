import React, { useState, useEffect } from 'react';
import { Place, CategoryType, Coordinates } from './types';
import { MOCK_PLACES } from './services/mockData';
import { MAP_STYLES, COUNTRIES } from './constants';
import MapView from './components/Map/MapView';
import PlaceDetails from './components/PlaceDetails';
import CategoryChip from './components/ui/CategoryChip';
import OwnerDashboard from './components/Dashboard/OwnerDashboard';
import AuthModal from './components/Auth/AuthModal';
import { searchPlacesWithGemini } from './services/geminiService';
import { 
  Locate, 
  Search, 
  User, 
  X, 
  Map as MapIcon,
  Layers,
  Sparkles,
  LayoutDashboard,
  Star,
  ChevronDown,
  Globe,
  AlertCircle,
  Plus,
  Minus,
  LogIn,
  LogOut,
  Settings
} from 'lucide-react';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'MAP' | 'DASHBOARD'>('MAP');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'ALL' | 'FAVORITES'>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [fetchedPlaces, setFetchedPlaces] = useState<Place[]>([]);
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [displayPlaces, setDisplayPlaces] = useState<Place[]>(MOCK_PLACES);
  
  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ name: string, avatar: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Localisation & Pays
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES[0].url);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: COUNTRIES[0].coords[0], lng: COUNTRIES[0].coords[1] });
  const [route, setRoute] = useState<{start: Coordinates, end: Coordinates} | null>(null);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const allPlaces = [...MOCK_PLACES, ...fetchedPlaces];
    setPlaces(allPlaces);
    if (activeCategory === 'ALL') setDisplayPlaces(allPlaces);
    else if (activeCategory === 'FAVORITES') setDisplayPlaces(allPlaces.filter(p => favorites.includes(p.id)));
    else setDisplayPlaces(allPlaces.filter(p => p.category === activeCategory));
  }, [activeCategory, fetchedPlaces, favorites]);

  const boostedPlaces = displayPlaces.filter(p => p.isBoosted);

  const performSearch = async (query: string, center: Coordinates) => {
    setIsSearching(true);
    try {
      const results = await searchPlacesWithGemini(query, center, selectedCountry.name);
      setFetchedPlaces(prev => {
        const existingNames = new Set(prev.map(p => p.name));
        return [...prev, ...results.filter(r => !existingNames.has(r.name))];
      });
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  const handleLocateMe = () => {
    setIsGeoLoading(true);
    setGeoError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Force userLocation update even if the coords are the same to trigger the useEffect in MapView
          setUserLocation({ 
            lat: pos.coords.latitude + (Math.random() * 0.00000001), 
            lng: pos.coords.longitude + (Math.random() * 0.00000001) 
          });
          setIsGeoLoading(false);
        },
        (err) => {
          setGeoError("Position indisponible");
          setIsGeoLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden flex flex-col font-sans">
      
      {/* 1. HEADER */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-[1000] shrink-0 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setViewMode('MAP')}>
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">U</div>
             <div className="leading-tight">
               <span className="font-extrabold text-slate-800 text-xl block">Urbain</span>
               <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest -mt-1 block">Connect</span>
             </div>
          </div>

          {/* SÉLECTEUR DE PAYS */}
          <div className="relative hidden md:block">
            <button 
              onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
              className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl text-slate-700 font-bold hover:bg-slate-100 transition-all border border-slate-100 shadow-sm"
            >
              <span className="text-xl shadow-sm">{selectedCountry.flag}</span>
              <span className="text-sm font-black">{selectedCountry.name}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isCountryMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCountryMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCountryMenuOpen(false)} />
                <div className="absolute top-full mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone de recherche</div>
                  <div className="max-h-80 overflow-y-auto">
                    {COUNTRIES.map(country => (
                      <button 
                        key={country.id}
                        onClick={() => {
                          setSelectedCountry(country);
                          setMapCenter({ lat: country.coords[0], lng: country.coords[1] });
                          setIsCountryMenuOpen(false);
                          performSearch('ALL', { lat: country.coords[0], lng: country.coords[1] });
                        }}
                        className={`w-full text-left px-4 py-4 text-sm font-bold flex items-center gap-4 transition-colors ${selectedCountry.id === country.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="text-xl">{country.flag}</span>
                        {country.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Barre de recherche centrale */}
        <div className="flex-1 max-w-xl px-8 hidden md:block">
          <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery, mapCenter); }} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Chercher en ${selectedCountry.name}...`}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner"
            />
          </form>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
                if(!user) setIsAuthModalOpen(true);
                else setViewMode('DASHBOARD');
            }}
            className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Sparkles size={16} />
            Booster la visibilité
          </button>
          
          <div className="relative">
            <button 
              onClick={() => {
                  if(!user) setIsAuthModalOpen(true);
                  else setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all overflow-hidden shadow-sm"
            >
              {user ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                  <LogIn size={20} className="text-slate-500" />
              )}
            </button>

            {isUserMenuOpen && user && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mon Compte</p>
                    <p className="font-bold text-slate-800 truncate">{user.name}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setViewMode('DASHBOARD'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors">
                      <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors">
                      <Settings size={18} /> Paramètres
                    </button>
                    <div className="h-px bg-slate-100 my-2 mx-2" />
                    <button onClick={() => { setUser(null); setIsUserMenuOpen(false); setViewMode('MAP'); }} className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                      <LogOut size={18} /> Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {viewMode === 'MAP' ? (
          <>
            {/* Sidebar Lieux Sponsorisés */}
            <aside className="w-[380px] bg-white border-r border-slate-100 overflow-hidden flex flex-col hidden lg:flex">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/40">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg tracking-tight uppercase">
                  Sponsorisés
                  <span className="bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black tracking-widest">ADS</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {boostedPlaces.map(place => (
                  <div 
                    key={place.id} 
                    onClick={() => { setMapCenter(place.position); setSelectedPlace(place); }}
                    className="group flex gap-4 p-4 rounded-3xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                      <img src={place.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-extrabold text-slate-800 text-sm truncate leading-tight">{place.name}</h4>
                        <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Top</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 mb-2">{place.category}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 rounded-lg">
                           <Star size={10} fill="#f59e0b" className="text-amber-500" />
                           <span className="text-[11px] font-black text-amber-700">{place.rating}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold tracking-tight">Vues: {place.stats?.views || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Map Container */}
            <main className="flex-1 relative flex flex-col overflow-hidden">
               {/* Categories Bar */}
               <div className="bg-white border-b border-slate-100 px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
                 <button 
                    onClick={() => setActiveCategory('ALL')} 
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all border uppercase tracking-widest ${activeCategory === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                 >
                   Explorer
                 </button>
                 {Object.values(CategoryType).map(cat => (
                   <CategoryChip key={cat} category={cat} isSelected={activeCategory === cat} onClick={(c) => setActiveCategory(c)} />
                 ))}
               </div>

               <div className="flex-1 relative">
                 <MapView 
                   places={displayPlaces}
                   userLocation={userLocation}
                   selectedCountryCoords={selectedCountry.coords}
                   selectedCountryZoom={selectedCountry.zoom}
                   onMarkerClick={setSelectedPlace}
                   mapStyle={currentMapStyle}
                   onCenterChange={setMapCenter}
                   favorites={favorites}
                   route={route}
                 />
                 
                 {/* Floating Toolbar */}
                 <div className="absolute right-6 bottom-8 z-[500] flex flex-col gap-4 items-end">
                    {isStyleMenuOpen && (
                        <div className="bg-white/95 backdrop-blur-xl p-3 rounded-[32px] shadow-2xl border border-white/20 mb-2 flex flex-col gap-3 animate-in slide-in-from-bottom-6 duration-500">
                            {MAP_STYLES.map(style => (
                                <button 
                                    key={style.id}
                                    onClick={() => { setCurrentMapStyle(style.url); setIsStyleMenuOpen(false); }}
                                    className={`group flex items-center gap-3 p-2.5 rounded-2xl transition-all ${currentMapStyle === style.url ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-700'}`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${currentMapStyle === style.url ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-100 group-hover:bg-blue-50'}`}>
                                        <style.icon size={18} />
                                    </div>
                                    <span className="text-xs font-black pr-4 uppercase tracking-tighter">{style.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-md rounded-[28px] shadow-2xl border border-slate-100">
                        <button onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all">
                            <Layers size={22} />
                        </button>
                        <div className="h-px bg-slate-100 mx-2" />
                        <button 
                            onClick={handleLocateMe}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isGeoLoading ? 'animate-pulse text-blue-500' : 'text-slate-700 hover:text-blue-600'}`}
                            title="Recentrer sur moi"
                        >
                            {geoError ? <AlertCircle size={22} className="text-red-500" /> : <Locate size={22} />}
                        </button>
                    </div>

                    <div className="flex flex-col p-2 bg-white/90 backdrop-blur-md rounded-[28px] shadow-2xl border border-slate-100">
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all"><Plus size={20} /></button>
                        <div className="h-px bg-slate-100 mx-2" />
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all"><Minus size={20} /></button>
                    </div>
                 </div>

                 <PlaceDetails 
                    place={selectedPlace} 
                    onClose={() => setSelectedPlace(null)} 
                    userLocation={userLocation}
                    isFavorite={selectedPlace ? favorites.includes(selectedPlace.id) : false}
                    onToggleFavorite={(id) => setFavorites(f => f.includes(id) ? f.filter(x => x!==id) : [...f, id])}
                    onRoute={(target) => userLocation && setRoute({start: userLocation, end: target})}
                 />
               </div>
            </main>
          </>
        ) : (
          <OwnerDashboard 
            ownedPlaces={MOCK_PLACES.filter(p => p.ownerId === 'user-123')}
            onBoost={(id) => alert('Offres Boost : Basic (5€), Premium (15€), VIP (40€)')}
            onEdit={(p) => alert('Modification en cours...')}
          />
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={(data) => {
            setUser(data);
            setIsAuthModalOpen(false);
        }} 
      />

    </div>
  );
};

export default App;