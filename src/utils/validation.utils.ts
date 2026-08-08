/**
 * Email validation regex check
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone validation regex check (allows optional leading +, digits, spaces, dashes, parentheses, 7 to 20 chars)
 */
export const isValidPhone = (phone?: string): boolean => {
  if (!phone || phone.trim() === '') return true; // Optional field
  const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Non-negative salary check
 */
export const isValidSalary = (salary?: any): boolean => {
  if (salary === undefined || salary === null || salary === '') return true;
  const num = Number(salary);
  return !isNaN(num) && num >= 0;
};

/**
 * Comprehensive Employee Data Payload Validator
 */
export const validateEmployeePayload = (
  payload: any,
  isCreate: boolean = false
): { isValid: boolean; error?: string } => {
  const { name, email, password, phone, salary, department, designation } = payload;

  if (isCreate) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return { isValid: false, error: 'Full Name is required' };
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return { isValid: false, error: 'Email Address is required' };
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return { isValid: false, error: 'Password is required and must be at least 6 characters' };
    }
  }

  if (email && !isValidEmail(email)) {
    return { isValid: false, error: 'Please provide a valid email address format (e.g. name@domain.com)' };
  }

  if (phone && !isValidPhone(phone)) {
    return { isValid: false, error: 'Please provide a valid phone number format (e.g. +1 555-012-3456)' };
  }

  if (salary !== undefined && !isValidSalary(salary)) {
    return { isValid: false, error: 'Salary must be a non-negative number' };
  }

  if (department && typeof department === 'string' && department.trim() === '') {
    return { isValid: false, error: 'Department cannot be empty' };
  }

  if (designation && typeof designation === 'string' && designation.trim() === '') {
    return { isValid: false, error: 'Designation cannot be empty' };
  }

  return { isValid: true };
};
