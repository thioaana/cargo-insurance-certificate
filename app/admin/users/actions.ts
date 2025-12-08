'use server';

import { updateUserRole } from '@/lib/services/profiles';
import type { AdminProfileUpdate } from '@/lib/types/profile';

export async function updateUserRoleAction(
  userId: string,
  updates: AdminProfileUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateUserRole(userId, updates);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update user';
    return { success: false, error: message };
  }
}
