import OpenAI from "openai";
import { Suggestion } from "@shared/schema";
import { storage } from "./storage";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate personalized AI suggestions based on user data
 */
export async function generateSuggestions(userId: number): Promise<Suggestion[]> {
  try {
    // Gather user data for context
    const [goals, habits, timeEntries, tasks] = await Promise.all([
      storage.getGoals(userId),
      storage.getHabits(userId),
      storage.getTimeEntries(userId),
      storage.getTasks(userId)
    ]);

    // Prepare the data as context for the AI
    const userContext = {
      goals: goals.map(g => ({
        title: g.title,
        description: g.description,
        startDate: g.startDate,
        endDate: g.endDate,
        targetHours: g.targetHours,
        actualHours: g.actualHours,
        category: g.category,
        isCompleted: g.isCompleted,
      })),
      habits: habits.map(h => ({
        title: h.title,
        description: h.description,
        streakCount: h.streakCount,
        targetDays: h.targetDays,
        category: h.category,
        isActive: h.isActive,
      })),
      timeEntries: timeEntries.map(t => ({
        category: t.category,
        startTime: t.startTime,
        endTime: t.endTime,
        date: t.date,
        duration: t.duration,
      })),
      tasks: tasks.map(t => ({
        title: t.title,
        category: t.category,
        startTime: t.startTime,
        endTime: t.endTime,
        isCompleted: t.isCompleted,
      })),
    };

    // Format the prompt
    const prompt = `
      Based on this user's progress tracking data, generate 3 personalized suggestions to help them improve their productivity and achieve their goals more effectively.
      
      USER DATA:
      ${JSON.stringify(userContext, null, 2)}
      
      Each suggestion should include:
      1. A title (short and actionable)
      2. A detailed description explaining the suggestion and its benefits
      3. A type (must be one of: "focus", "habit", or "goal")
      4. An impact level (must be one of: "high", "medium", or "low")
      5. An action button text (e.g., "Apply to Schedule", "View Habit", "Add Goal")
      
      Return the suggestions as a JSON array in the following format:
      [
        {
          "id": "unique_string_id",
          "title": "Suggestion Title",
          "description": "Detailed explanation of the suggestion",
          "type": "focus|habit|goal",
          "impact": "high|medium|low",
          "action": "Action Button Text"
        },
        ...
      ]
      
      If the user data is insufficient to make personalized suggestions, provide meaningful general productivity suggestions.
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an AI productivity assistant that analyzes user data and provides personalized suggestions to improve productivity and achieve goals." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" } // Request JSON formatted response
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsedContent = JSON.parse(content);
    const suggestions = parsedContent.suggestions || [];

    // Ensure each suggestion has all required fields
    return suggestions.map((suggestion: any, index: number) => ({
      id: suggestion.id || `ai-suggestion-${Date.now()}-${index}`,
      title: suggestion.title,
      description: suggestion.description,
      type: suggestion.type,
      impact: suggestion.impact,
      action: suggestion.action
    }));
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    
    // Return default suggestions in case of an error
    return getDefaultSuggestions();
  }
}

/**
 * Fallback suggestions in case OpenAI API fails
 */
function getDefaultSuggestions(): Suggestion[] {
  return [
    {
      id: "1",
      title: "Focus Improvement",
      description: "Based on your patterns, try scheduling study sessions in the morning for better focus and retention.",
      type: "focus",
      impact: "high",
      action: "Apply to Schedule"
    },
    {
      id: "2",
      title: "Habit Formation",
      description: "You're 80% of the way to forming your daily reading habit. Keep going for 3 more days!",
      type: "habit",
      impact: "medium",
      action: "View Habit"
    },
    {
      id: "3",
      title: "Weekly Goal",
      description: "Consider setting a goal to reduce social media time by 20% next week based on this week's usage.",
      type: "goal",
      impact: "low",
      action: "Add Goal"
    }
  ];
}