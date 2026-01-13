import React from 'react';
import { Place, SponsorTier } from '../../types';
import { CATEGORY_CONFIG } from '../../constants';
import { 
  BarChart3, 
  Eye, 
  Navigation, 
  MousePointer2, 
  Plus, 
  TrendingUp, 
  CreditCard,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface OwnerDashboardProps {
  ownedPlaces: Place[];
  onBoost: (placeId: string) => void;
  onEdit: (place: Place) => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ ownedPlaces, onBoost, onEdit }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Stats */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord</h1>
            <p className="text-slate-500">Gérez vos établissements et boostez votre visibilité.</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            <Plus size={20} /> Ajouter un établissement
          </button>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Eye className="text-blue-500" />} label="Vues totales" value="4,250" trend="+12%" />
          <StatCard icon={<Navigation className="text-purple-500" />} label="Itinéraires" value="184" trend="+5%" />
          <StatCard icon={<MousePointer2 className="text-emerald-500" />} label="Clics" value="620" trend="+18%" />
        </div>

        {/* Places List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Vos Établissements</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {ownedPlaces.map((place) => (
              <div key={place.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-slate-900">{place.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${place.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {place.status === 'active' ? 'Validé' : 'En attente'}
                    </span>
                    {place.isBoosted && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Sparkles size={10} /> {place.sponsorTier}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{place.address}</p>
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye size={14} /> {place.stats?.views} vues
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Navigation size={14} /> {place.stats?.directions} iti.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEdit(place)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Settings size={20} />
                  </button>
                  <button 
                    onClick={() => onBoost(place.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${place.isBoosted ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                  >
                    {place.isBoosted ? 'Boost Actif' : 'Booster'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend: string }> = ({ icon, label, value, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
      {trend}
    </div>
  </div>
);

export default OwnerDashboard;