'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Plus, Star } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';

export default function TestimonialsPage() {
  const { toast } = useToast();
  const testimonials = [
    { id: '1', author: 'Priya Sharma (Parent)', text: 'Hyvora Academy provided exceptional coaching for my daughter in NEET preparation.', rating: 5 },
    { id: '2', author: 'Rahul Verma (Alumni - JEE Air 142)', text: 'The structured test series and subject-wise analytics were crucial to my rank.', rating: 5 }
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Student & Parent Testimonials</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Reviews and success stories displayed on academy website.</p>
        </div>
        <Button onClick={() => toast('New Review', 'Add new testimonial modal opened.', 'info')} className="gap-2 h-10">
          <Plus className="w-4 h-4" /> Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(item => (
          <Card key={item.id} className="p-5 space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 italic">"{item.text}"</p>
            <span className="text-xs font-bold text-slate-900 block pt-2 border-t border-slate-100">{item.author}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
