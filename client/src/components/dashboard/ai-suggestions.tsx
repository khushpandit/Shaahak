import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Suggestion } from '@shared/schema';

interface AISuggestionsProps {
  suggestions: Suggestion[];
  isLoading?: boolean;
  onRefresh: () => void;
  onDismiss: (id: string) => void;
  onAction: (suggestion: Suggestion) => void;
}

export function AISuggestions({ 
  suggestions, 
  isLoading = false,
  onRefresh, 
  onDismiss, 
  onAction 
}: AISuggestionsProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-[#38b6ff] bg-[#38b6ff]/20';
      case 'medium': return 'text-primary-light bg-primary/20';
      case 'low': return 'text-[#32d196] bg-[#32d196]/20';
      default: return 'text-primary-light bg-primary/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'focus': return 'text-[#38b6ff]';
      case 'habit': return 'text-primary-light';
      case 'goal': return 'text-[#32d196]';
      default: return 'text-primary-light';
    }
  };

  return (
    <ThreeDCard className="p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#38b6ff]/20 text-[#38b6ff] mr-3 animate-pulse">
          <Lightbulb className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-display font-bold">AI Suggestions</h3>
      </div>
      
      <div className="space-y-4 flex-grow overflow-auto">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id} 
            className={cn(
              "bg-dark-tertiary p-4 rounded-lg border border-gray-700 animate-fade-in",
              { "opacity-75": isLoading }
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between mb-2">
              <h4 className={cn("font-medium", getTypeColor(suggestion.type))}>{suggestion.title}</h4>
              <span className={cn("text-xs px-2 py-0.5 rounded", getImpactColor(suggestion.impact))}>
                {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)} Impact
              </span>
            </div>
            <p className="text-sm text-gray-300">{suggestion.description}</p>
            <div className="flex mt-3 justify-end">
              <button 
                onClick={() => onDismiss(suggestion.id)}
                className="text-xs text-gray-400 hover:text-gray-300 mr-3"
                disabled={isLoading}
              >
                Dismiss
              </button>
              <button 
                onClick={() => onAction(suggestion)}
                className={cn("text-xs", getTypeColor(suggestion.type))}
                disabled={isLoading}
              >
                {suggestion.action}
              </button>
            </div>
          </div>
        ))}
        
        {suggestions.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Lightbulb className="h-10 w-10 text-gray-500 mb-2" />
            <p className="text-gray-400">No suggestions available yet</p>
            <p className="text-sm text-gray-500 mt-1">Add more data to get personalized suggestions</p>
          </div>
        )}
        
        {isLoading && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-gray-400 mt-4">Generating suggestions...</p>
          </div>
        )}
      </div>
      
      <Button 
        onClick={onRefresh} 
        disabled={isLoading}
        variant="outline"
        className="mt-4 w-full py-3 text-sm font-medium bg-dark-tertiary hover:bg-dark-secondary border border-gray-700 rounded-lg transition-colors"
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", { "animate-spin": isLoading })} />
        Refresh Suggestions
      </Button>
    </ThreeDCard>
  );
}
