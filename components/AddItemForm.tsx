import React, { useState, useRef, useEffect } from 'react';
import { InventoryItem, StorageLocation, Unit } from '../types';

interface Props {
  onAdd: (item: Omit<InventoryItem, 'id' | 'addedDate' | 'userId'>) => void;
  onCancel: () => void;
}

// Mock database for the demo scan feature
const MOCK_BARCODE_DB = [
  'Sauce Tomate Basilic',
  'Pâte à tartiner',
  'Jus d\'Orange Bio',
  'Yaourt Nature x4',
  'Paquet de Pâtes',
  'Riz Basmati',
  'Conserve de Maïs',
  'Tablette de Chocolat'
];

const AddItemForm: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<StorageLocation>(StorageLocation.FRIDGE);
  const [quantity, setQuantity] = useState<string>('1');
  const [unit, setUnit] = useState<Unit>(Unit.PIECE);
  const [expiryDate, setExpiryDate] = useState('');
  
  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) return;

    onAdd({
      name,
      location,
      quantity: parseFloat(quantity),
      unit,
      expiryDate,
    });
  };

  // Helper for quick date selection
  const setDaysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  // Scanner Logic
  const startScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Simulate barcode detection after 2.5 seconds
      setTimeout(() => {
        handleDetected();
      }, 2500);

    } catch (err) {
      console.error("Camera error:", err);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleDetected = () => {
    // Pick a random item to simulate a database lookup
    const randomItem = MOCK_BARCODE_DB[Math.floor(Math.random() * MOCK_BARCODE_DB.length)];
    setName(randomItem);
    stopScanning();
    
    // Simple haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(200);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Ajouter un produit</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nom du produit</label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lait, Oeufs, Tomates..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
            <button
              type="button"
              onClick={startScanning}
              className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-2"
              title="Scanner un code-barres"
            >
              <i className="fas fa-barcode text-xl"></i>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Emplacement</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(StorageLocation).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  location === loc
                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quantité</label>
            <input
              type="number"
              required
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Unité</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white"
            >
              {Object.values(Unit).map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date d'expiration</label>
          <input
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          />
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {[3, 7, 14, 30].map(days => (
                <button
                    key={days}
                    type="button"
                    onClick={() => setDaysFromNow(days)}
                    className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 whitespace-nowrap"
                >
                    +{days} jours
                </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform active:scale-[0.98]"
        >
          Ajouter au stock
        </button>
      </form>

      {/* Scanner Overlay Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={stopScanning}
              className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               className="w-full h-full object-cover opacity-80"
             />
             
             {/* Scanning Line Animation */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-[80%] h-64 border-2 border-primary-500/50 rounded-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[float_2s_ease-in-out_infinite] w-full" style={{ animationName: 'scanline', animationDuration: '2s', animationIterationCount: 'infinite' }}></div>
                 </div>
             </div>
             
             <div className="absolute bottom-20 left-0 right-0 text-center">
                 <p className="text-white font-bold text-lg animate-pulse">Recherche de code-barres...</p>
                 <p className="text-white/60 text-sm">Placez le code dans le cadre</p>
             </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scanline {
              0% { top: 10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 90%; opacity: 0; }
            }
          `}} />
        </div>
      )}
    </div>
  );
};

export default AddItemForm;