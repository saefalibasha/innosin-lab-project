
import { useState, useCallback } from 'react';

interface PasswordStrength {
  score: number;
  feedback: string[];
  isSecure: boolean;
}

export const usePasswordStrength = () => {
  const [strength, setStrength] = useState<PasswordStrength>({ 
    score: 0, 
    feedback: [], 
    isSecure: false 
  });

  const checkPasswordStrength = useCallback((password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 12) {
      score += 20;
    } else if (password.length >= 8) {
      score += 10;
      feedback.push('Use at least 12 characters for better security');
    } else {
      feedback.push('Password must be at least 12 characters long');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 10;
    } else {
      feedback.push('Add lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 10;
    } else {
      feedback.push('Add uppercase letters');
    }

    if (/[0-9]/.test(password)) {
      score += 10;
    } else {
      feedback.push('Add numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 15;
    } else {
      feedback.push('Add special characters (!@#$%^&*)');
    }

    // Pattern checks
    if (!/(.)\1{2,}/.test(password)) {
      score += 10;
    } else {
      feedback.push('Avoid repeating characters');
    }

    // Common password check
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', '1234567890', 'abc123'
    ];
    
    const isCommon = commonPasswords.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    );
    
    if (!isCommon) {
      score += 15;
    } else {
      feedback.push('Avoid common passwords');
      score = Math.max(0, score - 20); // Penalty for common passwords
    }

    // Sequential character check
    if (!/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
      score += 10;
    } else {
      feedback.push('Avoid sequential characters');
    }

    const result = {
      score: Math.min(100, score),
      feedback,
      isSecure: score >= 80 && feedback.length === 0
    };

    setStrength(result);
    return result;
  }, []);

  const getStrengthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStrengthText = (score: number): string => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  };

  return {
    strength,
    checkPasswordStrength,
    getStrengthColor,
    getStrengthText,
  };
};
