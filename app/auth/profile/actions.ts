'use server';

import { updateProfile } from '@/lib/services/profiles';
import { createClient } from '@/lib/supabase/server';

export async function updateProfileAction(
  userId: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the user is updating their own profile
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await updateProfile(userId, { full_name: fullName });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update profile' };
  }
}
