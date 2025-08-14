import { createUser, getUserByEmail } from '@/services/userService';
import bcrypt from 'bcrypt';
import NextAuth,
{
  Account,
  AuthOptions,
  User as NextAuthUser,
  Session,
} from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);

        if (user && user._id && user.hashedPassword) {
          const isPasswordMatch = await bcrypt
            .compare(credentials.password, user.hashedPassword)
            .catch(() => false);

          if (isPasswordMatch) {
            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: NextAuthUser;
      account: Account | null;
    }) {
      if (account?.provider === 'google') {
        if (user.email && user.email.endsWith('@runsystem.net')) {
          const existingUser = await getUserByEmail(user.email);
          if (!existingUser) {
            const { CLIENT_PASSWORD } = process.env;
            if (!CLIENT_PASSWORD) {
              console.error(
                'CLIENT_PASSWORD is not set in environment variables.',
              );
              return false;
            }
            const hashedPassword = await bcrypt.hash(CLIENT_PASSWORD, 10);
            await createUser({
              name: user.name || '',
              email: user.email,
              role: 'user',
              hashedPassword,
              image: user.image || '',
            });
          }
          return true;
        } else {
          return '/login?error=InvalidEmailDomain';
        }
      }
      return true;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user: NextAuthUser & { role?: string };
      account: Account | null;
    }) {
      if (account && user) {
        if (account.provider === 'google') {
          if (user.email) {
            const sanityUser = await getUserByEmail(user.email);
            if (sanityUser) {
              token.id = sanityUser._id;
              token.role = sanityUser.role;
              token.name = sanityUser.name;
            }
          }
        } else {
          token.id = user.id;
          token.role = user.role;
          token.name = user.name;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
