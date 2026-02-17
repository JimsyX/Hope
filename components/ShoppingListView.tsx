import React, { useState } from 'react';
import { ShoppingItem, Department } from '../types';

interface Props {
  items: ShoppingItem[];
  onAddItem: (name: string, department: Department) => void;
  onToggleItem: (id: string) => void;
  onClearCompleted: () => void;
  onDeleteItem: (id: string) => void;
}

const ShoppingListView: React.FC<Props> = ({ items, onAddItem, onToggleItem, onClearCompleted, onDeleteItem }) => {
  const [newItemName, setNewItemName] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department>(Department.GROCERY);
  const [isDeptOpen, setIsDeptOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim(), selectedDept);
      setNewItemName('');
    }
  };

  // Group items by department
  const groupedItems = Object.values(Department).reduce((acc, dept) => {
    const deptItems = items.filter(i => i.department === dept);
    if (deptItems.length > 0) {
      acc[dept] = deptItems;
    }
    return acc;
  }, {} as Record<Department, ShoppingItem[]>);

  const totalItems = items.length;
  const completedCount = items.filter(i => i.checked).length;
  const progress = totalItems === 0 ? 0 : (completedCount / totalItems) * 100;

  // Icon mapping for departments
  const getDeptIcon = (dept: Department) => {
    switch(dept) {
        case Department.PRODUCE: return 'fa-carrot';
        case Department.DAIRY: return 'fa-cheese';
        case Department.MEAT: return 'fa-drumstick-bite';
        case Department.BAKERY: return 'fa-bread-slice';
        case Department.FROZEN: return 'fa-snowflake';
        case Department.GROCERY: return 'fa-utensils';
        case Department.SWEET: return 'fa-cookie';
        case Department.DRINKS: return 'fa-wine-bottle';
        case Department.HOUSEHOLD: return 'fa-pump-soap';
        case Department.HYGIENE: return 'fa-shower';
        default: return 'fa-basket-shopping';
    }
  };

  return (
    <div className="pb-24 animate-fade-in space-y-6">
      
      {/* Header & Progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-4">
              <div>
                  <h2 className="text-2xl font-bold text-slate-800">Liste de Courses</h2>
                  <p className="text-slate-500 text-sm">Organisée par rayons</p>
              </div>
              <div className="text-right">
                  <span className="text-3xl font-bold text-primary-600">{completedCount}</span>
                  <span className="text-slate-400 text-sm font-medium">/{totalItems}</span>
              </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-primary-500 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleSubmit} className="relative z-20">
          <div className="flex gap-2">
              <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ajouter un produit..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {newItemName && (
                      <button type="button" onClick={() => setNewItemName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <i className="fas fa-times-circle"></i>
                      </button>
                  )}
              </div>
              
              {/* Department Selector */}
              <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setIsDeptOpen(!isDeptOpen)}
                    className="h-full px-4 rounded-xl bg-white shadow-sm text-slate-600 font-medium flex items-center gap-2 border border-slate-100"
                  >
                      <i className={`fas ${getDeptIcon(selectedDept)} text-primary-500`}></i>
                      <span className="hidden sm:inline text-sm truncate max-w-[80px]">{selectedDept}</span>
                  </button>
                  
                  {isDeptOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
                          {Object.values(Department).map(dept => (
                              <button
                                key={dept}
                                type="button"
                                onClick={() => { setSelectedDept(dept); setIsDeptOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedDept === dept ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                  <div className="w-6 text-center"><i className={`fas ${getDeptIcon(dept)}`}></i></div>
                                  {dept}
                              </button>
                          ))}
                      </div>
                  )}
                  {/* Backdrop to close dropdown */}
                  {isDeptOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsDeptOpen(false)}></div>}
              </div>

              <button 
                type="submit" 
                disabled={!newItemName.trim()}
                className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:shadow-none transition-transform active:scale-95"
              >
                  <i className="fas fa-plus"></i>
              </button>
          </div>
      </form>

      {/* List */}
      <div className="space-y-4">
          {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-clipboard-check text-3xl text-slate-300"></i>
                  </div>
                  <p>Votre liste de courses est vide.</p>
              </div>
          ) : (
              Object.entries(groupedItems).map(([dept, deptItems]) => (
                  <div key={dept} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-50">
                      <div className="bg-slate-50 px-4 py-2 flex items-center gap-2 border-b border-slate-100">
                          <i className={`fas ${getDeptIcon(dept as Department)} text-slate-400 text-sm`}></i>
                          <h3 className="font-bold text-slate-600 text-sm uppercase tracking-wide">{dept}</h3>
                          <span className="ml-auto text-xs bg-white px-2 py-0.5 rounded-full text-slate-400 font-bold border border-slate-100">
                              {deptItems.length}
                          </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                          {deptItems.map(item => (
                              <div 
                                key={item.id} 
                                className={`flex items-center gap-3 p-4 transition-colors ${item.checked ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                              >
                                  <button 
                                    onClick={() => onToggleItem(item.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        item.checked 
                                        ? 'bg-primary-500 border-primary-500 text-white' 
                                        : 'border-slate-300 text-transparent hover:border-primary-400'
                                    }`}
                                  >
                                      <i className="fas fa-check text-xs"></i>
                                  </button>
                                  
                                  <span className={`flex-1 font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                      {item.name}
                                  </span>
                                  
                                  <button onClick={() => onDeleteItem(item.id)} className="text-slate-300 hover:text-red-400 transition-colors px-2">
                                      <i className="fas fa-trash-alt"></i>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              ))
          )}
      </div>

      {completedCount > 0 && (
          <div className="sticky bottom-24 flex justify-center">
              <button 
                onClick={onClearCompleted}
                className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-900 transition-transform active:scale-95"
              >
                  <i className="fas fa-trash"></i> Nettoyer terminés ({completedCount})
              </button>
          </div>
      )}

    </div>
  );
};

export default ShoppingListView;