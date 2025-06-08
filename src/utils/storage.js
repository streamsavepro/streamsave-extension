// Unified storage handler with Chrome API fallback
export const getStorage = async (key) => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key]);
        }
      });
    });
  }
  // For localStorage, handle objects by parsing JSON
  const value = localStorage.getItem(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch (e) {
    return value;
  }
};

export const setStorage = async (key, value) => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
  // For localStorage, stringify objects
  if (typeof value === 'object') {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, value);
  }
};

// Get all storage values for specified keys
export const getMultiStorage = async (keys) => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }
  
  // Fallback for localStorage
  const result = {};
  for (const key of keys) {
    const value = localStorage.getItem(key);
    try {
      result[key] = value ? JSON.parse(value) : null;
    } catch (e) {
      result[key] = value;
    }
  }
  return result;
};

// Clear all storage for the extension
export const clearStorage = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
  localStorage.clear();
};