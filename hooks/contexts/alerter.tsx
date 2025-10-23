'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CircleAlertIcon,
  CircleQuestionMarkIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import {
  createContext,
  type PropsWithChildren,
  use,
  useRef,
  useState,
} from 'react';

type AlertContextValueProps = {
  confirm: (options: Options) => Promise<string | undefined>;
  alert: (options: Options) => Promise<string>;
  prompt: (options: Options) => Promise<string>;
};

type Type = 'confirm' | 'alert' | 'prompt';

type Options = {
  title: string;
  description?: string;
  type?: Type;
  variant?: 'destructive' | 'default';
  okText?: string;
  cancelText?: string;
  placeholder?: string;
};

export const AlerterContext = createContext<AlertContextValueProps>({
  confirm: () => new Promise(() => {}),
  alert: () => new Promise(() => {}),
  prompt: () => new Promise(() => {}),
});

export function AlerterProvider({ children }: PropsWithChildren) {
  const [isOpen, setOpen] = useState(false);
  const [options, setOptions] = useState<Options>();
  const [resolver, setResolver] = useState<(value?: string) => void>(() => {});
  const inputRef = useRef<HTMLInputElement>(null);

  const variantIcon = () => {
    if (!options) return;
    if (options.type === 'prompt') return <CircleQuestionMarkIcon />;
    if (options.variant === 'destructive') {
      return options.type === 'alert' ? (
        <OctagonXIcon />
      ) : (
        <TriangleAlertIcon />
      );
    }
    return <CircleAlertIcon />;
  };

  const settings = (options: Options, type: Type) =>
    new Promise<string>(resolve => {
      setOpen(true);
      setOptions({ ...options, type });
      setResolver(() => resolve); // resolve만 주면 resolve함수의 실행결과를 resolver가 갖는다!
    });

  const confirm = (options: Options) => settings(options, 'confirm');
  const alert = (options: Options) => settings(options, 'alert');
  const prompt = (options: Options) => settings(options, 'prompt');

  return (
    <AlerterContext.Provider value={{ confirm, alert, prompt }}>
      {children}

      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent className='w-[80%] translate-y-[-150px] sm:w-96'>
          <AlertDialogHeader>
            <AlertDialogTitle
              className={cn('flex items-center gap-2', {
                'text-destructive': options?.variant === 'destructive',
              })}
            >
              {variantIcon()}
              {options?.title}
            </AlertDialogTitle>
            {options?.description && (
              <AlertDialogDescription>
                {options.description}{' '}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {options?.type === 'prompt' && (
            <Input
              type='text'
              ref={inputRef}
              placeholder={options.placeholder}
            />
          )}

          <AlertDialogFooter>
            {options?.type !== 'alert' && (
              <AlertDialogCancel onClick={() => resolver()}>
                {options?.cancelText ?? 'Cancel'}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={() =>
                !!resolver &&
                resolver(
                  options?.type === 'prompt' ? inputRef.current?.value : 'OK'
                )
              }
              className={cn({
                'bg-destructive text-white hover:bg-destructive/90':
                  options?.type !== 'alert' &&
                  options?.variant === 'destructive',
              })}
            >
              {options?.okText ??
                (options?.type === 'alert' ? 'Confirm' : 'Continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlerterContext.Provider>
  );
}

export const useAlerter = () => use(AlerterContext);
