import React, { useState } from 'react';
import FaceIdLogin from './FaceIdLogin';
import FaceIdSignup from './FaceIdSignup';
import LandingPage from './LandingPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'signup'
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  const handleGetStarted = (selectedMode) => {
    setMode(selectedMode);
    setCurrentView(selectedMode);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'login':
        return (
          <div className="auth-container">
            <div className="auth-header">
              <button onClick={handleBackToLanding} className="back-btn">
                ← Back to Home
              </button>
              <h1 className="auth-title">Face ID Login</h1>
            </div>
            <FaceIdLogin />
          </div>
        );
      case 'signup':
        return (
          <div className="auth-container">
            <div className="auth-header">
              <button onClick={handleBackToLanding} className="back-btn">
                ← Back to Home
              </button>
              <h1 className="auth-title">Face ID Registration</h1>
            </div>
            <FaceIdSignup />
          </div>
        );
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="app">
      {renderCurrentView()}
    </div>
  );
}

export default App;
