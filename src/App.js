import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Components
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import StandardPage from './components/StandardPage/StandardPage';
import WeekPlanner from './components/WeekPlanner/WeekPlanner';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Header />
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/standard/:id" element={<StandardPage />} />
                <Route path="/week-planner" element={<WeekPlanner />} />
              </Routes>
            </main>

            <AudioPlayer />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
