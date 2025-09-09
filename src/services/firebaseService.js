import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// User Progress Service
export const progressService = {
  // Save user progress for a specific standard
  async saveProgress(userId, standardId, progressData) {
    try {
      const progressRef = doc(db, 'users', userId, 'progress', standardId);
      await setDoc(progressRef, {
        ...progressData,
        standardId,
        updatedAt: new Date()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  },

  // Get user progress for a specific standard
  async getProgress(userId, standardId) {
    try {
      const progressRef = doc(db, 'users', userId, 'progress', standardId);
      const progressSnap = await getDoc(progressRef);
      return progressSnap.exists() ? progressSnap.data() : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  },

  // Get all progress for a user
  async getAllProgress(userId) {
    try {
      const progressCollection = collection(db, 'users', userId, 'progress');
      const progressSnap = await getDocs(progressCollection);
      const progressData = {};
      
      progressSnap.forEach((doc) => {
        progressData[doc.id] = doc.data();
      });
      
      return progressData;
    } catch (error) {
      console.error('Error getting all progress:', error);
      throw error;
    }
  },

  // Delete progress for a standard
  async deleteProgress(userId, standardId) {
    try {
      const progressRef = doc(db, 'users', userId, 'progress', standardId);
      await deleteDoc(progressRef);
      return true;
    } catch (error) {
      console.error('Error deleting progress:', error);
      throw error;
    }
  }
};

// User Preferences Service
export const preferencesService = {
  // Save user preferences
  async savePreferences(userId, preferences) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        preferences: preferences,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },

  // Get user preferences
  async getPreferences(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data().preferences : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }
};

// Week Planner Service
export const weekPlannerService = {
  // Save week planner data
  async saveWeekPlannerData(userId, weekPlannerData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        weekPlanner: weekPlannerData,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error saving week planner data:', error);
      throw error;
    }
  },

  // Get week planner data
  async getWeekPlannerData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data().weekPlanner : {};
    } catch (error) {
      console.error('Error getting week planner data:', error);
      throw error;
    }
  }
};

// User Management Service
export const userService = {
  // Create or update user document
  async createUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user data
  async getUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
};

// Migration service to move localStorage data to Firestore
export const migrationService = {
  async migrateLocalStorageToFirestore(userId) {
    try {
      // Get data from localStorage
      const localProgress = localStorage.getItem('userProgress');
      const localPreferences = localStorage.getItem('userPreferences');
      const localWeekPlanner = localStorage.getItem('weekPlanner');

      // Migrate progress data
      if (localProgress) {
        const progressData = JSON.parse(localProgress);
        for (const [standardId, progress] of Object.entries(progressData)) {
          await progressService.saveProgress(userId, standardId, progress);
        }
      }

      // Migrate preferences
      if (localPreferences) {
        const preferences = JSON.parse(localPreferences);
        await preferencesService.savePreferences(userId, preferences);
      }

      // Migrate week planner data
      if (localWeekPlanner) {
        const weekPlannerData = JSON.parse(localWeekPlanner);
        await weekPlannerService.saveWeekPlannerData(userId, weekPlannerData);
      }

      console.log('Migration to Firestore completed successfully');
      return true;
    } catch (error) {
      console.error('Error migrating data:', error);
      throw error;
    }
  }
};