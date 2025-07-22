import { useState, useEffect } from 'react';

interface FormData {
  [key: string]: any;
}

interface StoredEntry {
  data: FormData;
  timestamp: number;
  id: string;
}

interface UseFormPersistenceOptions {
  storageKey: string;
  maxEntries?: number;
}

export const useFormPersistence = ({ storageKey, maxEntries = 10 }: UseFormPersistenceOptions) => {
  const [previousEntries, setPreviousEntries] = useState<StoredEntry[]>([]);

  // Load previous entries on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const entries = JSON.parse(stored) as StoredEntry[];
        // Sort by timestamp descending (most recent first)
        const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);
        setPreviousEntries(sortedEntries);
      }
    } catch (error) {
      console.error('Error loading previous entries:', error);
    }
  }, [storageKey]);

  const saveEntry = (data: FormData) => {
    try {
      const newEntry: StoredEntry = {
        data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };

      // Add new entry to the beginning of the array (most recent first)
      const updatedEntries = [newEntry, ...previousEntries];
      
      // Keep only the specified number of entries
      const trimmedEntries = updatedEntries.slice(0, maxEntries);
      
      localStorage.setItem(storageKey, JSON.stringify(trimmedEntries));
      setPreviousEntries(trimmedEntries);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const clearEntries = () => {
    try {
      localStorage.removeItem(storageKey);
      setPreviousEntries([]);
    } catch (error) {
      console.error('Error clearing entries:', error);
    }
  };

  const removeEntry = (id: string) => {
    try {
      const filteredEntries = previousEntries.filter(entry => entry.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(filteredEntries));
      setPreviousEntries(filteredEntries);
    } catch (error) {
      console.error('Error removing entry:', error);
    }
  };

  return {
    previousEntries, // Already sorted with most recent first
    saveEntry,
    clearEntries,
    removeEntry,
    hasPreviousEntries: previousEntries.length > 0
  };
};
