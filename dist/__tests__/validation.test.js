"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const validation_utils_js_1 = require("../utils/validation.utils.js");
(0, node_test_1.describe)('Validation Utility Unit Tests', () => {
    (0, node_test_1.it)('should validate emails correctly', () => {
        strict_1.default.equal((0, validation_utils_js_1.isValidEmail)('employee@company.com'), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidEmail)('jane.doe+test@sub.domain.org'), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidEmail)('invalid-email'), false);
        strict_1.default.equal((0, validation_utils_js_1.isValidEmail)('user@domain'), false);
        strict_1.default.equal((0, validation_utils_js_1.isValidEmail)('@missinguser.com'), false);
    });
    (0, node_test_1.it)('should validate phone numbers correctly', () => {
        strict_1.default.equal((0, validation_utils_js_1.isValidPhone)(''), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidPhone)('+1 (555) 012-3456'), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidPhone)('555-012-3456'), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidPhone)('abc'), false);
        strict_1.default.equal((0, validation_utils_js_1.isValidPhone)('12'), false);
    });
    (0, node_test_1.it)('should validate salaries correctly', () => {
        strict_1.default.equal((0, validation_utils_js_1.isValidSalary)(0), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidSalary)(85000), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidSalary)('95000'), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidSalary)(undefined), true);
        strict_1.default.equal((0, validation_utils_js_1.isValidSalary)(-500), false);
        strict_1.default.equal((0, validation_utils_js_1.isValidSalary)('not-a-number'), false);
    });
    (0, node_test_1.it)('should validate employee payloads', () => {
        const validPayload = {
            name: 'Jane Doe',
            email: 'jane@company.com',
            password: 'password123',
            phone: '+1 555 012 3456',
            salary: 90000,
            department: 'Engineering',
        };
        const result1 = (0, validation_utils_js_1.validateEmployeePayload)(validPayload, true);
        strict_1.default.equal(result1.isValid, true);
        const invalidPayload = {
            name: 'Jane Doe',
            email: 'jane@company.com',
        };
        const result2 = (0, validation_utils_js_1.validateEmployeePayload)(invalidPayload, true);
        strict_1.default.equal(result2.isValid, false);
        strict_1.default.ok(result2.error?.includes('Password is required'));
    });
});
//# sourceMappingURL=validation.test.js.map