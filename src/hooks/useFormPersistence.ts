
import { useState, useCallback } from 'react';

interface FormData {
  name: string;
  product_code: string;
  dimensions: string;
  orientation: string;
  door_type: string;
  drawer_count: string;
  finish_type: string;
  is_active: boolean;
  description: string;
}

const STORAGE_KEY = 'variant_form_previous_data';

export const useFormPersistence = () => {
  const [previousData, setPreviousData] = useState<Partial<FormData> | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const savePreviousData = useCallback((data: FormData) => {
    try {
      // Only save fields that are commonly reused (exclude name and product_code)
      const dataToSave = {
        dimensions: data.dimensions,
        orientation: data.orientation,
        door_type: data.door_type,
        drawer_count: data.drawer_count,
        finish_type: data.finish_type,
        is_active: data.is_active,
        description: data.description
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setPreviousData(dataToSave);
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, []);

  const clearPreviousData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreviousData(null);
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  }, []);

  const hasPreviousData = Boolean(previousData);

  return {
    previousData,
    savePreviousData,
    clearPreviousData,
    hasPreviousData
  };
};
