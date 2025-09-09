import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService, migrationService } from './firebaseService';

export const authService = {
  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Create account with email and password
  async createAccount(email, password, displayName = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user document in Firestore
      await userService.createUser(user.uid, {
        email: user.email,
        displayName: displayName || user.email,
        preferences: {
          theme: 'light',
          defaultPracticeVariation: 'basic',
          notifications: true,
          autoSave: true
        },
        weekPlanner: {}
      });

      return user;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // Sign in anonymously (for users who don't want to create an account)
  async signInAnonymously() {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Create anonymous user document
      await userService.createUser(user.uid, {
        isAnonymous: true,
        displayName: 'Anonymous User',
        preferences: {
          theme: 'light',
          defaultPracticeVariation: 'basic',
          notifications: true,
          autoSave: true
        },
        weekPlanner: {}
      });

      // Try to migrate localStorage data if it exists
      try {
        await migrationService.migrateLocalStorageToFirestore(user.uid);
      } catch (migrationError) {
        console.warn('Could not migrate local data:', migrationError);
      }

      return user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Convert anonymous account to permanent account
  async upgradeAnonymousAccount(email, password) {
    try {
      const user = auth.currentUser;
      if (!user || !user.isAnonymous) {
        throw new Error('No anonymous user to upgrade');
      }

      // This would require additional setup with credential linking
      // For now, we'll create a new account and migrate data
      const newUser = await this.createAccount(email, password);
      
      // Here you would migrate the anonymous user's data to the new account
      // This is a simplified version - you might want more sophisticated data merging
      
      return newUser;
    } catch (error) {
      console.error('Error upgrading anonymous account:', error);
      throw error;
    }
  }
};