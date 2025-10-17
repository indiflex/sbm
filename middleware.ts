import { encode, getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';
import { MAX_AGE } from './lib/auth';

const REFRESH_THRESHOLD = 10 * 1000; // cookie 굽는 단위
const SALT = 'authjs.session-token';
const SECRET = process.env.AUTH_SECRET || '';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  // console.log('🚀 -> token:', token);
  const pathname = req.nextUrl.pathname;
  // console.log('🚀 middleware.pathname>>>>>>', pathname);
  if (token?.exp)
    console.log('🚀 middleware.token:', pathname, new Date(token.exp * 1000));

  if (!token)
    return NextResponse.redirect(
      new URL(`/sign?redirectTo=${pathname}`, req.url)
    );

  // const session = await auth();
  // console.log('🚀 -> session:', session);
  // const didLogin = !!session?.user?.email;
  // if (!didLogin) {
  //   return NextResponse.redirect(
  //     new URL(`/sign?redirectTo=${pathname}`, req.url)
  //   );
  // }

  const exp = token.exp ? token.exp * 1000 : 0;
  const remaining = exp - Date.now();
  console.log('🚀 ~ remaining:', remaining);
  if (remaining < MAX_AGE * 1000 - REFRESH_THRESHOLD) {
    const res = NextResponse.next();
    // const sessionToken = req.cookies.get('authjs.session-token')?.value || '';
    // const sessionToken =
    //   (await cookies()).get('authjs.session-token')?.value || '';
    // const decodedToken = await decode({
    //   token: sessionToken,
    //   secret: SECRET,
    //   salt: SALT,
    // });
    // console.log('🚀 -> decodedToken:', decodedToken);

    const newJWT = await encode({
      token, // same as token: decodedToken,
      secret: SECRET,
      salt: SALT,
      maxAge: MAX_AGE,
    });

    res.cookies.set({
      name: SALT,
      value: newJWT,
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
  // runtime: 'nodejs',  // node runtime에서 middleware 실행됨!

  matcher: [
    '/((?!sign|_next/static|_next/image|api/auth|api/sendmail|forgotpasswd|registcheck|favicon.ico|robots.txt|.well-known|$).*)',
    '/', // (warning!) 홈은 위에서 제외되므로 여기서 반드시 추가해야 쿠키 갱신됨!
    // '/api/:path*',
  ],
};
