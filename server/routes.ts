import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateSuggestions } from "./openai";
import { z } from "zod";
import { 
  insertGoalSchema, 
  insertTaskSchema, 
  insertTimeEntrySchema, 
  insertHabitSchema,
  insertFriendSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Goals API
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getGoals(req.user.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedGoal = await storage.updateGoal(goalId, req.body);
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteGoal(goalId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Tasks API
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const completed = req.query.completed === 'true' ? true : 
                       req.query.completed === 'false' ? false : undefined;
      
      const tasks = await storage.getTasks(req.user.id, completed);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Time Entries API
  app.get("/api/time-entries", isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const timeEntries = await storage.getTimeEntries(req.user.id, startDate, endDate);
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.post("/api/time-entries", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTimeEntrySchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const timeEntry = await storage.createTimeEntry(validatedData);
      res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.put("/api/time-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getTimeEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedEntry = await storage.updateTimeEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  app.delete("/api/time-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getTimeEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteTimeEntry(entryId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  app.get("/api/weekly-activity", isAuthenticated, async (req, res) => {
    try {
      const weeklyActivity = await storage.getWeeklyActivity(req.user.id);
      res.json(weeklyActivity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly activity" });
    }
  });

  // Habits API
  app.get("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const habits = await storage.getHabits(req.user.id);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  app.put("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (habit.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedHabit = await storage.updateHabit(habitId, req.body);
      res.json(updatedHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update habit" });
    }
  });

  app.delete("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (habit.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteHabit(habitId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Friends API
  app.get("/api/friends", isAuthenticated, async (req, res) => {
    try {
      const friends = await storage.getFriends(req.user.id);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.post("/api/friends", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertFriendSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const friend = await storage.createFriend(validatedData);
      res.status(201).json(friend);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid friend data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create friend request" });
    }
  });

  app.put("/api/friends/:id", isAuthenticated, async (req, res) => {
    try {
      const friendId = parseInt(req.params.id);
      const friend = await storage.getFriend(friendId);
      
      if (!friend) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      if (friend.userId !== req.user.id && friend.friendId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedFriend = await storage.updateFriend(friendId, req.body);
      res.json(updatedFriend);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid friend data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update friend request" });
    }
  });

  app.delete("/api/friends/:id", isAuthenticated, async (req, res) => {
    try {
      const friendId = parseInt(req.params.id);
      const friend = await storage.getFriend(friendId);
      
      if (!friend) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      if (friend.userId !== req.user.id && friend.friendId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteFriend(friendId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete friend request" });
    }
  });

  app.get("/api/friend-activities", isAuthenticated, async (req, res) => {
    try {
      const friendActivities = await storage.getFriendActivities(req.user.id);
      res.json(friendActivities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friend activities" });
    }
  });

  // AI Suggestions API
  app.get("/api/suggestions", isAuthenticated, async (req, res) => {
    try {
      // Check if we have the OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY not found, using default suggestions");
        // Return default suggestions if no API key
        return res.json([
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
        ]);
      }
      
      // Generate AI-powered suggestions based on user data
      const suggestions = await generateSuggestions(req.user.id);
      res.json(suggestions);
    } catch (error) {
      console.error('Error in suggestions endpoint:', error);
      res.status(500).json({ 
        message: "Failed to generate suggestions",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
