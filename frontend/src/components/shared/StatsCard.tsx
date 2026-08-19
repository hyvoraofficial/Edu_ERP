import * as React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number; // percentage change
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, description, change, isPositive = true, icon }: StatsCardProps) {
  return (
    <Card className="flex flex-col justify-between min-h-[140px] relative overflow-hidden border border-slate-200 bg-white shadow-xs">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
            {value}
          </span>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 font-extrabold px-2.5 py-1 rounded-lg border ${
              isPositive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
            )}
            {change}%
          </span>
        )}
        {description && (
          <span className="text-slate-600 font-bold">
            {description}
          </span>
        )}
      </div>
    </Card>
  );
}
