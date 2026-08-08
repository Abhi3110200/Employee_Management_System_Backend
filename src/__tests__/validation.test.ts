import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidPhone,
  isValidSalary,
  validateEmployeePayload,
} from '../utils/validation.utils.js';

describe('Validation Utility Unit Tests', () => {
  it('should validate emails correctly', () => {
    assert.equal(isValidEmail('employee@company.com'), true);
    assert.equal(isValidEmail('jane.doe+test@sub.domain.org'), true);
    assert.equal(isValidEmail('invalid-email'), false);
    assert.equal(isValidEmail('user@domain'), false);
    assert.equal(isValidEmail('@missinguser.com'), false);
  });

  it('should validate phone numbers correctly', () => {
    assert.equal(isValidPhone(''), true);
    assert.equal(isValidPhone('+1 (555) 012-3456'), true);
    assert.equal(isValidPhone('555-012-3456'), true);
    assert.equal(isValidPhone('abc'), false);
    assert.equal(isValidPhone('12'), false);
  });

  it('should validate salaries correctly', () => {
    assert.equal(isValidSalary(0), true);
    assert.equal(isValidSalary(85000), true);
    assert.equal(isValidSalary('95000'), true);
    assert.equal(isValidSalary(undefined), true);
    assert.equal(isValidSalary(-500), false);
    assert.equal(isValidSalary('not-a-number'), false);
  });

  it('should validate employee payloads', () => {
    const validPayload = {
      name: 'Jane Doe',
      email: 'jane@company.com',
      password: 'password123',
      phone: '+1 555 012 3456',
      salary: 90000,
      department: 'Engineering',
    };
    const result1 = validateEmployeePayload(validPayload, true);
    assert.equal(result1.isValid, true);

    const invalidPayload = {
      name: 'Jane Doe',
      email: 'jane@company.com',
    };
    const result2 = validateEmployeePayload(invalidPayload, true);
    assert.equal(result2.isValid, false);
    assert.ok(result2.error?.includes('Password is required'));
  });
});
