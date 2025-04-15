import { Suggestion } from "@shared/schema";

// In a production app, this would connect to an API
// For now, we'll generate some mock suggestions
export const fetchSuggestions = async (): Promise<Suggestion[]> => {
  try {
    const response = await fetch('/api/suggestions');
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

export const getDefaultSuggestions = (): Suggestion[] => {
  return [
    {
      id: "1",
      title: "Focus Improvement",
      description: "Based on your patterns, try scheduling study sessions in the morning for better focus and retention.",
      type: 'focus',
      impact: 'high',
      action: "Apply to Schedule"
    },
    {
      id: "2",
      title: "Habit Formation",
      description: "You're 80% of the way to forming your daily reading habit. Keep going for 3 more days!",
      type: 'habit',
      impact: 'medium',
      action: "View Habit"
    },
    {
      id: "3",
      title: "Weekly Goal",
      description: "Consider setting a goal to reduce social media time by 20% next week based on this week's usage.",
      type: 'goal',
      impact: 'low',
      action: "Add Goal"
    }
  ];
};
