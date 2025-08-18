
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';

interface SecureInputProps {
  id: string;
  label: string;
  type: 'email' | 'password' | 'text' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showPasswordStrength?: boolean;
  className?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  showPasswordStrength = false,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const { validateAndSanitize, schemas } = useSecurityValidation();
  const { strength, checkPasswordStrength, getStrengthColor, getStrengthText } = usePasswordStrength();

  // Get appropriate schema based on type
  const getSchema = () => {
    switch (type) {
      case 'email':
        return schemas.email;
      case 'password':
        return schemas.password;
      case 'tel':
        return schemas.phone;
      default:
        return schemas.name;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (type === 'password' && showPasswordStrength) {
      checkPasswordStrength(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  // Validate current value
  const validation = touched && value ? validateAndSanitize(value, getSchema()) : null;
  const isValid = validation?.success ?? true;
  const errorMessage = validation?.error;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            ${!isValid && touched ? 'border-red-500 focus:border-red-500' : ''}
            ${isValid && touched && value ? 'border-green-500 focus:border-green-500' : ''}
            ${type === 'password' ? 'pr-10' : ''}
          `}
          required={required}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        
        {touched && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Password strength indicator */}
      {type === 'password' && showPasswordStrength && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Password strength:</span>
            <span className={`text-xs font-medium ${getStrengthColor(strength.score)}`}>
              {getStrengthText(strength.score)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                strength.score >= 80 ? 'bg-green-500' :
                strength.score >= 60 ? 'bg-yellow-500' :
                strength.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
          
          {strength.feedback.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-1">
              {strength.feedback.slice(0, 3).map((feedback, index) => (
                <li key={index} className="flex items-center gap-1">
                  <span className="text-orange-500">•</span>
                  {feedback}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && touched && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};
