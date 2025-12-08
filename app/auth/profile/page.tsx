import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/services/auth';
import ProfileForm from './profile-form';

export default async function ProfilePage() {
  const result = await getCurrentUserWithProfile();

  if (!result?.user) {
    redirect('/auth/login');
  }

  const { user, profile } = result;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {/* Read-only info */}
        <div className="mb-6 space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Email</span>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Role</span>
            <p>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  profile?.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
              >
                {profile?.role || 'broker'}
              </span>
            </p>
          </div>

          {profile?.role === 'broker' && profile?.broker_code && (
            <div>
              <span className="text-sm text-muted-foreground">Broker Code</span>
              <p className="font-medium">{profile.broker_code}</p>
            </div>
          )}
        </div>

        {/* Editable form */}
        <ProfileForm
          userId={user.id}
          initialFullName={profile?.full_name || ''}
        />
      </div>
    </div>
  );
}
