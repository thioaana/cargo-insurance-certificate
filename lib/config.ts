// Application configuration
// Use these constants instead of window.location.origin for security

// Base URL - set in environment or fallback to localhost for development
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Allowed redirect paths for authentication flows
export const AUTH_REDIRECT_PATHS = {
  afterSignUp: "/dashboard",
  afterPasswordReset: "/auth/update-password",
} as const;

// Build full redirect URLs using server-defined base
export const getAuthRedirectUrl = (path: keyof typeof AUTH_REDIRECT_PATHS): string => {
  return `${APP_URL}${AUTH_REDIRECT_PATHS[path]}`;
};
