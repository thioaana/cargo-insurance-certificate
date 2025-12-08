import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProfile } from '@/lib/services/profiles';
import EditUserForm from './edit-user-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Users
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Edit User</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <span className="text-sm text-muted-foreground">User ID</span>
          <p className="font-mono text-sm">{profile.id}</p>
        </div>

        <EditUserForm profile={profile} />
      </div>
    </div>
  );
}
