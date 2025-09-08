import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faPlay,
  faPause,
  faHeart,
  faKey,
  faClock,
  faSignal,
  faMusic,
  faUser,
  faCalendarDays,
  faGuitar,
  faMicrophone,
  faRecordVinyl,
  faPlus,
  faEdit,
  faTrash,
  faCheckCircle,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import { PRACTICE_CHECKLIST_ITEMS } from '../../data/standards';
import './StandardPage.css';

const StandardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [newRecording, setNewRecording] = useState({ artist: '', url: '', type: 'reference' });
  const [showAddRecording, setShowAddRecording] = useState(false);

  const standard = state.standards.find(s => s.id === id);
  const progress = state.progressData[id] || { 
    checklist: {}, 
    completionPercentage: 0, 
    recordings: { reference: [], personal: [] },
    notes: '',
    lastPracticed: null
  };

  useEffect(() => {
    if (!standard) {
      navigate('/dashboard');
    }
  }, [standard, navigate]);

  if (!standard) {
    return <div className="loading-spinner"></div>;
  }

  const handleChecklistToggle = (item) => {
    actions.updateProgress(id, {
      ...progress,
      checklist: {
        ...progress.checklist,
        [item]: !progress.checklist[item]
      }
    });
  };

  const handleAddRecording = () => {
    if (newRecording.artist && newRecording.url) {
      const updatedRecordings = {
        ...progress.recordings,
        [newRecording.type]: [
          ...progress.recordings[newRecording.type],
          { ...newRecording, id: Date.now() }
        ]
      };
      
      actions.updateProgress(id, {
        ...progress,
        recordings: updatedRecordings
      });
      
      setNewRecording({ artist: '', url: '', type: 'reference' });
      setShowAddRecording(false);
    }
  };

  const handleDeleteRecording = (type, recordingId) => {
    const updatedRecordings = {
      ...progress.recordings,
      [type]: progress.recordings[type].filter(r => r.id !== recordingId)
    };
    
    actions.updateProgress(id, {
      ...progress,
      recordings: updatedRecordings
    });
  };

  const handleNotesUpdate = (notes) => {
    actions.updateProgress(id, {
      ...progress,
      notes
    });
  };

  const markAsPracticed = () => {
    actions.updateProgress(id, {
      ...progress,
      lastPracticed: new Date().toISOString()
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const completedItems = Object.values(progress.checklist).filter(Boolean).length;
  const progressPercentage = Math.round((completedItems / PRACTICE_CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="standard-page">
      {/* Header */}
      <div className="standard-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </button>
        
        <div className="standard-info">
          <h1 className="standard-title">{standard.title}</h1>
          <div className="standard-meta">
            <span className="composer">by {standard.composer}</span>
            <div className="meta-tags">
              <span className="meta-tag">
                <FontAwesomeIcon icon={faKey} />
                {standard.key}
              </span>
              <span className="meta-tag">
                <FontAwesomeIcon icon={faClock} />
                {standard.timeSignature}
              </span>
              <span className="meta-tag" style={{ color: getDifficultyColor(standard.difficulty) }}>
                <FontAwesomeIcon icon={faSignal} />
                {standard.difficulty}
              </span>
              <span className="meta-tag style-tag">
                {standard.style}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="practice-btn" onClick={markAsPracticed}>
            <FontAwesomeIcon icon={faMusic} />
            Mark as Practiced
          </button>
          <button className="favorite-btn">
            <FontAwesomeIcon icon={faHeart} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span>Progress: {completedItems}/{PRACTICE_CHECKLIST_ITEMS.length} completed</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          Practice
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recordings' ? 'active' : ''}`}
          onClick={() => setActiveTab('recordings')}
        >
          Recordings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'variations' ? 'active' : ''}`}
          onClick={() => setActiveTab('variations')}
        >
          Variations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="standard-details">
              <div className="detail-section">
                <h3>Song Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Composer</label>
                    <span>{standard.composer}</span>
                  </div>
                  <div className="info-item">
                    <label>Year</label>
                    <span>{standard.year || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <label>Key</label>
                    <span>{standard.key}</span>
                  </div>
                  <div className="info-item">
                    <label>Time Signature</label>
                    <span>{standard.timeSignature}</span>
                  </div>
                  <div className="info-item">
                    <label>Style</label>
                    <span>{standard.style}</span>
                  </div>
                  <div className="info-item">
                    <label>Difficulty</label>
                    <span style={{ color: getDifficultyColor(standard.difficulty) }}>
                      {standard.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Chord Progression</h3>
                <div className="chord-display">
                  {standard.chordProgression ? (
                    <div className="chord-progression">
                      {standard.chordProgression}
                    </div>
                  ) : (
                    <p className="no-data">Chord progression not available</p>
                  )}
                </div>
              </div>

              {standard.lyrics && (
                <div className="detail-section">
                  <h3>Lyrics</h3>
                  <div className="lyrics-display">
                    <pre>{standard.lyrics}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="practice-tab">
            <div className="practice-checklist">
              <h3>Practice Checklist</h3>
              <div className="checklist-items">
                {PRACTICE_CHECKLIST_ITEMS.map((item) => (
                  <div key={item} className="checklist-item">
                    <button
                      className={`checkbox ${progress.checklist[item] ? 'checked' : ''}`}
                      onClick={() => handleChecklistToggle(item)}
                    >
                      <FontAwesomeIcon 
                        icon={progress.checklist[item] ? faCheckCircle : faCircle} 
                      />
                    </button>
                    <span className="item-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="practice-stats">
              <h3>Practice Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <label>Last Practiced</label>
                  <span>
                    {progress.lastPracticed 
                      ? new Date(progress.lastPracticed).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="stat-item">
                  <label>Completion</label>
                  <span>{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recordings' && (
          <div className="recordings-tab">
            <div className="recordings-section">
              <div className="section-header">
                <h3>Reference Recordings</h3>
                <button 
                  className="add-btn"
                  onClick={() => { setNewRecording({...newRecording, type: 'reference'}); setShowAddRecording(true); }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Recording
                </button>
              </div>
              <div className="recordings-list">
                {progress.recordings.reference.map((recording) => (
                  <div key={recording.id} className="recording-item">
                    <div className="recording-info">
                      <span className="artist">{recording.artist}</span>
                      <a href={recording.url} target="_blank" rel="noopener noreferrer" className="recording-link">
                        Listen
                      </a>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteRecording('reference', recording.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
                {progress.recordings.reference.length === 0 && (
                  <p className="no-recordings">No reference recordings added yet</p>
                )}
              </div>
            </div>

            <div className="recordings-section">
              <div className="section-header">
                <h3>Personal Recordings</h3>
                <button 
                  className="add-btn"
                  onClick={() => { setNewRecording({...newRecording, type: 'personal'}); setShowAddRecording(true); }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Recording
                </button>
              </div>
              <div className="recordings-list">
                {progress.recordings.personal.map((recording) => (
                  <div key={recording.id} className="recording-item">
                    <div className="recording-info">
                      <span className="artist">{recording.artist}</span>
                      <a href={recording.url} target="_blank" rel="noopener noreferrer" className="recording-link">
                        Listen
                      </a>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteRecording('personal', recording.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
                {progress.recordings.personal.length === 0 && (
                  <p className="no-recordings">No personal recordings added yet</p>
                )}
              </div>
            </div>

            {showAddRecording && (
              <div className="add-recording-modal">
                <div className="modal-content">
                  <h3>Add New Recording</h3>
                  <div className="form-group">
                    <label>Artist/Description</label>
                    <input
                      type="text"
                      value={newRecording.artist}
                      onChange={(e) => setNewRecording({...newRecording, artist: e.target.value})}
                      placeholder="Artist name or description"
                    />
                  </div>
                  <div className="form-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={newRecording.url}
                      onChange={(e) => setNewRecording({...newRecording, url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      value={newRecording.type}
                      onChange={(e) => setNewRecording({...newRecording, type: e.target.value})}
                    >
                      <option value="reference">Reference Recording</option>
                      <option value="personal">Personal Recording</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button onClick={handleAddRecording} className="save-btn">Add Recording</button>
                    <button onClick={() => setShowAddRecording(false)} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'variations' && (
          <div className="variations-tab">
            <h3>Practice Variations</h3>
            <div className="variations-grid">
              <div className="variation-card">
                <h4>Rhythm Variations</h4>
                <ul>
                  <li>Swing eighths</li>
                  <li>Straight eighths</li>
                  <li>Half-time feel</li>
                  <li>Double-time feel</li>
                </ul>
              </div>
              <div className="variation-card">
                <h4>Harmonic Variations</h4>
                <ul>
                  <li>Basic triads</li>
                  <li>7th chords</li>
                  <li>Extensions (9ths, 11ths, 13ths)</li>
                  <li>Alterations</li>
                </ul>
              </div>
              <div className="variation-card">
                <h4>Style Variations</h4>
                <ul>
                  <li>Ballad style</li>
                  <li>Up-tempo swing</li>
                  <li>Bossa nova feel</li>
                  <li>Funk/fusion approach</li>
                </ul>
              </div>
              <div className="variation-card">
                <h4>Technical Exercises</h4>
                <ul>
                  <li>Scales over changes</li>
                  <li>Chord tone targeting</li>
                  <li>Voice leading</li>
                  <li>Reharmonization</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-tab">
            <h3>Personal Notes</h3>
            <textarea
              className="notes-textarea"
              value={progress.notes}
              onChange={(e) => handleNotesUpdate(e.target.value)}
              placeholder="Add your practice notes, observations, and insights here..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardPage;