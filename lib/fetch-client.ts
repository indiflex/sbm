import { auth } from './auth';

export const fetchClient = async (url: string | URL, options: RequestInit) => {
  const session = await auth();

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(session && { Authorization: `Bearer ${session.accessToken}` }),
    },
  });
};

export const fetchData = async <T>(url: string | URL, options: RequestInit) => {
  const ret = await fetchClient(url, options);
  const { status, statusText } = ret;
  if (!ret.ok) return [{ status, statusText }] as const;

  const data = await ret.json();
  return [undefined, data as T] as const;
};
