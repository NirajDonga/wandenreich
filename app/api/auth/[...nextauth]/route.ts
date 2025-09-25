import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Document } from 'mongoose';

export const authOptions: AuthOptions = {
  debug: true, // Enable debugging
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Credentials authorize called with:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          await connectDB();
          console.log('Database connected for auth');
          
          const user = await User.findOne({ email: credentials.email });
          console.log('User found:', !!user);
          
          if (!user) {
            console.log('User not found');
            return null;
          }

          const isValid = await user.comparePassword(credentials.password);
          console.log('Password valid:', isValid);
          
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }
          
          // Use type assertion to handle the Mongoose document
          const userDoc = user as Document & {
            _id: { toString(): string };
            name: string;
            email: string;
            role: string;
          };
          
          const result = {
            id: userDoc._id.toString(),
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
          };
          
          console.log('Returning user:', result);
          return result;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only apply restrictions for Google OAuth
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // User doesn't exist - redirect to registration
            console.log('Google user not registered:', user.email);
            return '/auth/signup?error=Please register first&email=' + encodeURIComponent(user.email || '');
          }
          
          console.log('Existing Google user signed in:', user.email);
        } catch (error) {
          console.error('Error checking Google OAuth user:', error);
          return false; // Prevent sign-in if database error
        }
      }
      // For credentials provider, always allow (validation is done in authorize)
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (account?.provider === 'google') {
        // For Google OAuth users, fetch data from database
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            // Use type assertion to handle the Mongoose document
            const userDoc = dbUser as Document & {
              _id: { toString(): string };
              role: string;
            };
            token.id = userDoc._id.toString();
            token.role = userDoc.role;
          }
        } catch (error) {
          console.error('Error fetching user data for token:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-for-development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };