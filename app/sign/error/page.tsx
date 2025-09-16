import Link from 'next/link';
import { use } from 'react';

type Props = {
  searchParams: Promise<{ error: string; email?: string }>;
};

const getMessage = (error: string) => {
  if (error === 'InvalidEmailCheck') return 'Invalid Email Authorization Key!';
  if (error === 'CheckEmail') return 'Check Your Email, Plz!';
};

export default function AuthError({ searchParams }: Props) {
  const { error, email } = use(searchParams);

  return (
    <div className='grid h-full place-items-center'>
      <div className='text-center'>
        <h1 className='mb-5 font-semibold text-2xl'>{error}</h1>
        <div className='mb-5 text-red-500'>{getMessage(error)}</div>

        <div className=''>
          <Link href={`/sign?email=${email}`} className='w-full'>
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
