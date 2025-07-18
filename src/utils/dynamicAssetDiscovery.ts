
import { supabase } from '@/integrations/supabase/client';
import { extractProductCode, getStoragePath, normalizeProductCode } from './productCodeUtils';

export interface AssetInfo {
  productCode: string;
  hasImage: boolean;
  hasModel: boolean;
  imagePath?: string;
  modelPath?: string;
  overviewImagePath?: string;
}

/**
 * Cache for asset discovery to avoid repeated API calls
 */
const assetCache = new Map<string, AssetInfo>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if an asset exists in Supabase storage
 */
export const checkAssetExists = async (path: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      });

    if (error) return false;
    return data && data.length > 0;
  } catch {
    return false;
  }
};

/**
 * Discover assets for a specific product code
 */
export const discoverProductAssets = async (productName: string): Promise<AssetInfo> => {
  const cacheKey = productName;
  const now = Date.now();
  
  // Check cache first
  if (assetCache.has(cacheKey) && cacheExpiry.get(cacheKey)! > now) {
    return assetCache.get(cacheKey)!;
  }

  const productCode = extractProductCode(productName);
  if (!productCode) {
    const emptyAsset: AssetInfo = {
      productCode: productName,
      hasImage: false,
      hasModel: false
    };
    assetCache.set(cacheKey, emptyAsset);
    cacheExpiry.set(cacheKey, now + CACHE_DURATION);
    return emptyAsset;
  }

  const normalizedCode = normalizeProductCode(productCode.code);
  const imagePath = getStoragePath(normalizedCode, 'jpg');
  const modelPath = getStoragePath(normalizedCode, 'glb');

  // Check if assets exist
  const [hasImage, hasModel] = await Promise.all([
    checkAssetExists(imagePath),
    checkAssetExists(modelPath)
  ]);

  // Check for overview images (for series grouping)
  let overviewImagePath: string | undefined;
  if (productCode.series === 'MC' || productCode.series === 'MCC') {
    // Check for height-specific overview images
    const overviewPaths = [
      'products/mobile-cabinet-750mm-overview/750mm-height-bench-overview.jpg',
      'products/mobile-cabinet-900mm-overview/900mm-height-bench-overview.jpg'
    ];
    
    for (const path of overviewPaths) {
      if (await checkAssetExists(path)) {
        overviewImagePath = path;
        break;
      }
    }
  }

  const assetInfo: AssetInfo = {
    productCode: normalizedCode,
    hasImage,
    hasModel,
    imagePath: hasImage ? imagePath : undefined,
    modelPath: hasModel ? modelPath : undefined,
    overviewImagePath
  };

  // Cache the result
  assetCache.set(cacheKey, assetInfo);
  cacheExpiry.set(cacheKey, now + CACHE_DURATION);

  return assetInfo;
};

/**
 * Batch discover assets for multiple products
 */
export const batchDiscoverAssets = async (productNames: string[]): Promise<Map<string, AssetInfo>> => {
  const results = new Map<string, AssetInfo>();
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < productNames.length; i += batchSize) {
    const batch = productNames.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(name => discoverProductAssets(name))
    );
    
    batch.forEach((name, index) => {
      results.set(name, batchResults[index]);
    });
  }
  
  return results;
};

/**
 * Get public URL for an asset
 */
export const getAssetUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path);
  
  return data.publicUrl;
};

/**
 * Clear asset cache (useful for testing or when assets are updated)
 */
export const clearAssetCache = (): void => {
  assetCache.clear();
  cacheExpiry.clear();
};
