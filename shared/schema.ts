import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetHours: integer("target_hours").notNull(),
  actualHours: integer("actual_hours").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  category: text("category").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  isCompleted: boolean("is_completed").default(false),
  category: text("category").notNull(),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  category: text("category").notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  date: timestamp("date").notNull(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  streakCount: integer("streak_count").default(0),
  targetDays: integer("target_days").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
});

export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  friendId: integer("friend_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
});

export const voiceJournals = pgTable("voice_journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  transcription: text("transcription"),
  date: timestamp("date").notNull().defaultNow(),
  duration: integer("duration").notNull(), // duration in seconds
  sentiment: jsonb("sentiment"), // sentiment analysis results
  tags: text("tags").array(), // tags/topics detected in the journal
  category: text("category").notNull().default("general"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatar: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
});

export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
});

export const insertVoiceJournalSchema = createInsertSchema(voiceJournals).omit({
  id: true,
  sentiment: true,
  tags: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type InsertVoiceJournal = z.infer<typeof insertVoiceJournalSchema>;

export type User = typeof users.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type Friend = typeof friends.$inferSelect;
export type VoiceJournal = typeof voiceJournals.$inferSelect;

export type SuggestionType = 'focus' | 'habit' | 'goal';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: SuggestionType;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

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

export interface FriendActivity {
  id: number;
  name: string;
  avatar: string;
  hoursThisWeek: number;
  progress: number;
  recentActivity: string;
}
