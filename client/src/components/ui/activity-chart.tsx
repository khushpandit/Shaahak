import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DailyActivity {
  day: string;
  shortDay: string;
  hours: number;
  color: string;
}

interface ActivityChartProps {
  data: DailyActivity[];
  className?: string;
  maxHeight?: number;
}

export function ActivityChart({ data, className, maxHeight = 200 }: ActivityChartProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...data.map(item => item.hours), 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between h-full">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <div className="h-full flex items-end justify-center w-full px-2">
              <div className="w-full max-w-[32px] bg-primary/20 rounded-t-sm relative group">
                <div 
                  className="chart-bar absolute bottom-0 left-0 w-full rounded-t-sm transition-all duration-1000 ease-out"
                  style={{ 
                    height: animate ? `${(item.hours / maxValue) * 100}%` : '0%',
                    backgroundColor: item.color
                  }}
                />
                
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 left-1/2 transform -translate-x-1/2 bg-dark-tertiary px-3 py-2 rounded shadow-lg text-xs whitespace-nowrap z-10">
                  <p className="font-medium">{item.day}</p>
                  <p className="text-accent-blue">{item.hours.toFixed(1)} hours</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{item.shortDay}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
