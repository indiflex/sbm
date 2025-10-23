'use client';

import { cn } from '@/lib/utils';
import type { ValidError } from '@/lib/validator';
import { type RefObject, useCallback, useId, useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type Prop = {
  name?: string;
  label?: string;
  type?: 'checkbox' | 'switch';
  ref?: RefObject<HTMLButtonElement>;
  error?: ValidError;
  checkValue?: boolean;
  setCheckedFunction?: (checked: boolean) => void;
};

export default function CheckBox({
  label,
  name,
  type,
  ref,
  error,
  checkValue,
  setCheckedFunction,
}: Prop) {
  const [checked, setChecked] = useState(checkValue);
  const uid = useId();

  const { errors, value } =
    error && !!name && error[name] ? error[name] : { errors: [] };
  // console.log('eeeeeeeeeeeerror>>', errors, value);

  const Compo = type === 'switch' ? Switch : Checkbox;

  const setting = useCallback(
    (chk: boolean) => {
      setChecked(chk);
      if (setCheckedFunction) setCheckedFunction(!!chk);
    },
    [setCheckedFunction]
  );

  return (
    <div>
      <div
        className={cn('flex items-center gap-3', { 'mb-5': !errors?.length })}
      >
        <Compo
          id={uid}
          name={type === 'switch' && !!name ? name : uid}
          ref={ref}
          checked={checked || !!value}
          onCheckedChange={checked => setting(!!checked)}
        />
        {label && (
          <Label htmlFor={uid} className='cursor-pointer capitalize'>
            {label}
          </Label>
        )}
      </div>
      {type !== 'switch' && !!name && (
        <Input type='hidden' name={name} value={checked ? 'on' : ''} />
      )}

      {errors?.map(e => (
        <p key={e} className='mt-1 text-red-400 text-sm'>
          {e}
        </p>
      ))}
    </div>
  );
}
