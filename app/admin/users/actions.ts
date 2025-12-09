'use server';

import { getCurrentProfile, updateUserRole } from '@/lib/services/profiles';
import type { AdminProfileUpdate } from '@/lib/types/profile';

export async function updateUserRoleAction(
  userId: string,
  updates: AdminProfileUpdate
): Promise<{ success: boolean; error?: string }> {
  // Input validation
  if (
    !updates ||
    (updates.role === undefined &&
      updates.broker_code === undefined &&
      updates.full_name === undefined)
  ) {
    return { success: false, error: 'No updates provided' };
  }

  // Validate role if provided
  if (
    updates.role !== undefined &&
    updates.role !== 'admin' &&
    updates.role !== 'broker'
  ) {
    return { success: false, error: 'Invalid role' };
  }

  // Validate broker_code length if provided
  if (
    updates.broker_code !== undefined &&
    updates.broker_code !== null &&
    updates.broker_code.length > 50
  ) {
    return { success: false, error: 'Broker code must be 50 characters or less' };
  }

  // Validate full_name if provided
  if (updates.full_name !== undefined && updates.full_name.length > 100) {
    return { success: false, error: 'Name must be 100 characters or less' };
  }

  try {
    // Defense-in-depth: verify admin role in action layer
    const currentProfile = await getCurrentProfile();
    if (!currentProfile || currentProfile.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await updateUserRole(userId, updates);
    return { success: true };
  } catch {
    // Use generic error message to prevent information leakage
    return { success: false, error: 'Failed to update user' };
  }
}
