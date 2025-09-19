'use client';

import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useActionState } from 'react';
import { sendResetPassword } from '../sign/sign.action';

export default function ForgotPasswd() {
  const [validError, sendmail, isPending] = useActionState(
    sendResetPassword,
    undefined
  );
  return (
    <div className='grid h-full place-items-center'>
      {/* <div className='w-96 rounded-md border p-5 shadow-md'> */}
      <div className='w-96'>
        <h1 className='mb-3 font-semibold text-2xl'>Forget Password</h1>
        <div className='mb-5 text-gray-500 text-sm'>
          Enter your email address when joined, and send to instructions to
          reset password.
        </div>

        <form action={sendmail} className=''>
          <LabelInput
            label='email'
            name='email'
            type='email'
            focus={true}
            error={validError}
            placeholder='email@bookmark.com'
          />

          <Button
            type='submit'
            variant={'success'}
            className='my-5 w-full'
            disabled={isPending}
          >
            Send Instructions Email
          </Button>
        </form>

        <div className='text-center'>
          Back to <Link href='/sign'>Login</Link>
        </div>
      </div>
    </div>
  );
}
