"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.willCauseCircularReporting = void 0;
const user_model_js_1 = require("../models/user.model.js");
/**
 * Checks whether assigning candidateManagerId as the manager for employeeId
 * would cause a circular reporting loop (e.g. A -> B -> C -> A).
 *
 * @param employeeId Target employee ID being assigned a manager
 * @param candidateManagerId Proposed manager ID
 * @returns Promise<boolean> True if circular reporting is detected, False if safe
 */
const willCauseCircularReporting = async (employeeId, candidateManagerId) => {
    // Self-manager check
    if (employeeId.toString() === candidateManagerId.toString()) {
        return true;
    }
    let currentId = candidateManagerId.toString();
    const visited = new Set();
    while (currentId) {
        if (currentId === employeeId.toString()) {
            return true; // Circular link detected!
        }
        if (visited.has(currentId)) {
            break; // Safeguard against existing cyclic references
        }
        visited.add(currentId);
        const managerUser = await user_model_js_1.User.findById(currentId).select('manager');
        if (!managerUser || !managerUser.manager) {
            break; // Reached top of reporting hierarchy
        }
        currentId = managerUser.manager.toString();
    }
    return false;
};
exports.willCauseCircularReporting = willCauseCircularReporting;
//# sourceMappingURL=hierarchy.utils.js.map