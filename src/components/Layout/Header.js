import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic, 
  faHome, 
  faCalendarWeek, 
  faShuffle,
  faUser,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions } = useApp();
  const { currentUser, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isActive = (path) => {
    if (path === '/' || path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleRandomStandard = () => {
    const randomStandard = actions.getRandomStandard();
    navigate(`/standard/${randomStandard.id}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (!currentUser) return '';
    return currentUser.displayName || 
           currentUser.email || 
           (currentUser.isAnonymous ? 'Guest' : 'User');
  };

  return (
    <header className="main-header">
      <nav className="nav-container">
        <div className="logo" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faMusic} />
          <span>Jazz Standards</span>
        </div>
        
        <div className="nav-controls">
          <button 
            className={`nav-btn ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
            title="Dashboard"
          >
            <FontAwesomeIcon icon={faHome} />
          </button>
          
          <button 
            className={`nav-btn ${isActive('/week-planner') ? 'active' : ''}`}
            onClick={() => navigate('/week-planner')}
            title="Week Planner"
          >
            <FontAwesomeIcon icon={faCalendarWeek} />
          </button>
          
          <button 
            className="nav-btn"
            onClick={handleRandomStandard}
            title="Random Standard"
          >
            <FontAwesomeIcon icon={faShuffle} />
          </button>

          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">{getUserDisplayName()}</span>
              <button 
                className="nav-btn"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          ) : (
            <button 
              className="nav-btn auth-btn"
              onClick={() => setShowAuthModal(true)}
              title="Sign In"
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
          )}
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </nav>
    </header>
  );
};

export default Header;