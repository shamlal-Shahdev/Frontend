/**
 * Validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate CNIC number format (12345-1234567-1)
 */
export function isValidCNIC(cnic: string): boolean {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
}

/**
 * Format CNIC number with dashes
 */
export function formatCNIC(value: string): string {
  // Remove all non-digits
  const cleaned = value.replace(/\D/g, '');
  
  // Apply CNIC format: 12345-1234567-1
  if (cleaned.length <= 5) {
    return cleaned;
  } else if (cleaned.length <= 12) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  } else {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  }
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special character
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Get password strength message
 */
export function getPasswordStrengthMessage(password: string): string {
  if (password.length === 0) return '';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
  return 'Password is strong';
}

/**
 * Validate phone number (basic international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate file type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return validTypes.includes(file.type);
}

/**
 * Validate file size (max 5MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate date of birth (must be 18+ years old)
 */
export function isValidDateOfBirth(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

