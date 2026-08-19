'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/providers/ToastProvider';

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Password Reset link Sent!', 'Please check your mailbox for further instructions.', 'info');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6 py-12 select-none">
      <div className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-md">
            H
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
            Input your email below to receive recovery details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@academy.edu"
          />
          <Button type="submit" className="w-full h-11 mt-4">
            Send Reset Link
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-450 pt-2 border-t border-border/60">
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
