'use server';

import { signIn, signOut } from '@/lib/auth';
import { validate, type ValidError } from '@/lib/validator';
import z from 'zod';

type Provider = 'google' | 'github' | 'naver' | 'kakao';

export const login = async (provider: Provider, callback?: string) => {
  await signIn(provider, { redirectTo: callback || '/bookcase' });
};

export const loginNaver = async () => login('naver');

// credential login (email, passwd)
export const authorize = async (
  _preValidError: ValidError | undefined,
  formData: FormData
) => {
  const zobj = z.object({
    email: z.email(),
    passwd: z.string().min(6, 'More than 6 characters!'),
  });
  const [err] = validate(zobj, formData);
  if (err) return err;

  try {
    await signIn('credentials', formData);
  } catch (error) {
    console.log('🚀 ~ error:', error);
    throw error;
  }
};

export const logout = async () => {
  await signOut({ redirectTo: '/sign' }); // QQQ: '/'
};

export const regist = async (
  _preValidError: ValidError | undefined,
  formData: FormData
) => {
  const zobj = z
    .object({
      email: z.email(),
      passwd: z.string().min(6),
      passwd2: z.string().min(6),
      nickname: z.string().min(3),
    })
    .refine(
      ({ passwd, passwd2 }) => passwd === passwd2,
      'Passwords are not matched!'
    );

  const [err] = validate(zobj, formData);
  return err;
};
