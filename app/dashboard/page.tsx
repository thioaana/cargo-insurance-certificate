import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/services/profiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, FileText, FolderOpen, Users } from 'lucide-react';

export default async function DashboardPage() {
  let currentProfile;
  try {
    currentProfile = await getCurrentProfile();
  } catch (error) {
    // Database error - redirect to error page
    redirect('/auth/error?message=Failed to load profile');
  }

  if (!currentProfile) {
    redirect('/auth/login');
  }

  const isAdmin = currentProfile.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {currentProfile.full_name || 'User'}</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Administrator Dashboard' : 'Broker Dashboard'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Create New Certificate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FilePlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">New Certificate</CardTitle>
                <CardDescription>Create a new insurance certificate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/certificates/new">Create Certificate</Link>
            </Button>
          </CardContent>
        </Card>

        {/* View Certificates */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {isAdmin ? 'All Certificates' : 'My Certificates'}
                </CardTitle>
                <CardDescription>
                  {isAdmin ? 'View and manage all certificates' : 'View your issued certificates'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/certificates">View Certificates</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Admin Only: Manage Contracts */}
        {isAdmin && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Contracts</CardTitle>
                  <CardDescription>Manage insurance contracts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/contracts">Manage Contracts</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Admin Only: User Management */}
        {isAdmin && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Users</CardTitle>
                  <CardDescription>Manage user accounts and roles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
