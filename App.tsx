import React, { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';

type View = 'form' | 'list';

function App() {
  const [currentView, setCurrentView] = useState<View>('form');

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'form' ? <PatientForm /> : <PatientList />}
    </AppLayout>
  );
}

export default App;