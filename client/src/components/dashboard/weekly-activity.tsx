import React, { useState } from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { ActivityChart } from '@/components/ui/activity-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ActivityBreakdown {
  category: string;
  percentage: number;
  color: string;
}

export interface DailyActivity {
  day: string;
  shortDay: string;
  hours: number;
  color: string;
}

interface WeeklyActivityProps {
  dailyActivities: DailyActivity[];
  activityBreakdown: ActivityBreakdown[];
  onPeriodChange?: (period: string) => void;
}

export function WeeklyActivity({ 
  dailyActivities, 
  activityBreakdown,
  onPeriodChange
}: WeeklyActivityProps) {
  const [period, setPeriod] = useState('This Week');

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (onPeriodChange) {
      onPeriodChange(value);
    }
  };

  return (
    <ThreeDCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold">Activity Timeline</h3>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="bg-dark-tertiary text-sm rounded px-2 py-1 border border-gray-700 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="This Week">This Week</SelectItem>
            <SelectItem value="Last Week">Last Week</SelectItem>
            <SelectItem value="This Month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-0.5 h-60">
        <ActivityChart data={dailyActivities} maxHeight={240} />
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h4 className="font-medium mb-3">Activity Breakdown</h4>
        <div className="space-y-3">
          {activityBreakdown.map((activity, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: activity.color }}></div>
              <span className="text-sm">{activity.category}</span>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-32 bg-dark-tertiary rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${activity.percentage}%`,
                      backgroundColor: activity.color
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400">{activity.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ThreeDCard>
  );
}
