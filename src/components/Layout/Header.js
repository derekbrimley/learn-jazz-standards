import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic, 
  faHome, 
  faCalendarWeek, 
  faShuffle
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions } = useApp();

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
        </div>
      </nav>
    </header>
  );
};

export default Header;