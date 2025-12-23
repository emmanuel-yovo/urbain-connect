import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Crosshair, Save, Loader2, Camera, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { CategoryType, Coordinates, Place } from '../types';
import { CATEGORY_CONFIG } from '../constants';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (place: Omit<Place, 'id' | 'rating' | 'address'>) => void;
  initialPosition: Coordinates;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ isOpen, onClose, onSubmit, initialPosition }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>(CategoryType.RESTAURANT);
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState<Coordinates>(initialPosition);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition(initialPosition);
    }
  }, [isOpen, initialPosition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    onSubmit({
      name,
      category,
      description,
      position,
      image: imagePreview || undefined // Pass the base64 string if exists
    });
    
    // Reset form
    setName('');
    setDescription('');
    setImagePreview(null);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          alert("Impossible de récupérer votre position GPS.");
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
      alert("Géolocalisation non supportée.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("L'image est trop volumineuse (max 5MB).");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const categories = Object.values(CategoryType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            Ajouter un lieu
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Coordinates Section */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">
              Position du lieu
            </label>
            <div className="flex items-center justify-between mb-3">
               <div className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded border border-blue-200">
                 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
               </div>
               <button
                 type="button"
                 onClick={handleUseCurrentLocation}
                 disabled={isLocating}
                 className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
               >
                 {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                 Ma position GPS
               </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du lieu</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Le Petit Café"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-4 py-2 pr-8 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_CONFIG[cat].label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Photo (Optionnel)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
            
            {!imagePreview ? (
              <div 
                onClick={triggerFileInput}
                className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 hover:bg-slate-50 transition-all gap-2"
              >
                <div className="p-3 bg-slate-100 rounded-full">
                   <Camera size={24} />
                </div>
                <span className="text-xs font-semibold">Cliquez pour ajouter une photo</span>
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-slate-200">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    type="button" 
                    onClick={triggerFileInput}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                    title="Changer"
                  >
                    <Upload size={20} />
                  </button>
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce lieu en quelques mots..."
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Enregistrer ce lieu
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;