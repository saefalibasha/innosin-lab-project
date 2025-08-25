
// Enhanced asset validation utilities
export const isPlaceholderAsset = (url: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  
  // Check for placeholder text in content or filename
  if (url.includes('placeholder') || url.includes('PLACEHOLDER')) return true;
  
  // Check if it's in the public folder (typically placeholder files)
  if (url.startsWith('/products/') && !url.includes('supabase')) return true;
  
  return false;
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Exclude placeholder assets
  if (isPlaceholderAsset(url)) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path from Supabase storage
    return url.startsWith('/') && url.includes('supabase');
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
    if (!src || isPlaceholderAsset(src)) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
    
    // Timeout after 3 seconds for faster validation
    setTimeout(() => resolve(false), 3000);
  });
};

// Validate 3D model renderability using Three.js loader
export const validateModelRenderability = async (url: string): Promise<boolean> => {
  if (!url || isPlaceholderAsset(url)) return false;
  
  try {
    // Use dynamic import to avoid bundle size issues
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    
    return new Promise((resolve) => {
      loader.load(
        url,
        () => resolve(true), // Success
        undefined, // Progress - not used
        () => resolve(false) // Error
      );
      
      // Timeout for model loading
      setTimeout(() => resolve(false), 5000);
    });
  } catch (error) {
    console.error('Model validation error:', error);
    return false;
  }
};

export const validateModelFile = async (url: string): Promise<boolean> => {
  if (!isValidModelUrl(url) || isPlaceholderAsset(url)) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Check if it's a real GLB file (should be binary and reasonably sized)
    const isGLBFile = contentType?.includes('model/gltf-binary') || contentType?.includes('application/octet-stream');
    const isReasonableSize = contentLength ? parseInt(contentLength) > 100 : true; // At least 100 bytes
    
    // For real validation, also try to parse with Three.js
    if (response.ok && isGLBFile && isReasonableSize) {
      return await validateModelRenderability(url);
    }
    
    return false;
  } catch (error) {
    console.error('Model validation error:', url, error);
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
  isPlaceholderAsset,
  isValidImageUrl,
  isValidModelUrl,
  sanitizeImageUrl,
  getOptimalImageUrl,
  preloadImage,
  batchPreloadImages,
  validateModelFile,
  validateModelRenderability,
  validateAssetAccessibility
};
