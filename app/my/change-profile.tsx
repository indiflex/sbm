'use client';

import LabelEditor from '@/components/label-editor';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';
import { updateNickname } from '../sign/sign.action';
import EmailChanger from './email-changer';
import PasswordChanger from './password-changer';

type Props = {
  user: {
    isadmin?: boolean | undefined;
  } & User;
};
export default function ChangeProfile({ user }: Props) {
  // const { update } = useSession({ required: true });
  const { update } = useSession();
  const router = useRouter();
  const [isEditingEmail, toggleEditingEmail] = useReducer(pre => !pre, false);
  const [isEditingPassword, toggleEditingPassword] = useReducer(
    pre => !pre,
    true
  ); // QQQ (false)

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
    <div className='flex flex-col gap-7 text-left'>
      <LabelEditor
        label='nickname'
        name='nickname'
        defaultValue={user.name || ''}
        saveAction={changeNickname}
      />

      <div className='w-96'>
        {isEditingEmail ? (
          <EmailChanger email={user.email} toggleEditing={toggleEditingEmail} />
        ) : (
          <Button
            onClick={toggleEditingEmail}
            variant={'success'}
            className='mt-3 h-12 w-full'
          >
            <PencilIcon /> {user.email}
          </Button>
        )}
      </div>

      <div className='w-96'>
        {isEditingPassword ? (
          <PasswordChanger toggleEditing={toggleEditingPassword} />
        ) : (
          <Button
            onClick={toggleEditingPassword}
            variant={'destructive'}
            className='mt-3 h-12 w-full'
          >
            <PencilIcon /> Password
          </Button>
        )}
      </div>
    </div>
  );
}
