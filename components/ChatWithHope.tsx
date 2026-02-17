import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, InventoryItem } from '../types';
import { chatWithHope } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
}

const ChatWithHope: React.FC<Props> = ({ isOpen, onClose, inventory }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: 'Salut ! C\'est Hope. Besoin d\'aide pour le dîner ou de motivation pour le ménage ?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Filter last 10 messages for context window to save tokens/complexity
      const contextHistory = messages.slice(-10);
      const responseText = await chatWithHope(contextHistory, userMsg.text, inventory);
      
      const hopeMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, hopeMsg]);
    } catch (err) {
      // Error handled in service, minimal UI feedback
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden chat-enter relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative">
                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Hope&backgroundColor=ffdfbf" className="w-8 h-8 rounded-full" />
                 <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
             </div>
             <div>
               <h3 className="font-bold">Hope</h3>
               <p className="text-pink-100 text-xs flex items-center gap-1">
                 <i className="fas fa-bolt text-[10px]"></i> IA Assistante
               </p>
             </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
           {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                 msg.role === 'user' 
                 ? 'bg-rose-500 text-white rounded-tr-none' 
                 : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
               }`}>
                 {msg.text}
               </div>
             </div>
           ))}
           {loading && (
             <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-2 items-center">
                 <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
           <form onSubmit={handleSend} className="flex gap-2">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Demande quelque chose à Hope..."
               className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
             />
             <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="w-11 h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <i className="fas fa-paper-plane"></i>
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWithHope;