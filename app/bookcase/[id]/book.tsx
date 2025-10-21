import IconLabel from '@/components/icon-label';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { findBookWithMarkById, type BookAllColumn } from '@/lib/db';
import { cn } from '@/lib/utils';
import { MoreHorizontalIcon, PlusIcon, UserRoundPlusIcon } from 'lucide-react';
import { use } from 'react';
import Mark from './mark';

type Props =
  | { id: number; book?: undefined }
  | { id?: undefined; book: NonNullable<BookAllColumn> };

export default function Book({ id, book }: Props) {
  const data = book ? book : use(findBookWithMarkById(id));
  if (!data)
    return (
      <h1 className='font-semibold text-lg text-muted-foreground'>
        Book is not Found!
      </h1>
    );

  const { id: bookId, title, remark, ispublic, withdel, member } = data;
  const session = use(auth());
  const isMine = session?.user.id === String(member);

  return (
    <div className='flex w-80 flex-shrink-0 flex-col justify-start rounded-lg bg-slate-200 pl-2'>
      <div className='flex items-center justify-between'>
        <h1
          className={cn(
            'truncate p-2 font-semibold text-xl tracking-tighter',
            ispublic
              ? 'text-green-500 text-shadow-green-300'
              : 'text-muted-foreground text-shadow-gray-300'
          )}
        >
          {title}
        </h1>

        {isMine ? (
          <Button
            variant={'ghost'}
            className='font-semibold text-lg hover:bg-slate-300'
          >
            <MoreHorizontalIcon />
          </Button>
        ) : (
          ispublic && (
            <Button
              variant={'ghost'}
              className='font-semibold text-lg hover:bg-slate-300'
            >
              <IconLabel
                icon={<UserRoundPlusIcon className='text-green-500' />}
                noti={'success'}
              >
                <small>28</small>
              </IconLabel>
            </Button>
          )
        )}
      </div>

      {/* mark group */}
      <div className='max-h-full space-y-2 overflow-y-scroll pr-2 pb-3'>
        <Mark />
        <Mark />
      </div>
      {isMine && (
        <div className='my-1 flex justify-between font-medium'>
          <Button
            variant={'ghost'}
            className='flex w-[80%] justify-start font-semibold text-lg hover:bg-slate-300'
          >
            <PlusIcon /> Add a Mark
          </Button>
        </div>
      )}
    </div>
  );
}
