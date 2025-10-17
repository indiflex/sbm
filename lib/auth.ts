import NextAuth, { AuthError } from 'next-auth';
// import { decode, encode } from 'next-auth/jwt';
// import { encode, decode } from '@auth/core/jwt';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import z from 'zod';
import prisma, { findMemberByEmail } from './db';
import { comparePassword, validateObject } from './validator';

export const MAX_AGE = 1 * 60; // 30min

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Github,
    Kakao,
    Naver,
    Credentials({
      credentials: {
        email: {},
        passwd: {},
      },
      async authorize(credentials) {
        // console.log('credentials>>', credentials);
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
      // signIn함수는 login 할 때만 실행되는 함수!
      const isCredential = account?.provider === 'credentials';
      if (profile) console.log('🚀 ~ profile:', profile);
      // console.log('🚀 ~ user:', user);
      const { email, name: nickname, image } = user;
      if (!email) return false;

      let mbr = await findMemberByEmail(email, isCredential);
      // console.log('🚀 ~ mbr:', mbr);
      if (mbr?.emailcheck) {
        return `/sign/error?error=CheckEmail&email=${email}&emailcheck=${mbr.emailcheck}`;
      }

      if (isCredential) {
        if (!mbr) throw authError('Not Exists Member!', 'EmailSignInError');
        if (mbr.outdt) throw authError('Withdrawed Member!', 'AccessDenied');
        if (!mbr.passwd)
          throw authError('RegistedBySNS', 'OAuthAccountNotLinked');

        const isValidPasswd = await comparePassword(user.passwd, mbr.passwd);
        if (!isValidPasswd)
          throw authError('Invalid Password!', 'CredentialsSignin');
      } else {
        // SNS 자동가입!
        if (!mbr) {
          mbr = await prisma.member.create({
            data: { email, nickname: nickname || 'guest', image },
          });
        }
      }

      user.id = String(mbr.id);
      user.name = mbr.nickname;
      if (mbr.image) user.image = mbr.image;
      user.isadmin = mbr.isadmin;

      return true;
    },

    async jwt({ token, user, trigger, account, session }) {
      if (account) console.log('🚀 ~ account:', account);
      // console.log('🚀 ~ user:', user);
      if (token.exp)
        console.log('🚀 jwt.token:', new Date(token.exp * 1000), new Date());

      // session은 갱신(useSession.update) 할 때만 존재하고, user와 account는 login 할 때만 존재 함!
      // 즉, token은 login 시에는 name/email/picture/sub만 있다가 나중에 검증(로긴체크)할 때는 아래에서 세팅한 모든 값 가짐!
      // (참고) token의 name/email/picture/sub 는 user의 값에서 자동으로 세팅됨!
      const userData = trigger === 'update' ? session : user;
      if (userData) {
        token.id = userData.id;
        token.email = userData.email;
        token.name = userData.name || userData.nickname;
        token.image = userData.image;
        token.isadmin = userData.isadmin;
      }

      // const now = Math.floor(Date.now() / 1000);
      // token.iat = now;
      // token.exp = now + MAX_AGE;

      return token;
    },

    async session({ session, token }) {
      // console.log('🚀 session.session:', session);
      // console.log('🚀 session.token:', token);
      if (token) {
        session.user.id = token.id?.toString() || '';
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.isadmin = token.isadmin;
      }
      // if (token.exp) session.expires = new Date(token.exp * 1000);
      // console.log('🚀 ~ session:', session);
      return session;
    },
  },

  trustHost: true,
  jwt: {
    maxAge: MAX_AGE,
    // async encode(params) {
    //   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!EE', params.token);
    //   const enc = encode(params);
    //   // console.log('🚀 ~ enc:', enc);
    //   return enc;
    // },
    // async decode(params) {
    //   const dec = decode(params);
    //   console.log('🚀 ~ dec:', await dec);
    //   return dec;
    // },
  },
  pages: {
    signIn: '/sign',
    error: '/sign/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: MAX_AGE,
    // updateAge: 10,
  },
});

function authError(message: string, type: AuthError['type']) {
  const authError = new AuthError(message);
  authError.type = type as typeof authError.type;
  return authError;
}
