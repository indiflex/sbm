'use client';

import { logout } from '@/app/sign/sign.action';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';

export default function SignOutButton() {
  const session = useSession();

  return (
    <form action={logout}>
      <Button variant={'success'}>Sign Out {session.data?.user?.name}</Button>
    </form>
  );
}
