import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { standardsAPI } from '../data/standards';
import { useLocalStorage, useProgress } from '../hooks/useStorage';

// Initial state
const initialState = {
  standards: [],
  currentStandard: null,
  searchQuery: '',
  selectedDifficulty: 'all',
  selectedStyle: 'all',
  viewMode: 'grid',
  isLoading: false,
  error: null,
  progressData: {},
  weekPlanner: {},
  preferences: {
    theme: 'light',
    defaultPracticeVariation: 'basic',
    notifications: true,
    autoSave: true
  }
};

// Action types
const actionTypes = {
  SET_STANDARDS: 'SET_STANDARDS',
  SET_CURRENT_STANDARD: 'SET_CURRENT_STANDARD',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_DIFFICULTY_FILTER: 'SET_DIFFICULTY_FILTER',
  SET_STYLE_FILTER: 'SET_STYLE_FILTER',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_PROGRESS_DATA: 'SET_PROGRESS_DATA',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_WEEK_PLANNER: 'UPDATE_WEEK_PLANNER',
  SET_WEEK_PLANNER_DATA: 'SET_WEEK_PLANNER_DATA',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STANDARDS:
      return {
        ...state,
        standards: action.payload,
        isLoading: false
      };
    
    case actionTypes.SET_CURRENT_STANDARD:
      return {
        ...state,
        currentStandard: action.payload
      };
    
    case actionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };
    
    case actionTypes.SET_DIFFICULTY_FILTER:
      return {
        ...state,
        selectedDifficulty: action.payload
      };
    
    case actionTypes.SET_STYLE_FILTER:
      return {
        ...state,
        selectedStyle: action.payload
      };
    
    case actionTypes.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case actionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        progressData: {
          ...state.progressData,
          [action.payload.standardId]: action.payload.progress
        }
      };
    
    case actionTypes.SET_PROGRESS_DATA:
      return {
        ...state,
        progressData: action.payload
      };
    
    case actionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    
    case actionTypes.UPDATE_WEEK_PLANNER:
      return {
        ...state,
        weekPlanner: {
          ...state.weekPlanner,
          [action.payload.dateKey]: action.payload.sessions
        }
      };
    
    case actionTypes.SET_WEEK_PLANNER_DATA:
      return {
        ...state,
        weekPlanner: action.payload
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [preferences, setPreferences] = useLocalStorage('userPreferences', initialState.preferences);
  const [weekPlannerData, setWeekPlannerData] = useLocalStorage('weekPlanner', {});
  const { getAllProgress } = useProgress();

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        
        // Load standards
        const standards = standardsAPI.getAll();
        dispatch({ type: actionTypes.SET_STANDARDS, payload: standards });
        
        // Load user preferences
        dispatch({ type: actionTypes.UPDATE_PREFERENCES, payload: preferences });
        dispatch({ type: actionTypes.SET_VIEW_MODE, payload: preferences.viewMode || 'grid' });
        
        // Load week planner data
        dispatch({ type: actionTypes.SET_WEEK_PLANNER_DATA, payload: weekPlannerData });
        
        // Load progress data
        try {
          const progressData = await getAllProgress();
          const progressLookup = {};
          progressData.forEach(progress => {
            progressLookup[progress.standardId] = progress;
          });
          dispatch({ type: actionTypes.SET_PROGRESS_DATA, payload: progressLookup });
        } catch (error) {
          console.warn('Could not load progress data:', error);
        }
        
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };

    initializeApp();
  }, [preferences, weekPlannerData, getAllProgress]);

  // Actions
  const actions = {
    setCurrentStandard: (standard) => {
      dispatch({ type: actionTypes.SET_CURRENT_STANDARD, payload: standard });
    },
    
    setSearchQuery: (query) => {
      dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: query });
    },
    
    setDifficultyFilter: (difficulty) => {
      dispatch({ type: actionTypes.SET_DIFFICULTY_FILTER, payload: difficulty });
    },
    
    setStyleFilter: (style) => {
      dispatch({ type: actionTypes.SET_STYLE_FILTER, payload: style });
    },
    
    setViewMode: (mode) => {
      dispatch({ type: actionTypes.SET_VIEW_MODE, payload: mode });
      const updatedPrefs = { ...preferences, viewMode: mode };
      setPreferences(updatedPrefs);
      dispatch({ type: actionTypes.UPDATE_PREFERENCES, payload: updatedPrefs });
    },
    
    updateProgress: (standardId, progress) => {
      dispatch({ 
        type: actionTypes.UPDATE_PROGRESS, 
        payload: { standardId, progress } 
      });
    },
    
    updatePreferences: (newPrefs) => {
      const updatedPrefs = { ...preferences, ...newPrefs };
      setPreferences(updatedPrefs);
      dispatch({ type: actionTypes.UPDATE_PREFERENCES, payload: updatedPrefs });
    },
    
    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    },
    
    getRandomStandard: () => {
      return standardsAPI.getRandom();
    },
    
    getFilteredStandards: () => {
      let filtered = state.standards;
      
      // Apply search filter
      if (state.searchQuery) {
        filtered = standardsAPI.search(state.searchQuery);
      }
      
      // Apply difficulty filter
      if (state.selectedDifficulty !== 'all') {
        filtered = filtered.filter(s => s.difficulty === state.selectedDifficulty);
      }
      
      // Apply style filter
      if (state.selectedStyle !== 'all') {
        filtered = filtered.filter(s => s.style === state.selectedStyle);
      }
      
      return filtered;
    },
    
    getStandardById: (id) => {
      return standardsAPI.getById(id);
    },
    
    getProgressStats: () => {
      const allProgress = Object.values(state.progressData);
      const completed = allProgress.filter(p => p.completionPercentage === 100).length;
      const inProgress = allProgress.filter(p => p.completionPercentage > 0 && p.completionPercentage < 100).length;
      const total = state.standards.length;
      
      return { completed, inProgress, total };
    },

    updateWeekPlanner: (dateKey, sessions) => {
      const updatedData = {
        ...weekPlannerData,
        [dateKey]: sessions
      };
      setWeekPlannerData(updatedData);
      dispatch({ 
        type: actionTypes.UPDATE_WEEK_PLANNER, 
        payload: { dateKey, sessions } 
      });
    },

    getWeekPlannerSessions: (dateKey) => {
      return state.weekPlanner[dateKey] || [];
    }
  };

  const value = {
    state,
    actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;