// Profile type matching the Supabase profiles table
export type UserRole = 'admin' | 'broker';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  broker_code: string | null;
  created_at: string;
  updated_at: string;
}

// For updating profile (subset of fields users can edit)
export interface ProfileUpdate {
  full_name?: string;
}

// For admin updating user roles
export interface AdminProfileUpdate {
  role?: UserRole;
  broker_code?: string | null;
  full_name?: string;
}

// Profile with email from auth.users (for display purposes)
export interface ProfileWithEmail extends Profile {
  email: string;
}
