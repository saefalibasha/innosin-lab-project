import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecureStorageOptions {
  expiresInHours?: number;
}

interface StoredData {
  [key: string]: any;
}

export const useSecureStorage = () => {
  const [loading, setLoading] = useState(false);

  // Create secure token and store data server-side
  const setSecureData = useCallback(async (
    data: StoredData, 
    options: SecureStorageOptions = { expiresInHours: 24 }
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('create_session_token', {
        session_data_param: data,
        user_id_param: (await supabase.auth.getUser()).data.user?.id || null
      });

      if (error) throw error;

      // Store only the token client-side
      const token = result as string;
      sessionStorage.setItem('secure_token', token);
      return token;
    } catch (error) {
      console.error('Error storing secure data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Retrieve data using secure token
  const getSecureData = useCallback(async (): Promise<StoredData | null> => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('secure_token');
      if (!token) return null;

      const { data, error } = await supabase.rpc('get_session_data', {
        session_token: token
      });

      if (error) throw error;
      return data as StoredData;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      // Clear invalid token
      sessionStorage.removeItem('secure_token');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear secure data
  const clearSecureData = useCallback(() => {
    sessionStorage.removeItem('secure_token');
  }, []);

  // Check if secure data exists
  const hasSecureData = useCallback(() => {
    return !!sessionStorage.getItem('secure_token');
  }, []);

  return {
    setSecureData,
    getSecureData,
    clearSecureData,
    hasSecureData,
    loading
  };
};

// Utility function to migrate existing insecure data
export const migrateInsecureData = async (keys: string[]) => {
  const { setSecureData } = useSecureStorage();
  
  try {
    const dataToMigrate: StoredData = {};
    let hasData = false;

    // Collect all insecure data
    keys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) {
        try {
          dataToMigrate[key] = JSON.parse(value);
          hasData = true;
        } catch {
          dataToMigrate[key] = value;
          hasData = true;
        }
      }
    });

    if (hasData) {
      // Store securely
      await setSecureData(dataToMigrate);
      
      // Clear insecure data
      keys.forEach(key => sessionStorage.removeItem(key));
      
      console.log('Data migrated to secure storage');
    }
  } catch (error) {
    console.error('Error migrating data:', error);
  }
};