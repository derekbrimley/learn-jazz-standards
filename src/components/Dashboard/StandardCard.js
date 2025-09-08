import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faKey, 
  faClock, 
  faSignal
} from '@fortawesome/free-solid-svg-icons';
import { PRACTICE_CHECKLIST_ITEMS } from '../../data/standards';

const StandardCard = ({ standard, progress, viewMode, onClick }) => {
  const progressPercentage = progress?.completionPercentage || 0;
  const completedItems = progress?.checklist ? 
    Object.values(progress.checklist).filter(Boolean).length : 0;
  const totalItems = PRACTICE_CHECKLIST_ITEMS.length;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="standard-card list-view" onClick={onClick}>
        <div className="standard-info">
          <div className="standard-title">{standard.title}</div>
          <div className="standard-composer">by {standard.composer}</div>
        </div>
        
        <div className="standard-meta">
          <div className="meta-item">
            <FontAwesomeIcon icon={faKey} />
            <span>{standard.key}</span>
          </div>
          <div className="meta-item">
            <FontAwesomeIcon icon={faClock} />
            <span>{standard.timeSignature}</span>
          </div>
          <div className="meta-item">
            <FontAwesomeIcon 
              icon={faSignal} 
              style={{ color: getDifficultyColor(standard.difficulty) }}
            />
            <span>{standard.difficulty}</span>
          </div>
        </div>

        <div className="progress-info">
          <div className="progress-text">
            {completedItems}/{totalItems} completed
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="standard-card grid-view" onClick={onClick}>
      <div className="card-header">
        <div className="standard-title">{standard.title}</div>
        <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(standard.difficulty) }}>
          {standard.difficulty}
        </div>
      </div>
      
      <div className="standard-composer">by {standard.composer}</div>
      
      <div className="standard-style">{standard.style}</div>

      <div className="standard-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">{progressPercentage}%</div>
      </div>

      <div className="standard-meta">
        <div className="meta-item">
          <FontAwesomeIcon icon={faKey} />
          <span>{standard.key}</span>
        </div>
        <div className="meta-item">
          <FontAwesomeIcon icon={faClock} />
          <span>{standard.timeSignature}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="completion-count">
          {completedItems}/{totalItems} tasks
        </div>
        {progressPercentage === 100 && (
          <div className="completion-badge">
            ✓ Complete
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardCard;