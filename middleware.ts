import { encode, getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';
import { MAX_AGE } from './lib/auth';

const REFRESH_THRESHOLD = 10 * 60 * 1000; // cookie 굽는 단위(시간: 10min)
const SALT = 'authjs.session-token';
const SECRET = process.env.AUTH_SECRET || '';

const NEED_COOKIES = ['/'];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: SECRET });
  const pathname = req.nextUrl.pathname;
  if (!token) {
    if (NEED_COOKIES.includes(pathname) || pathname.includes('/bookcase/'))
      return NextResponse.next();

    return NextResponse.redirect(
      new URL(`/sign?redirectTo=${pathname}`, req.url)
    );
  }

  const exp = token.exp ? token.exp * 1000 : 0;
  // console.log('🚀 ----> exp:', new Date(exp).toLocaleString());
  if (exp - Date.now() < MAX_AGE * 1000 - REFRESH_THRESHOLD) {
    const res = NextResponse.next();
    const newToken = await encode({
      token,
      secret: SECRET,
      salt: SALT,
      maxAge: MAX_AGE,
    });

    res.cookies.set({
      name: SALT,
      value: newToken,
      maxAge: MAX_AGE, // undefined면 브라우저 닫을 때 까지!
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  }

  return NextResponse.next();
}

export const config = {
  // runtime: 'nodejs',

  matcher: [
    '/((?!sign|_next/static|_next/image|api/auth|api/sendmail|forgotpasswd|registcheck|favicon.ico|robots.txt|.well-known|profile|$).*)',
    '/',
  ],
};
