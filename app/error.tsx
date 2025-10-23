'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // useEffect(() => {}, [error]);

  return (
    <div>
      <h2 className='text-2xl'>Something went wrong!</h2>
      {process.env.NODE_ENV === 'development' ? (
        <pre className='font-sm text-red-500'>
          {error.stack || error.message}
        </pre>
      ) : (
        <div className='text-red-500'>{error.message}</div>
      )}
      <div className='flex gap-3'>
        <Button onClick={() => reset()}>Try again</Button>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    </div>
  );
}
