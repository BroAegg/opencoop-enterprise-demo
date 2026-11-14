'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Link({ href, children, className, onClick, ...rest }: any) {
  return (
    <NextLink href={href || '#'} className={className} onClick={onClick} {...rest}>
      {children}
    </NextLink>
  );
}

export function Head({ title }: { title?: string }) {
  // Client-side title setter
  if (typeof document !== 'undefined' && title) {
    document.title = `${title} | Manasuka Coop (Enterprise Demo)`;
  }
  return null;
}

export function usePage() {
  const pathname = usePathname() || '/admin/dashboard';
  return {
    url: pathname,
    props: {
      auth: {
        user: {
          id: 1,
          name: 'Admin Pengurus',
          email: 'admin@manasuka-demo.id',
          role: 'Pengurus',
          avatar: null,
        },
      },
      pending_badges: {
        members: 2,
        loans: 1,
        receiving: 3,
        suppliers: 1,
        expenses: 0,
      },
      cooperative_setting: {
        brand_name: 'Manasuka Coop',
        coop_name: 'Koperasi Konsumen Syariah Manasuka Mandiri',
      },
    },
  };
}

export const router = {
  get: (url: string, params?: any, options?: any) => {
    if (typeof window !== 'undefined') {
      const search = params ? '?' + new URLSearchParams(params).toString() : '';
      window.location.href = url + search;
    }
  },
  post: (url: string, data?: any, options?: any) => {
    if (options?.onSuccess) {
      setTimeout(() => options.onSuccess({}), 200);
    }
  },
  visit: (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  },
  on: (event: string, callback: any) => {
    return () => {};
  },
};

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [data, setDataState] = useState<T>(initialValues);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setData = (fieldOrFn: keyof T | string | ((prev: T) => T), value?: any) => {
    if (typeof fieldOrFn === 'function') {
      setDataState((prev) => (fieldOrFn as any)(prev));
    } else if (typeof fieldOrFn === 'string' && value !== undefined) {
      setDataState((prev) => ({ ...prev, [fieldOrFn]: value }));
    } else if (fieldOrFn && typeof fieldOrFn === 'object') {
      setDataState((prev) => ({ ...prev, ...(fieldOrFn as any) }));
    }
  };

  const post = (url: string, options?: any) => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (options?.onSuccess) {
        options.onSuccess();
      }
    }, 300);
  };

  const reset = () => {
    setDataState(initialValues);
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    data,
    setData,
    post,
    processing,
    errors,
    reset,
    clearErrors,
  };
}
