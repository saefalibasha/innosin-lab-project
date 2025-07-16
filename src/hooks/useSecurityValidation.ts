import { useState, useCallback } from 'react';
import { z } from 'zod';

// Security validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .transform(email => email.toLowerCase().trim());

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain lowercase, uppercase, and number');

export const nameSchema = z.string()
  .min(1, 'Name required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Invalid characters in name')
  .transform(name => name.trim());

export const companySchema = z.string()
  .max(200, 'Company name too long')
  .regex(/^[a-zA-Z0-9\s\-'.,&]+$/, 'Invalid characters in company name')
  .transform(company => company.trim());

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone format')
  .max(20, 'Phone number too long');

export const messageSchema = z.string()
  .min(1, 'Message required')
  .max(5000, 'Message too long')
  .transform(msg => msg.trim());

// Rate limiting hook
export const useRateLimit = () => {
  const [attempts, setAttempts] = useState<Map<string, { count: number; lastAttempt: number }>>(new Map());

  const checkRateLimit = useCallback((operation: string, maxAttempts = 5, windowMs = 60000) => {
    const now = Date.now();
    const key = `${operation}_${window.location.hostname}`;
    const current = attempts.get(key);

    if (!current) {
      setAttempts(prev => new Map(prev).set(key, { count: 1, lastAttempt: now }));
      return true;
    }

    // Reset if window expired
    if (now - current.lastAttempt > windowMs) {
      setAttempts(prev => new Map(prev).set(key, { count: 1, lastAttempt: now }));
      return true;
    }

    // Check if exceeded
    if (current.count >= maxAttempts) {
      return false;
    }

    // Increment
    setAttempts(prev => new Map(prev).set(key, { 
      count: current.count + 1, 
      lastAttempt: now 
    }));
    return true;
  }, [attempts]);

  return { checkRateLimit };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Security validation hook
export const useSecurityValidation = () => {
  const { checkRateLimit } = useRateLimit();

  const validateAndSanitize = useCallback(<T>(
    data: unknown,
    schema: z.ZodSchema<T>,
    operation?: string
  ): { success: boolean; data?: T; error?: string } => {
    try {
      // Rate limiting check
      if (operation && !checkRateLimit(operation)) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }

      // Validate with schema
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message || 'Validation failed' };
      }
      return { success: false, error: 'Invalid input' };
    }
  }, [checkRateLimit]);

  return {
    validateAndSanitize,
    schemas: {
      email: emailSchema,
      password: passwordSchema,
      name: nameSchema,
      company: companySchema,
      phone: phoneSchema,
      message: messageSchema
    },
    sanitizeInput,
    checkRateLimit
  };
};