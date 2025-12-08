import { createClient } from '@/lib/supabase/server';
import { getProfile } from './profiles';
import type { Profile } from '@/lib/types/profile';
import type { User } from '@supabase/supabase-js';

export interface UserWithProfile {
  user: User;
  profile: Profile | null;
}

// Get current authenticated user with their profile
export async function getCurrentUserWithProfile(): Promise<UserWithProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getProfile(user.id);

  return { user, profile };
}

// Check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  const result = await getCurrentUserWithProfile();
  return result?.profile?.role === 'admin';
}
