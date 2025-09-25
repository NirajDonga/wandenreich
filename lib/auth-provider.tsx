import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function withAuth(Component: any) {
  return function AuthenticatedComponent(props: AppProps) {
    return (
      <SessionProvider session={props.pageProps.session}>
        <Component {...props} />
      </SessionProvider>
    );
  };
}