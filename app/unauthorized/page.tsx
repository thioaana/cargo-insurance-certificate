import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">403</h1>
        <h2 className="mb-4 text-xl text-muted-foreground">Access Denied</h2>
        <p className="mb-6 text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
