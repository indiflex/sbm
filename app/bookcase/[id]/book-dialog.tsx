'use client';

import CheckBox from '@/components/check-box';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAlerter } from '@/hooks/contexts/alerter';
import type { BookData } from '@/lib/db';
import type { ValidError } from '@/lib/validator';
import { useRouter } from 'next/navigation';
import {
  useActionState,
  useState,
  useTransition,
  type PropsWithChildren,
} from 'react';
import { deleteBook, saveBook } from './book.action';

export default function BookDialog({
  book = {
    id: 0,
    title: '',
    ispublic: true,
    withdel: false,
    remark: '',
    member: 0,
  },
  children,
}: PropsWithChildren<{
  book?: BookData;
}>) {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);

  const { confirm, alert, prompt } = useAlerter();

  const [validError, save, isPending] = useActionState(
    async (_: ValidError | undefined, formData: FormData) => {
      if (book.id) formData.set('id', String(book.id));
      const err = await saveBook(formData);
      if (err) {
        return err;
      }

      router.refresh();
      setOpen(false);
    },
    undefined
  );

  const [isLoading, startTransition] = useTransition();
  const remove = async () => {
    // const ret = await prompt({
    //   title: '탈퇴하시려면 인증 번호를 입력하세요!',
    //   placeholder: '인증번호...',
    // });
    // console.log('Number is ', ret);
    const ret = await confirm({
      title: '정말 삭제하시겠어요??',
      description: '삭제 후에는 복원할 수 없습니다!',
      variant: 'destructive',
      okText: '삭제',
      cancelText: '취소',
    });
    console.log('🚀 ~ ret:', ret);
    if (!ret) return;

    startTransition(async () => {
      const err = await deleteBook(book.id + 100);
      if (err) {
        setOpen(false);
        await alert({ title: err.id.errors[0], variant: 'destructive' });
        return;
      }

      router.refresh();
      setOpen(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form action={save}>
          <DialogHeader>
            <DialogTitle>{book.id ? 'Edit' : 'Create'} Book</DialogTitle>
            <DialogDescription>descript...</DialogDescription>
          </DialogHeader>

          <div className='mt-5 space-y-5'>
            <LabelInput
              label='title'
              name='title'
              error={validError}
              defaultValue={book.title}
            />

            {/* <div className='flex items-center gap-3'>
              <Checkbox
                id='ispublic'
                name='ispublic'
                checked={ispublic}
                onCheckedChange={checked => setPublic(!!checked)}
              />
              <Label htmlFor='ispublic' className='cursor-pointer'>
                Public Book
              </Label>
            </div> */}
            <CheckBox
              label='public book'
              name='ispublic'
              error={validError}
              checkValue={book.ispublic}
            />

            <CheckBox
              label='Open with deletion'
              name='withdel'
              type='switch'
              error={validError}
              checkValue={book.withdel}
            />

            {/* <div>
              <div className='flex items-center gap-3'>
                <Switch
                  id='withdel'
                  name='withdel'
                  checked={withdel}
                  onCheckedChange={checked => setWithdel(!!checked)}
                />
                <Label htmlFor='withdel'>
                  Open with deletion: {!!validError?.withdel?.value && 'xx'}
                </Label>
              </div>
              <p className='mt-1 text-red-500 text-sm'>
                {validError?.withdel?.errors[0]}
              </p>
            </div> */}

            <div className='flex flex-col'>
              <Label
                htmlFor='remark'
                className='font-semibold text-sm capitalize'
              >
                Description
              </Label>
              <Textarea
                placeholder='description...'
                id='remark'
                name='remark'
                defaultValue={book.remark ?? ''}
              />
            </div>
          </div>

          <DialogFooter className='mt-5'>
            <DialogClose asChild>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>

            {!!book.id && (
              <Button onClick={remove} type='button' variant={'destructive'}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            )}

            <Button type='submit' disabled={isPending}>
              {book.id ? 'Save' : 'Create'} Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
