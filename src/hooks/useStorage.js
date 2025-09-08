import { useState, useEffect, useCallback } from 'react';

// IndexedDB storage hook for React
export const useIndexedDB = () => {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const dbName = 'JazzStandardsReactDB';
  const dbVersion = 1;

  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = () => {
          setError('Failed to open database');
          console.error('IndexedDB error:', request.error);
        };

        request.onsuccess = () => {
          setDb(request.result);
          setIsReady(true);
          console.log('IndexedDB initialized successfully');
        };

        request.onupgradeneeded = (event) => {
          const database = event.target.result;

          // Create object stores
          if (!database.objectStoreNames.contains('recordings')) {
            const recordingStore = database.createObjectStore('recordings', {
              keyPath: 'id',
              autoIncrement: true
            });
            recordingStore.createIndex('standardId', 'standardId', { unique: false });
            recordingStore.createIndex('type', 'type', { unique: false });
          }

          if (!database.objectStoreNames.contains('notes')) {
            const notesStore = database.createObjectStore('notes', {
              keyPath: 'id',
              autoIncrement: true
            });
            notesStore.createIndex('standardId', 'standardId', { unique: false });
            notesStore.createIndex('date', 'date', { unique: false });
          }

          if (!database.objectStoreNames.contains('progress')) {
            database.createObjectStore('progress', {
              keyPath: 'standardId'
            });
          }
        };
      } catch (err) {
        setError(err.message);
        console.error('Failed to initialize IndexedDB:', err);
      }
    };

    initDB();
  }, []);

  const addRecord = useCallback(async (storeName, data) => {
    if (!db) throw new Error('Database not ready');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  const updateRecord = useCallback(async (storeName, data) => {
    if (!db) throw new Error('Database not ready');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  const getRecord = useCallback(async (storeName, key) => {
    if (!db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  const getAllRecords = useCallback(async (storeName) => {
    if (!db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  const getRecordsByIndex = useCallback(async (storeName, indexName, value) => {
    if (!db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  const deleteRecord = useCallback(async (storeName, key) => {
    if (!db) throw new Error('Database not ready');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  return {
    isReady,
    error,
    addRecord,
    updateRecord,
    getRecord,
    getAllRecords,
    getRecordsByIndex,
    deleteRecord
  };
};

// LocalStorage hook for preferences
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Progress tracking hook
export const useProgress = () => {
  const { isReady, getRecord, updateRecord, getAllRecords } = useIndexedDB();
  const [progressData, setProgressData] = useState({});

  const getProgress = useCallback(async (standardId) => {
    if (!isReady) return null;
    try {
      const progress = await getRecord('progress', standardId);
      return progress || {
        standardId,
        checklist: {},
        completionPercentage: 0,
        lastUpdated: null
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }, [isReady, getRecord]);

  const saveProgress = useCallback(async (standardId, progressUpdate) => {
    if (!isReady) return;
    
    try {
      const checklist = progressUpdate.checklist || {};
      const completionPercentage = calculateCompletion(checklist);
      
      const progress = {
        standardId,
        checklist,
        completionPercentage,
        lastUpdated: new Date(),
        ...progressUpdate
      };

      await updateRecord('progress', progress);
      setProgressData(prev => ({
        ...prev,
        [standardId]: progress
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [isReady, updateRecord]);

  const getAllProgress = useCallback(async () => {
    if (!isReady) return [];
    try {
      return await getAllRecords('progress');
    } catch (error) {
      console.error('Error getting all progress:', error);
      return [];
    }
  }, [isReady, getAllRecords]);

  const calculateCompletion = (checklist) => {
    const items = Object.values(checklist);
    if (items.length === 0) return 0;
    const completed = items.filter(Boolean).length;
    return Math.round((completed / items.length) * 100);
  };

  return {
    getProgress,
    saveProgress,
    getAllProgress,
    progressData
  };
};

// Notes hook
export const useNotes = () => {
  const { isReady, addRecord, getRecordsByIndex, deleteRecord } = useIndexedDB();

  const saveNote = useCallback(async (standardId, content) => {
    if (!isReady) return null;
    
    try {
      const note = {
        standardId,
        content,
        date: new Date(),
        id: Date.now()
      };
      
      return await addRecord('notes', note);
    } catch (error) {
      console.error('Error saving note:', error);
      return null;
    }
  }, [isReady, addRecord]);

  const getNotes = useCallback(async (standardId) => {
    if (!isReady) return [];
    
    try {
      const notes = await getRecordsByIndex('notes', 'standardId', standardId);
      return notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }, [isReady, getRecordsByIndex]);

  const deleteNote = useCallback(async (id) => {
    if (!isReady) return;
    
    try {
      await deleteRecord('notes', id);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [isReady, deleteRecord]);

  return {
    saveNote,
    getNotes,
    deleteNote
  };
};

// Recordings hook
export const useRecordings = () => {
  const { isReady, addRecord, getRecordsByIndex, deleteRecord } = useIndexedDB();

  const saveRecording = useCallback(async (standardId, file, metadata = {}) => {
    if (!isReady) return null;
    
    try {
      const fileData = await fileToArrayBuffer(file);
      
      const recording = {
        standardId,
        type: 'personal',
        filename: file.name,
        fileData,
        mimeType: file.type,
        size: file.size,
        uploadDate: new Date(),
        title: metadata.title || file.name,
        description: metadata.description || '',
        ...metadata
      };

      return await addRecord('recordings', recording);
    } catch (error) {
      console.error('Error saving recording:', error);
      return null;
    }
  }, [isReady, addRecord]);

  const saveFavoriteRecording = useCallback(async (standardId, recordingData) => {
    if (!isReady) return null;
    
    try {
      const recording = {
        standardId,
        type: 'favorite',
        artist: recordingData.artist,
        album: recordingData.album,
        year: recordingData.year,
        links: recordingData.links || {},
        notes: recordingData.notes || '',
        addedDate: new Date(),
        ...recordingData
      };

      return await addRecord('recordings', recording);
    } catch (error) {
      console.error('Error saving favorite recording:', error);
      return null;
    }
  }, [isReady, addRecord]);

  const getRecordings = useCallback(async (standardId, type = null) => {
    if (!isReady) return [];
    
    try {
      const recordings = await getRecordsByIndex('recordings', 'standardId', standardId);
      return type ? recordings.filter(r => r.type === type) : recordings;
    } catch (error) {
      console.error('Error getting recordings:', error);
      return [];
    }
  }, [isReady, getRecordsByIndex]);

  const deleteRecording = useCallback(async (id) => {
    if (!isReady) return;
    
    try {
      await deleteRecord('recordings', id);
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  }, [isReady, deleteRecord]);

  // Utility function
  const fileToArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const arrayBufferToUrl = (arrayBuffer, mimeType) => {
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
  };

  return {
    saveRecording,
    saveFavoriteRecording,
    getRecordings,
    deleteRecording,
    arrayBufferToUrl
  };
};