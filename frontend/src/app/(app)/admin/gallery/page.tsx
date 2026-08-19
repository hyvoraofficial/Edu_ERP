'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';

export default function GalleryPage() {
  const { toast } = useToast();
  const [gallery, setGallery] = React.useState([
    { id: '1', title: 'Annual Sports Meet 2026', tag: 'Events', date: '2026-02-15' },
    { id: '2', title: 'Science Exhibition & Robotics Showcase', tag: 'Academic', date: '2026-01-20' },
    { id: '3', title: 'New Computer Lab Inauguration', tag: 'Campus', date: '2025-11-10' }
  ]);

  const handleAdd = () => {
    toast('Image Upload', 'Select media files to upload to academy gallery.', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Academy Photo Gallery</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Campus event photos and event showcase albums.</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 h-10">
          <Plus className="w-4 h-4" /> Upload New Media
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gallery.map(item => (
          <Card key={item.id} className="p-4 space-y-3">
            <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <ImageIcon className="w-10 h-10" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                <span className="text-[10px] text-slate-500">{item.tag} • {item.date}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
