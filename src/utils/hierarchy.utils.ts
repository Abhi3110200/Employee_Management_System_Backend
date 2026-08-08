import { User, IUser } from '../models/user.model.js';

/**
 * Checks whether assigning candidateManagerId as the manager for employeeId
 * would cause a circular reporting loop (e.g. A -> B -> C -> A).
 *
 * @param employeeId Target employee ID being assigned a manager
 * @param candidateManagerId Proposed manager ID
 * @returns Promise<boolean> True if circular reporting is detected, False if safe
 */
export const willCauseCircularReporting = async (
  employeeId: string,
  candidateManagerId: string
): Promise<boolean> => {
  // Self-manager check
  if (employeeId.toString() === candidateManagerId.toString()) {
    return true;
  }

  let currentId: string | null = candidateManagerId.toString();
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === employeeId.toString()) {
      return true; // Circular link detected!
    }

    if (visited.has(currentId)) {
      break; // Safeguard against existing cyclic references
    }
    visited.add(currentId);

    const managerUser: IUser | null = await User.findById(currentId).select('manager');
    if (!managerUser || !managerUser.manager) {
      break; // Reached top of reporting hierarchy
    }

    currentId = managerUser.manager.toString();
  }

  return false;
};
