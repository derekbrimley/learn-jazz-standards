import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faMusic,
  faClock,
  faBullseye,
  faChevronLeft,
  faChevronRight,
  faCalendarDay
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import './WeekPlanner.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeekPlanner = () => {
  const { state, actions } = useApp();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [newSession, setNewSession] = useState({
    standardId: '',
    duration: 30,
    focus: '',
    notes: '',
    completed: false
  });

  // Get the start of the current week (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getSessionsForDay = (date) => {
    const dateKey = getDateKey(date);
    return state.weekPlanner?.[dateKey] || [];
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const handleAddSession = (date) => {
    setSelectedDay(date);
    setNewSession({
      standardId: '',
      duration: 30,
      focus: '',
      notes: '',
      completed: false
    });
    setShowAddModal(true);
  };

  const handleEditSession = (session, date) => {
    setSelectedDay(date);
    setEditingSession(session);
    setNewSession({
      ...session
    });
    setShowAddModal(true);
  };

  const handleSaveSession = () => {
    if (!selectedDay || !newSession.standardId) return;

    const dateKey = getDateKey(selectedDay);
    const currentSessions = getSessionsForDay(selectedDay);

    let updatedSessions;
    if (editingSession) {
      // Update existing session
      updatedSessions = currentSessions.map(session => 
        session.id === editingSession.id ? { ...newSession, id: session.id } : session
      );
    } else {
      // Add new session
      const newSessionWithId = {
        ...newSession,
        id: Date.now()
      };
      updatedSessions = [...currentSessions, newSessionWithId];
    }

    actions.updateWeekPlanner(dateKey, updatedSessions);
    handleCloseModal();
  };

  const handleDeleteSession = (sessionId, date) => {
    const dateKey = getDateKey(date);
    const currentSessions = getSessionsForDay(date);
    const updatedSessions = currentSessions.filter(session => session.id !== sessionId);
    actions.updateWeekPlanner(dateKey, updatedSessions);
  };

  const handleToggleCompletion = (sessionId, date) => {
    const dateKey = getDateKey(date);
    const currentSessions = getSessionsForDay(date);
    const updatedSessions = currentSessions.map(session =>
      session.id === sessionId 
        ? { ...session, completed: !session.completed }
        : session
    );
    actions.updateWeekPlanner(dateKey, updatedSessions);

    // If marking as completed, update the standard's practice progress
    const session = currentSessions.find(s => s.id === sessionId);
    if (session && !session.completed) {
      const currentProgress = state.progressData[session.standardId] || {
        checklist: {},
        completionPercentage: 0,
        recordings: { reference: [], personal: [] },
        notes: '',
        lastPracticed: null
      };

      actions.updateProgress(session.standardId, {
        ...currentProgress,
        lastPracticed: new Date().toISOString()
      });
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSession(null);
    setSelectedDay(null);
    setNewSession({
      standardId: '',
      duration: 30,
      focus: '',
      notes: '',
      completed: false
    });
  };

  const getStandardTitle = (standardId) => {
    const standard = state.standards.find(s => s.id === standardId);
    return standard ? standard.title : 'Unknown Standard';
  };

  const getStandardComposer = (standardId) => {
    const standard = state.standards.find(s => s.id === standardId);
    return standard ? standard.composer : 'Unknown Composer';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const today = new Date();
    return date < today && !isToday(date);
  };

  const getTotalDuration = (sessions) => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  };

  const getCompletedCount = (sessions) => {
    return sessions.filter(session => session.completed).length;
  };

  return (
    <div className="week-planner">
      {/* Header */}
      <div className="planner-header">
        <div className="header-content">
          <h1>Practice Week Planner</h1>
          <div className="week-navigation">
            <button className="nav-btn" onClick={handlePreviousWeek}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="week-display">
              <span className="week-range">
                {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <button className="nav-btn" onClick={handleNextWeek}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button className="today-btn" onClick={handleToday}>
              <FontAwesomeIcon icon={faCalendarDay} />
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="week-grid">
        {weekDays.map((date, index) => {
          const sessions = getSessionsForDay(date);
          const totalDuration = getTotalDuration(sessions);
          const completedCount = getCompletedCount(sessions);
          
          return (
            <div 
              key={index} 
              className={`day-column ${isToday(date) ? 'today' : ''} ${isPast(date) ? 'past' : ''}`}
            >
              <div className="day-header">
                <div className="day-info">
                  <h3 className="day-name">{DAYS_OF_WEEK[index]}</h3>
                  <span className="day-date">{formatDate(date)}</span>
                </div>
                <div className="day-stats">
                  {sessions.length > 0 && (
                    <>
                      <span className="session-count">
                        {completedCount}/{sessions.length} complete
                      </span>
                      <span className="total-duration">
                        {totalDuration} min
                      </span>
                    </>
                  )}
                </div>
                <button 
                  className="add-session-btn"
                  onClick={() => handleAddSession(date)}
                  title="Add Practice Session"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>

              <div className="sessions-list">
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`session-card ${session.completed ? 'completed' : ''}`}
                  >
                    <div className="session-header">
                      <button
                        className={`completion-toggle ${session.completed ? 'completed' : ''}`}
                        onClick={() => handleToggleCompletion(session.id, date)}
                        title={session.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        <FontAwesomeIcon icon={session.completed ? faCheck : faTimes} />
                      </button>
                      
                      <div className="session-info">
                        <div className="session-standard">
                          {getStandardTitle(session.standardId)}
                        </div>
                        <div className="session-composer">
                          by {getStandardComposer(session.standardId)}
                        </div>
                      </div>

                      <div className="session-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditSession(session, date)}
                          title="Edit session"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteSession(session.id, date)}
                          title="Delete session"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    <div className="session-details">
                      <div className="session-meta">
                        <span className="duration">
                          <FontAwesomeIcon icon={faClock} />
                          {session.duration} min
                        </span>
                        {session.focus && (
                          <span className="focus">
                            <FontAwesomeIcon icon={faBullseye} />
                            {session.focus}
                          </span>
                        )}
                      </div>
                      {session.notes && (
                        <div className="session-notes">{session.notes}</div>
                      )}
                    </div>
                  </div>
                ))}

                {sessions.length === 0 && (
                  <div className="empty-day">
                    <FontAwesomeIcon icon={faMusic} />
                    <span>No practice sessions planned</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Session Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingSession ? 'Edit Practice Session' : 'Add Practice Session'}
              </h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Standard</label>
                <select
                  value={newSession.standardId}
                  onChange={(e) => setNewSession({...newSession, standardId: e.target.value})}
                  required
                >
                  <option value="">Select a standard...</option>
                  {state.standards.map((standard) => (
                    <option key={standard.id} value={standard.id}>
                      {standard.title} - {standard.composer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  step="5"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Practice Focus</label>
                <input
                  type="text"
                  value={newSession.focus}
                  onChange={(e) => setNewSession({...newSession, focus: e.target.value})}
                  placeholder="e.g., Learn melody, Work on improvisation, Practice comping..."
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  placeholder="Any specific notes or reminders for this session..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleSaveSession}
                disabled={!newSession.standardId}
              >
                {editingSession ? 'Update Session' : 'Add Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekPlanner;