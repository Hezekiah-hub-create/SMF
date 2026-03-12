import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  FEEDBACK_LIST: 'cache_feedback_list',
  STATS: 'cache_stats',
  NOTIFICATIONS: 'cache_notifications',
};

const cacheService = {
  /**
   * Save data to cache
   * @param {string} key 
   * @param {any} data 
   */
  save: async (key, data) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`[CacheService] Error saving key ${key}:`, e);
    }
  },

  /**
   * Get data from cache
   * @param {string} key 
   * @returns {any}
   */
  get: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`[CacheService] Error getting key ${key}:`, e);
      return null;
    }
  },

  /**
   * Remove data from cache
   * @param {string} key 
   */
  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`[CacheService] Error removing key ${key}:`, e);
    }
  },

  /**
   * Clear all app cache
   */
  clearAll: async () => {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      console.error('[CacheService] Error clearing all cache:', e);
    }
  },

  KEYS: CACHE_KEYS,
};

export default cacheService;
