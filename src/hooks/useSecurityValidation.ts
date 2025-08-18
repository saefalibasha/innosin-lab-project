
import { z } from 'zod';
import { useState, useCallback } from 'react';

interface ValidationSchemas {
  email: z.ZodSchema;
  password: z.ZodSchema;
  name: z.ZodSchema;
  phone: z.ZodSchema;
  company: z.ZodSchema;
  message: z.ZodSchema;
}

interface RateLimitAttempt {
  timestamp: number;
  count: number;
}

export const useSecurityValidation = () => {
  const [rateLimitCache] = useState<Map<string, RateLimitAttempt>>(new Map());

  // Enhanced validation schemas with stronger security
  const schemas: ValidationSchemas = {
    email: z
      .string()
      .min(1, 'Email is required')
      .max(254, 'Email too long')
      .email('Invalid email format')
      .refine((email) => {
        // Block common suspicious patterns
        const suspiciousPatterns = [
          /[<>'"]/,
          /javascript:/i,
          /data:/i,
          /vbscript:/i,
        ];
        return !suspiciousPatterns.some(pattern => pattern.test(email));
      }, 'Email contains invalid characters'),

    password: z
      .string()
      .min(12, 'Password must be at least 12 characters long')
      .max(128, 'Password too long')
      .refine((password) => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter')
      .refine((password) => /[a-z]/.test(password), 'Password must contain at least one lowercase letter')
      .refine((password) => /[0-9]/.test(password), 'Password must contain at least one number')
      .refine((password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password), 'Password must contain at least one special character')
      .refine((password) => !/(.)\1{2,}/.test(password), 'Password cannot contain repeated characters')
      .refine((password) => {
        // Check against common passwords
        const commonPasswords = [
          'password', '123456', 'qwerty', 'admin', 'letmein',
          'welcome', 'monkey', '1234567890', 'Password123!'
        ];
        return !commonPasswords.some(common => 
          password.toLowerCase().includes(common.toLowerCase())
        );
      }, 'Password is too common'),

    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .refine((name) => {
        // Allow letters, spaces, hyphens, apostrophes, and common international characters
        return /^[a-zA-ZÀ-ÿ\u0100-\u017F\u1E00-\u1EFF\s\-'\.]+$/.test(name);
      }, 'Name contains invalid characters')
      .refine((name) => {
        // Block suspicious patterns
        const suspiciousPatterns = [
          /[<>'"]/,
          /javascript:/i,
          /script/i,
          /on\w+=/i,
        ];
        return !suspiciousPatterns.some(pattern => pattern.test(name));
      }, 'Name contains invalid characters'),

    phone: z
      .string()
      .min(1, 'Phone is required')
      .max(20, 'Phone number too long')
      .refine((phone) => {
        // Allow digits, spaces, hyphens, parentheses, and plus sign
        return /^[\d\s\-\(\)\+]+$/.test(phone);
      }, 'Phone number contains invalid characters'),

    company: z
      .string()
      .min(1, 'Company is required')
      .max(200, 'Company name too long')
      .refine((company) => {
        // Allow letters, numbers, spaces, and common business punctuation
        return /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u1E00-\u1EFF\s\-'\.&,()]+$/.test(company);
      }, 'Company name contains invalid characters')
      .refine((company) => {
        // Block suspicious patterns
        const suspiciousPatterns = [
          /[<>'"]/,
          /javascript:/i,
          /script/i,
          /on\w+=/i,
        ];
        return !suspiciousPatterns.some(pattern => pattern.test(company));
      }, 'Company name contains invalid characters'),

    message: z
      .string()
      .min(1, 'Message is required')
      .max(2000, 'Message too long')
      .refine((message) => {
        // Block script injection attempts
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /on\w+\s*=/i,
          /<iframe/i,
          /<object/i,
          /<embed/i,
          /<form/i,
        ];
        return !suspiciousPatterns.some(pattern => pattern.test(message));
      }, 'Message contains invalid content'),
  };

  // Enhanced sanitization function
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      // Remove null bytes
      .replace(/\0/g, '')
      // Encode HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Remove invisible characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '');
  };

  // Enhanced rate limiting with sliding window
  const checkRateLimit = useCallback((
    operation: string, 
    maxAttempts: number = 5, 
    windowMs: number = 900000 // 15 minutes
  ): boolean => {
    const key = `${operation}_${Date.now().toString().slice(0, -4)}`; // 10-second windows
    const now = Date.now();
    
    // Clean old entries
    for (const [cacheKey, attempt] of rateLimitCache.entries()) {
      if (now - attempt.timestamp > windowMs) {
        rateLimitCache.delete(cacheKey);
      }
    }
    
    // Count attempts in window
    const windowStart = now - windowMs;
    let attemptCount = 0;
    
    for (const [cacheKey, attempt] of rateLimitCache.entries()) {
      if (cacheKey.startsWith(operation) && attempt.timestamp > windowStart) {
        attemptCount += attempt.count;
      }
    }
    
    if (attemptCount >= maxAttempts) {
      return false;
    }
    
    // Record this attempt
    const existing = rateLimitCache.get(key);
    if (existing) {
      existing.count++;
    } else {
      rateLimitCache.set(key, { timestamp: now, count: 1 });
    }
    
    return true;
  }, [rateLimitCache]);

  // Main validation function
  const validateAndSanitize = useCallback((
    input: string,
    schema: z.ZodSchema,
    operation?: string
  ): { success: boolean; data?: string; error?: string } => {
    try {
      // First sanitize the input
      const sanitized = sanitizeInput(input);
      
      // Then validate with schema
      const result = schema.parse(sanitized);
      
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: error.errors[0]?.message || 'Validation failed' 
        };
      }
      return { 
        success: false, 
        error: 'Validation failed' 
      };
    }
  }, []);

  // Input sanitization for display (additional layer)
  const sanitizeForDisplay = useCallback((input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }, []);

  return {
    schemas,
    validateAndSanitize,
    sanitizeInput,
    sanitizeForDisplay,
    checkRateLimit,
  };
};
