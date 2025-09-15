import { findMemberByEmail } from '@/app/sign/sign.action';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ emailcheck: string }>;
  searchParams: Promise<{ email: string }>;
};

export default async function RegistCheck({ params, searchParams }: Props) {
  const { emailcheck } = await params;
  const { email } = await searchParams;

  const mbr = await findMemberByEmail(email);
  console.log('🚀 ~ mbr:', mbr);
  if (emailcheck !== mbr?.emailcheck)
    redirect('/sign/error?error=InvalidEmailCheck');

  return (
    <h1>
      {email}:{emailcheck} - {mbr?.nickname}
    </h1>
  );
}
