'use client';

import { useState } from 'react';

type Validator = (value: string) => string | undefined;

export function useField(initial: string, validate?: Validator) {
  const [value, setValue]     = useState(initial);
  const [touched, setTouched] = useState(false);

  const error = touched && validate ? (validate(value) ?? '') : '';

  return {
    value,
    error,
    isValid: !validate || !validate(value),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
    onBlur:   () => setTouched(true),
    reset:    (v = initial) => { setValue(v); setTouched(false); },
  };
}

export const validators = {
  required: (label: string): Validator =>
    v => !v.trim() ? `${label} is required` : undefined,

  minLength: (min: number, label: string): Validator =>
    v => v.trim().length < min ? `${label} must be at least ${min} characters` : undefined,

  maxLength: (max: number, label: string): Validator =>
    v => v.trim().length > max ? `${label} must be ${max} characters or fewer` : undefined,

  username: (): Validator =>
    v => !/^[A-Za-z0-9_-]{1,20}$/.test(v.trim()) ? 'Username must be 1–20 characters: letters, numbers, _ or -' : undefined,

  email: (): Validator =>
    v => !v.trim().includes('@') ? 'Enter a valid email address' : undefined,

  compose: (...fns: Validator[]): Validator =>
    v => fns.reduce<string | undefined>((err, fn) => err ?? fn(v), undefined),
};
