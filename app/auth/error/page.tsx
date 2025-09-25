'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  let errorMessage = 'An error occurred during authentication.';
  
  switch (error) {
    case 'CredentialsSignin':
      errorMessage = 'Invalid email or password. Please try again.';
      break;
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'OAuthAccountNotLinked':
      errorMessage = 'There was a problem with your social sign in. Please try again.';
      break;
    case 'Callback':
      errorMessage = 'There was a problem with the authentication callback. Please try again.';
      break;
    case 'AccessDenied':
      errorMessage = 'Access denied. You do not have permission to access this resource.';
      break;
    default:
      errorMessage = 'An unexpected authentication error occurred. Please try again.';
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-left">
          <div className="text-red-700">{errorMessage}</div>
        </div>
        
        <div className="flex space-x-4 justify-center">
          <Link href="/auth/signin" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Back to Sign In
          </Link>
          
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}