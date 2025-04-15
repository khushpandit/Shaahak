import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { Clock, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@shared/schema';

interface TimeHistoryProps {
  entries: TimeEntry[];
  onDeleteEntry: (id: number) => void;
}

export function TimeHistory({ entries, onDeleteEntry }: TimeHistoryProps) {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const entryDate = new Date(date);
    
    if (
      now.getDate() === entryDate.getDate() &&
      now.getMonth() === entryDate.getMonth() &&
      now.getFullYear() === entryDate.getFullYear()
    ) {
      return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    if (
      yesterday.getDate() === entryDate.getDate() &&
      yesterday.getMonth() === entryDate.getMonth() &&
      yesterday.getFullYear() === entryDate.getFullYear()
    ) {
      return 'Yesterday';
    }
    
    return entryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'study': return '#38b6ff';
      case 'work': return '#6e47d4';
      case 'health': return '#32d196';
      case 'recreation': return '#f45d96';
      default: return '#6e47d4';
    }
  };

  // Group entries by date
  const groupedEntries: Record<string, TimeEntry[]> = entries.reduce((acc, entry) => {
    const dateKey = formatDate(entry.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  return (
    <ThreeDCard className="p-6">
      <h3 className="text-xl font-display font-bold mb-6">Recent Time Entries</h3>
      
      {Object.keys(groupedEntries).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date}>
              <div className="mb-2 text-sm font-medium text-gray-400">{date}</div>
              <div className="space-y-3">
                {dateEntries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="bg-dark-tertiary p-4 rounded-lg border border-gray-700 flex items-center"
                  >
                    <div className="mr-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${getCategoryColor(entry.category)}20`,
                          color: getCategoryColor(entry.category)
                        }}
                      >
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {entry.taskId ? `Task #${entry.taskId}` : 'Time Entry'}
                        </span>
                        <span 
                          className="ml-2 text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${getCategoryColor(entry.category)}20`,
                            color: getCategoryColor(entry.category)
                          }}
                        >
                          {entry.category}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {formatTime(entry.startTime)} 
                        {entry.endTime && ` - ${formatTime(entry.endTime)}`}
                        <span className="mx-1">•</span>
                        {formatDuration(entry.duration)}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteEntry(entry.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No time entries yet</p>
          <p className="text-sm mt-2">Start tracking your time to see entries here</p>
        </div>
      )}
    </ThreeDCard>
  );
}
