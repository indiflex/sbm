import { findMemberByEmail } from '@/app/sign/sign.action';
import { compare } from 'bcryptjs';
import NextAuth, { AuthError } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import z from 'zod';
import prisma from './db';
import { validateObject } from './validator';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google,
    Github,
    Kakao,
    Naver,
    Credentials({
      credentials: {
        email: {},
        passwd: {},
      },
      async authorize(credentials) {
        console.log('credentials>>', credentials);
        const zobj = z.object({
          email: z.email('Invalid Email Format!'),
          passwd: z.string().min(6, 'More than 6 characters!'),
        });

        const [err, data] = validateObject(zobj, credentials);
        if (err) return err;

        return data;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile, account }) {
      const isCredential = account?.provider === 'credentials';
      console.log('🚀 ~ isCredential:', isCredential);
      console.log('🚀 ~ profile:', profile);
      console.log('🚀 ~ user:', user);
      const { email, name: nickname, image } = user;
      if (!email) return false;

      const mbr = await findMemberByEmail(email, isCredential);
      console.log('🚀 ~ mbr:', mbr);
      if (mbr?.emailcheck) {
        return `/sign/error?error=CheckEmail&email=${email}&emailcheck=${mbr.emailcheck}`;
      }

      if (isCredential) {
        if (!mbr) throw authError('Not Exists Member!', 'EmailSignInError');
        if (mbr.outdt) throw authError('Withdrawed Member!', 'AccessDenied');
        if (!mbr.passwd)
          throw authError('RegistedBySNS', 'OAuthAccountNotLinked');

        const isValidPasswd = await compare(user.passwd ?? '', mbr.passwd);
        if (!isValidPasswd)
          throw authError('Invalid Password!', 'CredentialsSignin');
      } else {
        // SNS 자동가입!
        if (!mbr && nickname) {
          await prisma.member.create({
            data: { email, nickname, image },
          });
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, account, session }) {
      console.log('🚀 ~ account:', account);
      const userData = trigger === 'update' ? session : user;
      if (userData) {
        token.id = userData.id;
        token.email = userData.email;
        token.name = userData.name || userData.nickname;
        token.image = userData.image;
        token.isadmin = userData.isadmin;

        if (account) {
          token.accessToken = account?.access_token;
          token.accessTokenExpires =
            Date.now() + (account.expires_in ?? 0) * 1000;
          token.refreshToken = account.refresh_token;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id?.toString() || '';
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.isadmin = token.isadmin;
      }
      return session;
    },
  },

  trustHost: true,
  jwt: { maxAge: 30 * 60 },
  pages: {
    signIn: '/sign',
    error: '/sign/error',
  },
  session: {
    strategy: 'jwt',
  },
});

function authError(message: string, type: AuthError['type']) {
  const authError = new AuthError(message);
  authError.type = type as typeof authError.type;
  return authError;
}
