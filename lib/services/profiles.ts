import { createClient } from '@/lib/supabase/server';
import type {
  Profile,
  ProfileUpdate,
  AdminProfileUpdate,
  ProfileWithEmail,
} from '@/lib/types/profile';

// Fetch a profile by user ID
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows returned
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error('Failed to fetch profile');
  }

  return data as Profile;
}

// Fetch current user's profile
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getProfile(user.id);
}

// Update own profile (limited to full_name)
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update profile');
  }

  return data as Profile;
}

// Admin: Get all profiles with emails
export async function getAllProfiles(): Promise<ProfileWithEmail[]> {
  const supabase = await createClient();

  // First verify the caller is an admin
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    throw new Error('Failed to fetch profiles');
  }

  // Fetch users from auth to get emails (admin API needed)
  // Since we can't directly query auth.users, we'll use the admin API
  // For now, we'll return profiles without emails and fetch emails separately
  // in the component using getUser for each profile

  // Alternative: Use a database function or view that joins profiles with auth.users
  // For simplicity, we return profiles and let the page fetch emails
  return (profiles as Profile[]).map((profile) => ({
    ...profile,
    email: '', // Will be populated by the page
  }));
}

// Admin: Update user role and broker_code
export async function updateUserRole(
  userId: string,
  updates: AdminProfileUpdate
): Promise<Profile> {
  const supabase = await createClient();

  // Verify the caller is an admin
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update user role');
  }

  return data as Profile;
}

/**
 * Broker info for dropdown selection
 */
export interface BrokerInfo {
  id: string;
  broker_code: string;
  full_name: string | null;
}

/**
 * Get all brokers for dropdown selection (admin only)
 */
export async function getAllBrokers(): Promise<BrokerInfo[]> {
  const supabase = await createClient();

  // Verify the caller is an admin
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, broker_code, full_name')
    .eq('role', 'broker')
    .not('broker_code', 'is', null)
    .order('broker_code', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch brokers');
  }

  return data as BrokerInfo[];
}
