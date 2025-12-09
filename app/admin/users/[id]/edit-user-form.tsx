'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserRoleAction } from '../actions';
import type { Profile, UserRole } from '@/lib/types/profile';
import toast from 'react-hot-toast';

interface EditUserFormProps {
  profile: Profile;
}

export default function EditUserForm({ profile }: EditUserFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [role, setRole] = useState<UserRole>(profile.role);
  const [brokerCode, setBrokerCode] = useState(profile.broker_code || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await updateUserRoleAction(profile.id, {
        full_name: fullName,
        role,
        broker_code: role === 'broker' ? brokerCode || null : null,
      });

      if (result.success) {
        toast.success('User updated');
        router.push('/admin/users');
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isLoading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="broker">Broker</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === 'broker' && (
          <div>
            <Label htmlFor="brokerCode">Broker Code</Label>
            <Input
              id="brokerCode"
              type="text"
              value={brokerCode}
              onChange={(e) => setBrokerCode(e.target.value)}
              placeholder="Enter broker code"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Used to assign contracts to this broker
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/users')}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
