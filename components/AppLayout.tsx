import React, { useState } from 'react';
import { ClipboardList, UserPlus, Lock, X, ChevronRight } from 'lucide-react';

// ==========================================
// 🔐 UPDATE PASSWORD HERE
// ==========================================
const ACCESS_PASSWORD = '01111951283';
// ==========================================

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'form' | 'list';
  onNavigate: (view: 'form' | 'list') => void;
}

export const AppLayout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleNavigateToList = () => {
    if (currentView === 'list') return;
    setShowAuthModal(true);
    setPassword('');
    setError(false);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      onNavigate('list');
      setShowAuthModal(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-brand-gold/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-brand-gold">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m4.5 0a4.5 4.5 0 1 1 4.5 4.5M12 16.5V15m0-7.5V3m0 13.5V21" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">BATRAWY</h1>
              <p className="text-xs text-brand-gold tracking-widest font-semibold uppercase">Dental Clinic</p>
            </div>
          </div>
          
          <nav className="flex gap-2">
            <button
              onClick={() => onNavigate('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-bold ${
                currentView === 'form' 
                  ? 'bg-brand-gold text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">تسجيل مريض</span>
            </button>
            <button
              onClick={handleNavigateToList}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-bold ${
                currentView === 'list' 
                  ? 'bg-brand-gold text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {currentView === 'list' ? <ClipboardList size={18} /> : <Lock size={18} />}
              <span className="hidden sm:inline">سجل المرضى</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Batrawy Dental Clinic. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-gold p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Lock size={20} />
                الدخول محمي
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="p-6">
              <p className="text-gray-600 mb-4 text-sm">هذا القسم خاص بالأطباء والإدارة فقط. يرجى إدخال كلمة المرور للمتابعة.</p>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2 text-sm">كلمة المرور</label>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg outline-none text-left text-lg tracking-widest ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold'}`}
                  placeholder="••••••••••"
                  dir="ltr"
                />
                {error && <p className="text-red-500 text-xs mt-2 font-bold">كلمة المرور غير صحيحة</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-yellow-700 font-bold shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>دخول</span>
                  <ChevronRight size={16} className="rotate-180" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};