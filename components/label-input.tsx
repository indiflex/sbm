import { cn } from '@/lib/utils';
import { type ComponentProps, type RefObject, useId } from 'react';
import { Input } from './ui/input';

type Props = {
  label: string;
  type?: string;
  name?: string;
  ref?: RefObject<HTMLInputElement | null>;
  placeholder?: string;
  className?: string;
};

export default function LabelInput({
  label,
  type,
  name,
  ref,
  placeholder,
  className,
  ...props
}: Props & ComponentProps<'input'>) {
  const uniqName = useId();
  return (
    <label htmlFor={uniqName} className='font-semibold text-sm capitalize'>
      {label}
      <Input
        type={type || 'text'}
        id={uniqName}
        name={name || uniqName}
        ref={ref}
        placeholder={placeholder || ''}
        className={cn('bg-gray-100 font-normal focus:bg-white', className)}
        {...props}
      />
    </label>
  );
}
