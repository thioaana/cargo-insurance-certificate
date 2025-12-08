Review the codebase for security best practices. Check for:

1. **Authentication & Authorization**
   - Proper session handling
   - Protected routes and middleware
   - User input validation

2. **Data Security**
   - SQL injection vulnerabilities
   - XSS (Cross-Site Scripting) risks
   - Sensitive data exposure (API keys, passwords, tokens)

3. **API Security**
   - CSRF protection
   - Rate limiting considerations
   - Proper error handling (no stack traces exposed)

4. **Dependencies**
   - Known vulnerabilities in packages
   - Outdated dependencies

5. **Environment Variables**
   - Secrets properly stored in .env files
   - .env files in .gitignore

6. **Supabase Specific**
   - Row Level Security (RLS) policies
   - Storage bucket policies
   - Proper use of server vs client Supabase clients

Provide a summary of findings with severity levels (Critical, High, Medium, Low) and recommendations for fixes.
