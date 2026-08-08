"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmployeePayload = exports.isValidSalary = exports.isValidPhone = exports.isValidEmail = void 0;
/**
 * Email validation regex check
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * Phone validation regex check (allows optional leading +, digits, spaces, dashes, parentheses, 7 to 20 chars)
 */
const isValidPhone = (phone) => {
    if (!phone || phone.trim() === '')
        return true; // Optional field
    const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
    return phoneRegex.test(phone.trim());
};
exports.isValidPhone = isValidPhone;
/**
 * Non-negative salary check
 */
const isValidSalary = (salary) => {
    if (salary === undefined || salary === null || salary === '')
        return true;
    const num = Number(salary);
    return !isNaN(num) && num >= 0;
};
exports.isValidSalary = isValidSalary;
/**
 * Comprehensive Employee Data Payload Validator
 */
const validateEmployeePayload = (payload, isCreate = false) => {
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
    if (email && !(0, exports.isValidEmail)(email)) {
        return { isValid: false, error: 'Please provide a valid email address format (e.g. name@domain.com)' };
    }
    if (phone && !(0, exports.isValidPhone)(phone)) {
        return { isValid: false, error: 'Please provide a valid phone number format (e.g. +1 555-012-3456)' };
    }
    if (salary !== undefined && !(0, exports.isValidSalary)(salary)) {
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
exports.validateEmployeePayload = validateEmployeePayload;
//# sourceMappingURL=validation.utils.js.map