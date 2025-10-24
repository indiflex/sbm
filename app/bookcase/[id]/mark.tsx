'use client';

import IconLabel from '@/components/icon-label';
import ToolTip from '@/components/tool-tip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { MarkWithCountData } from '@/lib/db';
import {
  BookmarkXIcon,
  HatGlassesIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  ThumbsUpIcon,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteMark } from './book.action';

export default function Mark({ mark }: { mark: MarkWithCountData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const isMine =
    session?.user.isadmin || session?.user.id === String(mark.maker);

  const openTab = async () => {
    console.log('--> openTab::', mark.title);
    await deleteMark(mark.id);
    router.refresh();
  };

  return (
    <div className='group cursor-pointer rounded-lg bg-slate-50 p-2 pb-0.5 shadow-md hover:bg-white hover:shadow-lg'>
      <Link
        href={mark.link}
        onClick={openTab}
        target='_blank'
        rel='noopener noreferrer'
        className='card'
      >
        <div className='flex items-center gap-2'>
          <Avatar className='size-auto h-16 max-w-[50%] rounded-lg border group-hover:ring-2 group-hover:ring-primary'>
            <AvatarImage src={mark.image || '/site_dummy.jpg'} />
            <AvatarFallback className='w-[150%]'>
              {mark.title.substring(0, 8)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col overflow-hidden'>
            <h3 className='truncate font-medium text-lg dark:text-black/80'>
              {mark.title}
            </h3>
            <small className='truncate text-muted-foreground'>
              {mark.descript || mark.title}
            </small>
            <small className='truncate text-muted-foreground underline-offset-3 group-hover:underline'>
              {mark.link}
            </small>
          </div>
        </div>
        <Separator className='mt-2 mb-0.5 bg-muted-foreground/30' />
        <div className='flex items-center justify-between pl-2 text-sm'>
          <IconLabel icon={<ThumbsUpIcon />}>24</IconLabel>
          <Button
            variant={'ghost'}
            className='h-[80%] py-1 dark:hover:bg-muted-foreground/30'
          >
            <IconLabel icon={<MessageCircleIcon />}>36</IconLabel>
          </Button>
          <IconLabel icon={<HatGlassesIcon />}>12</IconLabel>
          {isMine && (
            <>
              <ToolTip content='바로 삭제' variant='destructive'>
                <Button
                  variant={'ghost'}
                  className='h-[80%] py-1 text-destructive'
                >
                  <BookmarkXIcon className='size-5' />
                </Button>
              </ToolTip>
              <Button
                variant={'ghost'}
                className='h-[80%] py-1.5 dark:text-black/70 dark:hover:bg-muted-foreground/30'
              >
                <MoreHorizontalIcon />
              </Button>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
