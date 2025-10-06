import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNormalizedAssetUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a Supabase storage path starting with products/
  if (url.startsWith('products/')) {
    return `https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents/${url}`;
  }
  
  // If it starts with /products/, remove the leading slash
  if (url.startsWith('/products/')) {
    return `https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents${url}`;
  }
  
  // Default: prepend slash for relative paths
  return url.startsWith('/') ? url : `/${url}`;
}
