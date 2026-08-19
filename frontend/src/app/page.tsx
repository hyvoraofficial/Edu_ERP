'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  School, Users, ShieldCheck, Sparkles, ArrowRight, CreditCard, PlayCircle, Star, MessageCircle, HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';

export default function LandingPage() {
  const { role } = useAuthStore();
  const { settings } = useTenantStore();

  return (
    <div className="flex flex-col min-h-screen bg-background select-none">
      {/* 1. Header Navigation */}
      <header className="h-20 border-b border-border/60 bg-card/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8 md:px-16 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-md">
            H
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            HYVORA EduERP
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-500">
          <Link href="#features" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Features</Link>
          <Link href="#statistics" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Stats</Link>
          <Link href="#testimonials" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Testimonials</Link>
          <Link href="#faq" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-24 md:py-36 px-8 md:px-16 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise SaaS Education Management
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-900 dark:text-zinc-50 max-w-4xl">
          The software suite worth millions,{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            powering next-gen academies.
          </span>
        </h1>

        <p className="text-base md:text-xl text-zinc-500 font-medium max-w-2xl mt-6 mb-8 leading-relaxed">
          A premium, multi-tenant SaaS ERP providing interactive student registers, online fee billing ledger, assignment checkers, and custom website CMS configs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Features
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. Statistics Section */}
      <section id="statistics" className="py-16 bg-zinc-50/50 dark:bg-zinc-900/10 border-y border-border/80 px-8 md:px-16 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-extrabold text-primary">100+</span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Active Academies</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-extrabold text-primary">100,000+</span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Enrolled Learners</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-extrabold text-primary">99.98%</span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">API Health Uptime</span>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-24 px-8 md:px-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16 flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Designed to outperform. Built to scale.</h2>
          <p className="text-sm text-zinc-400 font-medium">Modular, customizable ERP layers suited for any academy size.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-3">
            <div className="p-3 bg-primary/10 text-primary w-11 h-11 rounded-xl flex items-center justify-center shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">Subdomain Tenancy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Each academy gets its own custom settings, custom landing layout, logos, SMTP configs, and themes automatically.
            </p>
          </Card>
          <Card className="flex flex-col gap-3">
            <div className="p-3 bg-primary/10 text-primary w-11 h-11 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">Granular RBAC Security</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Role permissions gatekeeper logic securing access routes for Students, Teachers, Admins, and Super Admin logs.
            </p>
          </Card>
          <Card className="flex flex-col gap-3">
            <div className="p-3 bg-primary/10 text-primary w-11 h-11 rounded-xl flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">Online Fees Collection</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Pre-built ledger invoicing supporting gateway attempts, transaction tracking, and direct receipt printing.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="py-24 px-8 md:px-16 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-border/80 w-full">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400 font-medium">Have queries? We have answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                Is this application multi-tenant?
              </h4>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Yes! Every piece of data belongs to a specific tenant ID. The application loads custom styling rules dynamically based on host header subdomains.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                What databases does it support?
              </h4>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                It is fully compatible with standard PostgreSQL and Supabase clusters, utilizing range partitioning for telemetry data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Premium Footer */}
      <footer className="border-t border-border py-12 px-8 md:px-16 bg-card text-xs text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">H</div>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">HYVORA Platform Inc.</span>
        </div>
        <div className="flex gap-6 font-semibold">
          <Link href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Contact Support</Link>
        </div>
        <span>&copy; {new Date().getFullYear()} HYVORA. All rights reserved.</span>
      </footer>
    </div>
  );
}
