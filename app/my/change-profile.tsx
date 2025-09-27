'use client';

import LabelEditor from '@/components/label-editor';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import { CheckLineIcon, UndoDotIcon } from 'lucide-react';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';
import { updateNickname } from '../sign/sign.action';
import EmailChanger from './email-changer';

type Props = {
  user: {
    isadmin?: boolean | undefined;
  } & User;
};
export default function ChangeProfile({ user }: Props) {
  // const { update } = useSession({ required: true });
  const { update } = useSession();
  const router = useRouter();
  const [isEditingEmail, toggleEditingEmail] = useReducer(pre => !pre, true); // QQQ: false

  const changeNickname = async (formData: FormData) => {
    const ent = Object.fromEntries(formData.entries());
    console.log('🚀 ~ ent:', ent);
    const [err, mbr] = await updateNickname(formData);
    if (err) return err;
    console.log('🚀 ~ mbr:', mbr);
    await update(mbr);
    router.refresh();
  };

  return (
    <div className='space-y-3 text-left'>
      <LabelEditor
        label='nickname'
        name='nickname'
        defaultValue={user.name || ''}
        saveAction={changeNickname}
      />

      {isEditingEmail ? (
        <EmailChanger email={user.email} toggleEditing={toggleEditingEmail} />
      ) : (
        <Button
          onClick={toggleEditingEmail}
          variant={'success'}
          className='mt-3'
        >
          Change {user.email}
        </Button>
      )}

      <LabelInput
        label='Current Password'
        name='curr_passwd'
        type='password'
        placeholder='current password...'
      />
      <LabelInput
        label='New Password'
        name='passwd'
        type='password'
        placeholder='new password...'
      />
      <LabelInput
        label='New Password Confirm'
        name='passwd2'
        type='password'
        placeholder='new password confirm...'
      />

      <div className='flex justify-center gap-5'>
        <Button type='reset' variant={'outline'}>
          <UndoDotIcon /> Cancel
        </Button>
        <Button type='submit' variant={'primary'}>
          <CheckLineIcon /> Save
        </Button>
      </div>
    </div>
  );
}
