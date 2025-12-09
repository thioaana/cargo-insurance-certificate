import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/services/profiles';
import type { Profile } from '@/lib/types/profile';

export default async function AdminUsersPage() {
  // Defense-in-depth: verify admin role in page component
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    notFound();
  }

  const supabase = await createClient();

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Broker Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(profiles as Profile[]).map((profile) => (
              <tr key={profile.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  {profile.full_name || <span className="text-muted-foreground">No name</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      profile.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {profile.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {profile.broker_code || '-'}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${profile.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
