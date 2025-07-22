
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
  });
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
  batchPreloadImages
};
