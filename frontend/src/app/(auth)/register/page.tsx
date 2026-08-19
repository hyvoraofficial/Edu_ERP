'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/providers/ToastProvider';

export default function RegisterPage() {
  const { toast } = useToast();
  const [academyName, setAcademyName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Registration Request Received!', 'Our platform sales team will review your academy info and reach out shortly.', 'success');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6 py-12 select-none">
      <div className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-md">
            H
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Register your Academy
          </h2>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
            Boot a new tenant instance on the HYVORA EduERP SaaS platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Academy Name"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            required
            placeholder="Hyvora Academy"
          />
          <Input
            label="Administrator Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@academy.edu"
          />
          <Button type="submit" className="w-full h-11 mt-4">
            Request Demo Instance
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-450 pt-2 border-t border-border/60">
          <span>Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
