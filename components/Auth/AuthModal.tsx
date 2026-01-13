import React, { useState } from 'react';
import { X, Mail, Lock, Github, Chrome, Apple, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string, avatar: string }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation
    onSuccess({
      name: "Jean Dupont",
      avatar: "https://ui-avatars.com/api/?name=Jean+Dupont&background=2563eb&color=fff"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">U</div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Urbain Connect</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Bon retour parmi nous !' : 'Créer un compte'}
            </h3>
            <p className="text-slate-500 text-sm">
              {isLogin ? 'Connectez-vous pour gérer vos lieux favoris.' : 'Rejoignez la communauté Urbain Connect.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-8">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder="Email professionnel" 
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Mot de passe oublié ?</button>
              </div>
            )}
            <button 
              type="submit" 
              className="w-full h-12 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {isLogin ? 'Se connecter' : 'S\'inscrire'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-100" />
            <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ou continuer avec</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button className="flex items-center justify-center h-12 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all"><Chrome size={20} className="text-slate-600" /></button>
            <button className="flex items-center justify-center h-12 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all"><Apple size={20} className="text-slate-600" /></button>
            <button className="flex items-center justify-center h-12 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all"><Github size={20} className="text-slate-600" /></button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-600 font-bold hover:underline">
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;