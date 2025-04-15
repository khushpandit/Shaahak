import React from 'react';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { ThreeDCard } from '@/components/ui/3d-card';
import { BarChart2, Clock, CheckSquare, ChevronUp, ChevronDown } from 'lucide-react';

interface ProgressItem {
  title: string;
  icon: React.ReactNode;
  value: number | string;
  max?: number;
  percentage?: number;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
  subText?: string;
}

interface ProgressSummaryProps {
  items: ProgressItem[];
  title: string;
  onViewReport?: () => void;
}

export function ProgressSummary({ items, title, onViewReport }: ProgressSummaryProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold">{title}</h2>
        {onViewReport && (
          <button 
            onClick={onViewReport}
            className="text-primary hover:text-primary-light flex items-center"
          >
            <span>View Detailed Report</span>
            <ChevronUp className="h-4 w-4 ml-1 rotate-90" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <ThreeDCard key={index} className="p-4">
            <div className="flex items-center mb-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-${item.color}/20 text-${item.color} mr-3`}>
                {item.icon}
              </div>
              <h3 className="font-medium">{item.title}</h3>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4 relative">
                <ProgressCircle 
                  value={typeof item.value === 'number' ? item.value : parseFloat(item.value.toString())} 
                  max={item.max || 100}
                  color={item.color}
                  label={<span className="text-2xl font-bold">{item.value}</span>}
                />
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-2">{item.subText}</div>
                {item.trend && (
                  <div className={`flex items-center text-${item.trend === 'up' ? '[#32d196]' : '[#f45d96]'}`}>
                    {item.trend === 'up' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="font-medium">{item.trendValue}</span>
                  </div>
                )}
              </div>
            </div>
          </ThreeDCard>
        ))}
      </div>
    </section>
  );
}
