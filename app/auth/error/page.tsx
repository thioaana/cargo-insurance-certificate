import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Map error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  verification_failed: "Email verification failed. The link may have expired or already been used.",
  invalid_request: "Invalid request. Please try again or request a new verification email.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;

  // Get user-friendly message from code, or use generic message
  const errorCode = params?.code || params?.error;
  const message = errorCode && errorMessages[errorCode]
    ? errorMessages[errorCode]
    : "An unexpected error occurred. Please try again.";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
