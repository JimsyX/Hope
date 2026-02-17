import React from 'react';
import { InventoryItem, StorageLocation } from '../types';

interface Props {
  item: InventoryItem;
  onDelete: (id: string) => void;
}

const InventoryItemCard: React.FC<Props> = ({ item, onDelete }) => {
  const today = new Date();
  const expiry = new Date(item.expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine styling based on rules
  let containerClass = '';
  let textClass = '';
  let subTextClass = '';
  let iconClass = '';
  let statusText = '';
  let statusIcon = '';

  const isHousehold = item.location === StorageLocation.HOUSEHOLD || item.location === StorageLocation.PANTRY && item.name.toLowerCase().includes('savon'); // Simple logic for demo

  if (item.location === StorageLocation.HOUSEHOLD) {
      // Blue for household/non-perishables (mostly)
      containerClass = 'bg-blue-500 border-blue-600 shadow-blue-500/30';
      textClass = 'text-white';
      subTextClass = 'text-blue-100';
      iconClass = 'bg-white/20 text-white';
      statusText = 'Produit ménager';
      statusIcon = 'fa-pump-soap';
  } else if (diffDays < 0) {
      // Expired - Dark Red/Grayish
      containerClass = 'bg-slate-700 border-slate-800 opacity-80';
      textClass = 'text-slate-300 line-through';
      subTextClass = 'text-slate-400';
      iconClass = 'bg-white/10 text-slate-400';
      statusText = 'Expiré';
      statusIcon = 'fa-ban';
  } else if (diffDays <= 3) {
      // Critical - Full Red
      containerClass = 'bg-red-500 border-red-600 shadow-red-500/30 animate-pulse'; // Subtle pulse for critical
      textClass = 'text-white';
      subTextClass = 'text-red-100';
      iconClass = 'bg-white/20 text-white';
      statusText = `Critique: ${diffDays}j`;
      statusIcon = 'fa-exclamation-triangle';
  } else if (diffDays <= 7) {
      // Warning - Yellow/Amber
      containerClass = 'bg-amber-400 border-amber-500 shadow-amber-500/30';
      textClass = 'text-amber-900';
      subTextClass = 'text-amber-800';
      iconClass = 'bg-black/10 text-amber-900';
      statusText = `Attention: ${diffDays}j`;
      statusIcon = 'fa-clock';
  } else {
      // Good - Green
      containerClass = 'bg-emerald-500 border-emerald-600 shadow-emerald-500/30';
      textClass = 'text-white';
      subTextClass = 'text-emerald-100';
      iconClass = 'bg-white/20 text-white';
      statusText = `${diffDays} jours`;
      statusIcon = 'fa-check-circle';
  }

  return (
    <div className={`rounded-2xl p-4 shadow-lg border flex items-center justify-between group hover:scale-[1.02] transition-all duration-200 ${containerClass}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 backdrop-blur-sm ${iconClass}`}>
             <i className={`fas ${item.location === 'Réfrigérateur' ? 'fa-snowflake' : item.location === 'Congélateur' ? 'fa-icicles' : item.location === 'Garde-manger' ? 'fa-box' : 'fa-broom'}`}></i>
        </div>
        <div>
          <h3 className={`font-bold text-lg leading-tight ${textClass}`}>{item.name}</h3>
          <div className={`flex items-center gap-2 text-xs mt-1 font-medium ${subTextClass}`}>
             <span className="bg-black/10 px-2 py-0.5 rounded-md backdrop-blur-sm">
               {item.quantity} {item.unit}
             </span>
             <span>•</span>
             <span className="flex items-center gap-1">
                <i className={`fas ${statusIcon} text-[10px]`}></i> {statusText}
             </span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => onDelete(item.id)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-black/10 hover:bg-white/20 ${textClass}`}
      >
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );
};

export default InventoryItemCard;