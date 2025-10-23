import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { MarkWithCountData } from '@/lib/db';

export default function Mark({ mark }: { mark: MarkWithCountData }) {
  return (
    <div className='group rounded-lg bg-white p-2 shadow-md hover:shadow-2xl'>
      <div className='flex items-center gap-2'>
        <Avatar className='size-auto h-16 max-w-[50%] rounded-lg border group-hover:ring-2 group-hover:ring-sky-500'>
          <AvatarImage src={mark.image || '/site_dummy.jpg'} />
          <AvatarFallback>{mark.title.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col overflow-hidden'>
          <h3 className='truncate text-lg'>{mark.title}</h3>
          <small className='truncate text-muted-foreground'>
            {mark.descript || mark.title}
          </small>
          <small className='truncate text-muted-foreground'>{mark.link}</small>
        </div>
      </div>
    </div>
  );
}
