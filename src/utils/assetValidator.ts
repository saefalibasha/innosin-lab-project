
// Utility functions for validating and managing assets
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a placeholder
  if (url.includes('placeholder') || url.includes('PLACEHOLDER')) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};

export const isValidModelUrl = (url: string): boolean => {
  if (!isValidImageUrl(url)) return false;
  return url.endsWith('.glb') || url.endsWith('.gltf');
};

export const sanitizeImageUrl = (url: string, fallback: string = '/placeholder.svg'): string => {
  return isValidImageUrl(url) ? url : fallback;
};

export const getOptimalImageUrl = (urls: (string | undefined)[], fallback: string = '/placeholder.svg'): string => {
  for (const url of urls) {
    if (url && isValidImageUrl(url)) {
      return url;
    }
  }
  return fallback;
};

export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isValidImageUrl(src)) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

export const validateModelFile = async (url: string): Promise<boolean> => {
  if (!isValidModelUrl(url)) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.includes('model/gltf-binary');
  } catch {
    return false;
  }
};

export const validateAssetAccessibility = async (imagePath?: string, modelPath?: string): Promise<{
  imageValid: boolean;
  modelValid: boolean;
  imageError?: string;
  modelError?: string;
}> => {
  const results = {
    imageValid: false,
    modelValid: false,
    imageError: undefined as string | undefined,
    modelError: undefined as string | undefined
  };

  // Validate image
  if (imagePath) {
    try {
      results.imageValid = await preloadImage(imagePath);
      if (!results.imageValid) {
        results.imageError = 'Image failed to load or is corrupted';
      }
    } catch (error) {
      results.imageError = 'Image accessibility check failed';
    }
  } else {
    results.imageError = 'No image path provided';
  }

  // Validate model
  if (modelPath) {
    try {
      results.modelValid = await validateModelFile(modelPath);
      if (!results.modelValid) {
        results.modelError = '3D model failed to load or invalid format';
      }
    } catch (error) {
      results.modelError = '3D model accessibility check failed';
    }
  } else {
    results.modelError = 'No model path provided';
  }

  return results;
};

export const batchPreloadImages = async (sources: string[]): Promise<{ [key: string]: boolean }> => {
  const results: { [key: string]: boolean } = {};
  
  const validSources = sources.filter(isValidImageUrl);
  
  const promises = validSources.map(async (src) => {
    const loaded = await preloadImage(src);
    results[src] = loaded;
    return { src, loaded };
  });

  await Promise.allSettled(promises);
  return results;
};

export default {
  isValidImageUrl,
  isValidModelUrl,
  sanitizeImageUrl,
  getOptimalImageUrl,
  preloadImage,
  batchPreloadImages,
  validateModelFile,
  validateAssetAccessibility
};
