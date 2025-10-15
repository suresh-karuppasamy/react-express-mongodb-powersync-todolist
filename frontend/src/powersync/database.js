// IndexedDB implementation for local storage when PowerSync is off
// MongoDB sync when PowerSync is on

let db = null;
let dbInitialized = false;
const DB_NAME = 'UserManagementDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

// Initialize IndexedDB
export const initializePowerSync = async () => {
  try {
    console.log('Initializing local storage database...');
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('Failed to open database');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        db = request.result;
        dbInitialized = true;
        console.log('Database opened successfully');
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('age', 'age', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        console.log('Database schema created/updated');
      };
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Check if database is initialized
const ensureDatabaseInitialized = () => {
  if (!dbInitialized || !db) {
    throw new Error('Database not initialized. Please call initializePowerSync() first.');
  }
};

// Helper functions for IndexedDB operations
const dbOperation = (operation) => {
  return new Promise((resolve, reject) => {
    ensureDatabaseInitialized();
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = operation(store);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// PowerSync helper functions for local operations
export const powerSyncHelpers = {
  // Insert a new user
  async insertUser(userData) {
    try {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const user = {
        id,
        _id: id, // For compatibility with existing code
        name: userData.name,
        age: userData.age,
        createdAt: now,
        updatedAt: now,
        _deleted: false
      };
      
      await dbOperation(store => store.add(user));
      
      console.log('User inserted locally:', id);
      return user;
    } catch (error) {
      console.error('Error inserting user:', error);
      throw error;
    }
  },

  // Update a user
  async updateUser(id, userData) {
    try {
      const now = new Date().toISOString();
      
      // First get the existing user
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...existingUser,
        name: userData.name,
        age: userData.age,
        updatedAt: now
      };
      
      await dbOperation(store => store.put(updatedUser));
      
      console.log('User updated locally:', id);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete a user (soft delete)
  async deleteUser(id) {
    try {
      const now = new Date().toISOString();
      
      // First get the existing user
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      const deletedUser = {
        ...existingUser,
        _deleted: true,
        updatedAt: now
      };
      
      await dbOperation(store => store.put(deletedUser));
      
      console.log('User deleted locally:', id);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const users = await dbOperation(store => store.getAll());
      const activeUsers = users.filter(user => !user._deleted);
      
      console.log('Retrieved users from local database:', activeUsers.length);
      return activeUsers;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await dbOperation(store => store.get(id));
      return user && !user._deleted ? user : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Sync users from MongoDB to local storage
  async syncFromMongoDB(users) {
    try {
      console.log('Syncing users from MongoDB to local storage...');
      
      // Clear existing users
      await dbOperation(store => store.clear());
      
      // Add all users from MongoDB
      for (const user of users) {
        // Use powersync_id if available, otherwise use _id
        const localId = user.powersync_id || user._id;
        
        const localUser = {
          id: localId,
          _id: localId,
          name: user.name,
          age: user.age,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          _deleted: false
        };
        
        await dbOperation(store => store.add(localUser));
      }
      
      console.log('Sync from MongoDB completed:', users.length, 'users');
    } catch (error) {
      console.error('Error syncing from MongoDB:', error);
      throw error;
    }
  },

  // Get sync status
  async getSyncStatus() {
    try {
      const users = await this.getAllUsers();
      return {
        localUserCount: users.length,
        lastSync: new Date().toISOString(),
        users: users // Include users for debugging
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }
};

// Export db for direct access if needed
export { db };
