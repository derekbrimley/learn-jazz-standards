import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faThLarge, 
  faList
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import StandardCard from './StandardCard';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (value) => {
    setSearchInput(value);
    actions.setSearchQuery(value);
  };

  const handleStandardClick = (standardId) => {
    navigate(`/standard/${standardId}`);
  };

  const progressStats = actions.getProgressStats();
  const filteredStandards = actions.getFilteredStandards();

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Your Jazz Standards Journey</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{progressStats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{progressStats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{progressStats.total}</div>
            <div className="stat-label">Total Standards</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search standards..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${state.viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => actions.setViewMode('grid')}
          >
            <FontAwesomeIcon icon={faThLarge} />
          </button>
          <button
            className={`view-btn ${state.viewMode === 'list' ? 'active' : ''}`}
            onClick={() => actions.setViewMode('list')}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>

        <div className="filter-controls">
          <select
            value={state.selectedDifficulty}
            onChange={(e) => actions.setDifficultyFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={state.selectedStyle}
            onChange={(e) => actions.setStyleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Styles</option>
            <option value="swing">Swing</option>
            <option value="ballad">Ballad</option>
            <option value="bebop">Bebop</option>
            <option value="blues">Blues</option>
            <option value="bossa nova">Bossa Nova</option>
            <option value="latin">Latin</option>
            <option value="modal">Modal</option>
            <option value="hard bop">Hard Bop</option>
            <option value="post-bop">Post-Bop</option>
          </select>
        </div>
      </div>

      {/* Standards Grid/List */}
      <div className={`standards-container ${state.viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
        {state.isLoading ? (
          <div className="loading-spinner"></div>
        ) : filteredStandards.length === 0 ? (
          <div className="empty-state">
            <h3>No standards found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredStandards.map((standard) => (
            <StandardCard
              key={standard.id}
              standard={standard}
              progress={state.progressData[standard.id]}
              viewMode={state.viewMode}
              onClick={() => handleStandardClick(standard.id)}
            />
          ))
        )}
      </div>

      {state.error && (
        <div className="error-banner">
          <p>Error: {state.error}</p>
          <button onClick={actions.clearError}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;