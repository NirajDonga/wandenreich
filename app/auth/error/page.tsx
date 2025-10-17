'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.';
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.';
      case 'Callback':
        return 'Error in the OAuth callback handler route.';
      case 'OAuthAccountNotLinked':
        return 'Email already exists with a different sign-in method.';
      case 'EmailSignin':
        return 'Failed to send verification email.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Authentication Error
          </h2>
          <p className="text-slate-600">
            Something went wrong during authentication
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-red-200/50 p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm font-medium">
              {getErrorMessage(error)}
            </p>
            {error && (
              <p className="text-red-600 text-xs mt-2">
                Error code: {error}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-center"
            >
              Try Again
            </Link>
            
            <Link
              href="/"
              className="block w-full py-3 px-4 bg-white/90 backdrop-blur-xl text-slate-700 font-semibold rounded-xl border border-slate-300 hover:shadow-lg transition-all duration-200 text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            If this problem persists, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-700">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
