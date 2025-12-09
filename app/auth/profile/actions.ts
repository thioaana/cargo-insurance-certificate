'use server';

import { updateProfile } from '@/lib/services/profiles';
import { createClient } from '@/lib/supabase/server';

export async function updateProfileAction(
  userId: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  // Input validation
  const trimmedName = fullName?.trim();
  if (!trimmedName || trimmedName.length === 0) {
    return { success: false, error: 'Name is required' };
  }
  if (trimmedName.length > 100) {
    return { success: false, error: 'Name must be 100 characters or less' };
  }

  try {
    // Verify the user is updating their own profile
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await updateProfile(userId, { full_name: trimmedName });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update profile' };
  }
}
