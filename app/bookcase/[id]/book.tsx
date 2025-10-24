import IconLabel from '@/components/icon-label';
import ToolTip from '@/components/tool-tip';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { findBookWithMarkById, type BookAllColumn } from '@/lib/db';
import { cn } from '@/lib/utils';
import {
  AlbumIcon,
  BookKeyIcon,
  CopyXIcon,
  HeartPlusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  UserRoundPlusIcon,
} from 'lucide-react';
import { use } from 'react';
import BookDialog from './book-dialog';
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

  const { title, remark, ispublic, withdel, member, Mark: marks } = data;
  const session = use(auth());
  const isMine = session?.user.id === String(member);

  return (
    <div className='flex w-72 flex-shrink-0 flex-col justify-start rounded-lg bg-slate-200 pl-2 dark:bg-muted'>
      <div className='flex items-center justify-between pr-2'>
        <h1
          className={cn(
            'flex items-center truncate p-2 font-semibold text-xl tracking-tighter',
            ispublic
              ? 'text-green-600 text-shadow-green-300'
              : 'text-muted-foreground text-shadow-gray-300'
          )}
          title={remark || ''}
        >
          {!ispublic && <BookKeyIcon />}
          {title}
        </h1>

        {isMine ? (
          <BookDialog book={book}>
            <Button
              variant={'ghost'}
              className='font-semibold text-lg hover:bg-muted-foreground/30 dark:hover:bg-muted-foreground/30'
            >
              <MoreHorizontalIcon />
            </Button>
          </BookDialog>
        ) : (
          ispublic && (
            <Button
              variant={'ghost'}
              className='font-semibold hover:bg-slate-200'
            >
              <IconLabel
                icon={<UserRoundPlusIcon className='size-6 text-green-500' />}
                noti='destructive'
              >
                27
              </IconLabel>
            </Button>
          )
        )}
      </div>

      {/* mark group */}
      <div className='max-h-full space-y-2 overflow-y-scroll pr-2 pb-3'>
        {marks?.length ? (
          marks.map(mark => <Mark key={mark.id} mark={mark} />)
        ) : (
          <h1 className='rounded-lg bg-white p-5 font-medium text-muted-foreground text-xl'>
            There is no Marks.
          </h1>
        )}
      </div>
      {isMine && (
        <div className='my-1 flex items-center justify-between pr-2 font-medium'>
          <Button
            variant={'ghost'}
            className='flex rounded-full font-semibold text-lg hover:bg-muted-foreground/30 dark:hover:bg-muted-foreground/30'
          >
            <PlusIcon /> Add a Mark
          </Button>

          <div className='flex items-center gap-2 text-sm'>
            <IconLabel icon={<AlbumIcon />} tight={true}>
              {marks.length}
            </IconLabel>
            {ispublic && (
              <IconLabel
                icon={<HeartPlusIcon className='text-red-300' />}
                tight={true}
              >
                12
              </IconLabel>
            )}
            <ToolTip content='Open With Del' variant='destructive'>
              <CopyXIcon className='text-red-500' size={18} />
            </ToolTip>
          </div>
        </div>
      )}
    </div>
  );
}
