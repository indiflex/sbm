'use client';

import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { BookData } from '@/lib/db';
import type { ValidError } from '@/lib/validator';
import { useRouter } from 'next/navigation';
import {
  useActionState,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { deleteBook, saveBook } from './book.action';

export default function BookDialog({
  book = {
    id: 0,
    title: '',
    ispublic: false,
    withdel: false,
    remark: '',
    member: 0,
  },
  children,
}: PropsWithChildren<{
  book?: BookData;
}>) {
  const router = useRouter();
  const [ispublic, setPublic] = useState(false);
  const [withdel, setWithdel] = useState(false);

  const [validError, save, isPending] = useActionState(
    async (_: ValidError | undefined, formData: FormData) => {
      const err = await saveBook(formData);
      console.log('🚀 ~ err:', err, ispublic);
      if (err) {
        return err;
      }

      router.refresh();
    },
    undefined
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    console.log('xxxxxxx>>', book, validError?.ispublic);
    if (book) {
      setPublic(book.ispublic || !!validError?.ispublic?.value);
      // setWithdel(book.withdel || !!validError?.withdel?.value);
    }
  }, [validError]);

  const remove = async () => {
    await deleteBook(book.id);
    router.refresh();
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form action={save}>
          <DialogHeader>
            <DialogTitle>{book.id ? 'Create' : 'Edit'} Book</DialogTitle>
            <DialogDescription>descript...</DialogDescription>
          </DialogHeader>

          <div className='mt-5 space-y-5'>
            <LabelInput
              label='title'
              name='title'
              error={validError}
              defaultValue={book.title}
            />

            <div className='flex items-center gap-3'>
              <Checkbox
                id='ispublic'
                name='ispublic'
                checked={ispublic}
                onCheckedChange={checked => setPublic(!!checked)}
              />
              <Label htmlFor='ispublic' className='cursor-pointer'>
                Public {ispublic && 'XX'}
              </Label>
            </div>

            <div>
              <div className='flex items-center gap-3'>
                <Checkbox
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
            </div>

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
                Delete
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
