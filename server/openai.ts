import OpenAI from "openai";
import { Suggestion } from "@shared/schema";
import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";

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

    // Simple mapping functions to extract only the required data
    // and avoid type errors with optional fields
    const userContext = {
      goals: goals.map(g => ({
        title: g.title,
        description: g.description || "",
        startDate: g.startDate.toISOString(),
        endDate: g.endDate.toISOString(),
        targetHours: g.targetHours,
        actualHours: g.actualHours || 0,
        category: g.category,
        isCompleted: g.isCompleted || false,
        progress: g.actualHours && g.targetHours ? 
                 Math.min(100, Math.round((g.actualHours / g.targetHours) * 100)) : 0
      })),
      habits: habits.map(h => ({
        title: h.title,
        description: h.description || "",
        streakCount: h.streakCount || 0,
        targetDays: h.targetDays,
        category: h.category,
        isActive: h.isActive || true,
        // Derived data for the AI
        progress: h.streakCount && h.targetDays ? 
                 Math.min(100, Math.round((h.streakCount / h.targetDays) * 100)) : 0
      })),
      timeEntries: timeEntries.map(t => ({
        category: t.category,
        startTime: t.startTime.toISOString(),
        endTime: t.endTime ? t.endTime.toISOString() : null,
        date: t.date.toISOString(),
        duration: t.duration,
        // Convert duration from minutes to hours for readability
        hours: Math.round((t.duration / 60) * 10) / 10
      })),
      tasks: tasks.map(t => ({
        title: t.title,
        category: t.category,
        startTime: t.startTime ? t.startTime.toISOString() : null,
        endTime: t.endTime ? t.endTime.toISOString() : null,
        isCompleted: t.isCompleted || false
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

/**
 * Transcribe audio to text using OpenAI's Whisper API
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found');
    }

    const fileStream = fs.createReadStream(audioFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      language: "en", // Set to English, can be changed based on user preference
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '';
  }
}

/**
 * Analyze sentiment and extract topics/tags from transcribed text
 */
export async function analyzeSentiment(text: string): Promise<{ sentiment: any, tags: string[] }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found');
    }

    if (!text || text.trim() === '') {
      return { sentiment: null, tags: [] };
    }

    const prompt = `
      Analyze the following journal entry. Extract:
      1. The overall sentiment (positive, negative, or neutral)
      2. Key emotional states present (e.g., happy, stressed, motivated, tired)
      3. Confidence level of your analysis (0-1)
      4. Up to 5 relevant tags or topics mentioned

      Return the analysis as a JSON object with the following structure:
      {
        "sentiment": {
          "overall": "positive|negative|neutral",
          "emotions": ["emotion1", "emotion2", ...],
          "confidence": 0.85
        },
        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
      }

      Journal entry:
      "${text}"
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an AI assistant specialized in sentiment analysis and topic extraction from journal entries." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const analysis = JSON.parse(content);
    return {
      sentiment: analysis.sentiment || null,
      tags: analysis.tags || []
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { sentiment: null, tags: [] };
  }
}