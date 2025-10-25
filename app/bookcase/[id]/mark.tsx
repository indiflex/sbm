'use client';

import IconLabelButton from '@/components/icon-label-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
          <Avatar className='size-auto h-16 max-w-[50%] rounded-lg group-hover:ring-2 group-hover:ring-primary'>
            <AvatarImage src={mark.image || '/site_dummy.jpg'} />
            <AvatarFallback className='w-full'>
              {mark.title.substring(0, 8)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col overflow-hidden [&>*]:truncate'>
            <h3
              className='font-medium text-lg dark:text-black/80'
              title={mark.title}
            >
              {mark.title}
            </h3>
            <small className='text-muted-foreground'>
              {mark.descript || mark.title}
            </small>
            <small className='text-muted-foreground underline-offset-3 group-hover:underline'>
              {mark.link}
            </small>
          </div>
        </div>
        <Separator className='mt-2 mb-0.5 bg-muted-foreground/30' />
        <div className='flex items-center justify-between pl-2 text-sm'>
          <IconLabelButton icon={<ThumbsUpIcon />} isActive={true}>
            {mark._count.Likes}
          </IconLabelButton>
          <IconLabelButton icon={<MessageCircleIcon />}>
            {mark._count.Talk}
          </IconLabelButton>
          <IconLabelButton
            icon={<HatGlassesIcon />}
            isActive={false}
            tooltip='Report'
            isDanger
          >
            {mark._count.Report}
          </IconLabelButton>
          {isMine && (
            <>
              <IconLabelButton
                icon={<BookmarkXIcon className='size-5' />}
                isDanger={true}
                tooltip='Delete this Mark right away'
              />

              <IconLabelButton icon={<MoreHorizontalIcon />} />
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
