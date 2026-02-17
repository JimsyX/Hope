import React from 'react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  inventoryCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, inventoryCount }) => {
  const navItems: { id: ViewState; label: string; icon: string }[] = [
    { id: 'home', label: 'Accueil', icon: 'fa-home' },
    { id: 'inventory', label: 'Frigo', icon: 'fa-list' },
    { id: 'add', label: 'Ajouter', icon: 'fa-plus' },
    { id: 'shopping', label: 'Liste', icon: 'fa-shopping-cart' },
    { id: 'coach', label: 'Coach', icon: 'fa-sparkles' },
    { id: 'settings', label: 'Compte', icon: 'fa-user-group' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                    isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <div className="relative">
                        {item.id === 'add' ? (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform ${isActive ? 'bg-primary-600 text-white scale-110' : 'bg-primary-500 text-white'}`}>
                                <i className={`fas ${item.icon} text-lg`}></i>
                            </div>
                        ) : (
                            <i className={`fas ${item.icon} text-xl mb-0.5 ${item.id === 'coach' ? 'text-purple-500' : ''}`}></i>
                        )}
                        {item.id === 'inventory' && inventoryCount > 0 && (
                             <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px]">
                                {inventoryCount}
                             </span>
                        )}
                    </div>
                    {item.id !== 'add' && <span className="text-[10px] font-medium">{item.label}</span>}
                </button>
            )
        })}
      </div>
    </nav>
  );
};

export default Navigation;