import React from 'react';
import { ClipboardList, UserPlus, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'form' | 'list';
  onNavigate: (view: 'form' | 'list') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
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
              onClick={() => onNavigate('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-bold ${
                currentView === 'list' 
                  ? 'bg-brand-gold text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ClipboardList size={18} />
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
    </div>
  );
};
