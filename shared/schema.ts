import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  characterType: text("character_type").default("scholar"),
  streakProtectionTokens: integer("streak_protection_tokens").default(0),
  parentalControlSettings: jsonb("parental_control_settings"),
  isParent: boolean("is_parent").default(false),
  parentOfUserId: integer("parent_of_user_id"),
  wearableDeviceConnected: boolean("wearable_device_connected").default(false),
  wearableDeviceToken: text("wearable_device_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const sleepEntries = pgTable("sleep_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  quality: real("quality").notNull(), // sleep quality score from 0.0 to 10.0
  deepSleepPercentage: real("deep_sleep_percentage"), // percentage of deep sleep
  remSleepPercentage: real("rem_sleep_percentage"), // percentage of REM sleep
  lightSleepPercentage: real("light_sleep_percentage"), // percentage of light sleep
  disturbances: integer("disturbances").default(0), // number of disturbances during sleep
  notes: text("notes"),
  tags: text("tags").array(),
  source: text("source").default("manual"), // manual, wearable, app integration
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  rarity: text("rarity").notNull().default("common"), // common, uncommon, rare, epic, legendary
  experienceAwarded: integer("experience_awarded").notNull().default(10),
  isHidden: boolean("is_hidden").default(false), // achievement not shown until unlocked
  isSecret: boolean("is_secret").default(false), // achievement criteria not revealed
  isPremium: boolean("is_premium").default(false), // premium achievement
});

export const achievementDefinitions = pgTable("achievement_definitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").notNull().default("common"), // common, uncommon, rare, epic, legendary
  experienceAwarded: integer("experience_awarded").notNull().default(10),
  criteria: jsonb("criteria").notNull(), // JSON containing achievement criteria
  isHidden: boolean("is_hidden").default(false),
  isSecret: boolean("is_secret").default(false),
  isPremium: boolean("is_premium").default(false),
});

export const skillTrees = pgTable("skill_trees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const skillNodes = pgTable("skill_nodes", {
  id: serial("id").primaryKey(),
  skillTreeId: integer("skill_tree_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  level: integer("level").notNull().default(1),
  positionX: integer("position_x").notNull(), // position for visualization
  positionY: integer("position_y").notNull(), // position for visualization
  isUnlocked: boolean("is_unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  parentNodeIds: integer("parent_node_ids").array(), // prerequisite nodes
  experienceToUnlock: integer("experience_to_unlock").notNull().default(100),
  rewards: jsonb("rewards"), // achievements, tokens, character attributes
});

export const characterAvatars = pgTable("character_avatars", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // scholar, athlete, creative, etc.
  level: integer("level").notNull().default(1),
  attributes: jsonb("attributes").notNull(), // focus, creativity, discipline, etc.
  outfits: jsonb("outfits"), // visual customization options
  accessories: jsonb("accessories"), // visual accessories
  evolution: integer("evolution").default(1), // character evolution stage
  evolutionProgress: real("evolution_progress").default(0), // progress to next evolution (0-100)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const parentTeenReports = pgTable("parent_teen_reports", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  teenId: integer("teen_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  period: text("period").notNull(), // daily, weekly, monthly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  data: jsonb("data").notNull(), // structured report data
  isShared: boolean("is_shared").default(false),
  sharedAt: timestamp("shared_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const privacyAgreements = pgTable("privacy_agreements", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  teenId: integer("teen_id").notNull(),
  privacyLevel: integer("privacy_level").notNull(), // 1-5 scale
  dataShared: jsonb("data_shared").notNull(), // what data categories are shared
  exceptions: jsonb("exceptions"), // special exceptions to the privacy rules
  negotiatedAt: timestamp("negotiated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // when agreement should be re-negotiated
  notes: text("notes"),
});

export const independenceProgression = pgTable("independence_progression", {
  id: serial("id").primaryKey(),
  teenId: integer("teen_id").notNull(),
  level: integer("level").notNull().default(1),
  title: text("title").notNull(),
  description: text("description").notNull(),
  unlockedFeatures: text("unlocked_features").array(), // features unlocked at this level
  criteria: jsonb("criteria").notNull(), // criteria for reaching this level
  achievedAt: timestamp("achieved_at").notNull().defaultNow(),
  approvedBy: integer("approved_by"), // parent who approved (if needed)
  approvedAt: timestamp("approved_at"),
});

export const wearableDataSync = pgTable("wearable_data_sync", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceType: text("device_type").notNull(), // fitbit, apple_watch, etc.
  lastSyncAt: timestamp("last_sync_at").notNull().defaultNow(),
  dataType: text("data_type").notNull(), // sleep, activity, heart_rate, etc.
  data: jsonb("data").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("synced"), // synced, partial, failed
  errorMessage: text("error_message"),
});

export const visualizationPreferences = pgTable("visualization_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // goals, habits, time, sleep, etc.
  visualizationType: text("visualization_type").notNull(), // bar, line, pie, heat_map, mind_map, etc.
  colorScheme: text("color_scheme").notNull().default("default"),
  layoutOptions: jsonb("layout_options"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const exportLogs = pgTable("export_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  format: text("format").notNull(), // csv, json, pdf
  dataTypes: text("data_types").array().notNull(), // goals, habits, time, etc.
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  url: text("url"), // download URL for exported file
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
});

export const habitStreakLogs = pgTable("habit_streak_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: timestamp("date").notNull(),
  isCompleted: boolean("is_completed").notNull(),
  streakProtectionUsed: boolean("streak_protection_used").default(false),
  notes: text("notes"),
});

// Define table relationships
export const usersRelations = relations(users, ({ many, one }) => ({
  goals: many(goals),
  tasks: many(tasks),
  timeEntries: many(timeEntries),
  habits: many(habits),
  voiceJournals: many(voiceJournals),
  sleepEntries: many(sleepEntries),
  achievements: many(achievements),
  skillTrees: many(skillTrees),
  characterAvatars: many(characterAvatars),
  wearableDataSync: many(wearableDataSync),
  visualizationPreferences: many(visualizationPreferences),
  exportLogs: many(exportLogs),
  parent: one(users, {
    fields: [users.parentOfUserId],
    references: [users.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id],
  }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  streakLogs: many(habitStreakLogs),
}));

export const habitStreakLogsRelations = relations(habitStreakLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitStreakLogs.habitId],
    references: [habits.id],
  }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, {
    fields: [friends.userId],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friends.friendId],
    references: [users.id],
  }),
}));

export const voiceJournalsRelations = relations(voiceJournals, ({ one }) => ({
  user: one(users, {
    fields: [voiceJournals.userId],
    references: [users.id],
  }),
}));

export const sleepEntriesRelations = relations(sleepEntries, ({ one }) => ({
  user: one(users, {
    fields: [sleepEntries.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const skillTreesRelations = relations(skillTrees, ({ one, many }) => ({
  user: one(users, {
    fields: [skillTrees.userId],
    references: [users.id],
  }),
  nodes: many(skillNodes),
}));

export const skillNodesRelations = relations(skillNodes, ({ one }) => ({
  skillTree: one(skillTrees, {
    fields: [skillNodes.skillTreeId],
    references: [skillTrees.id],
  }),
}));

export const characterAvatarsRelations = relations(characterAvatars, ({ one }) => ({
  user: one(users, {
    fields: [characterAvatars.userId],
    references: [users.id],
  }),
}));

export const parentTeenReportsRelations = relations(parentTeenReports, ({ one }) => ({
  parent: one(users, {
    fields: [parentTeenReports.parentId],
    references: [users.id],
  }),
  teen: one(users, {
    fields: [parentTeenReports.teenId],
    references: [users.id],
  }),
}));

export const privacyAgreementsRelations = relations(privacyAgreements, ({ one }) => ({
  parent: one(users, {
    fields: [privacyAgreements.parentId],
    references: [users.id],
  }),
  teen: one(users, {
    fields: [privacyAgreements.teenId],
    references: [users.id],
  }),
}));

export const independenceProgressionRelations = relations(independenceProgression, ({ one }) => ({
  teen: one(users, {
    fields: [independenceProgression.teenId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [independenceProgression.approvedBy],
    references: [users.id],
  }),
}));

export const wearableDataSyncRelations = relations(wearableDataSync, ({ one }) => ({
  user: one(users, {
    fields: [wearableDataSync.userId],
    references: [users.id],
  }),
}));

export const visualizationPreferencesRelations = relations(visualizationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [visualizationPreferences.userId],
    references: [users.id],
  }),
}));

export const exportLogsRelations = relations(exportLogs, ({ one }) => ({
  user: one(users, {
    fields: [exportLogs.userId],
    references: [users.id],
  }),
}));

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

export const insertSleepEntrySchema = createInsertSchema(sleepEntries).omit({
  id: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitions).omit({
  id: true,
});

export const insertSkillTreeSchema = createInsertSchema(skillTrees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillNodeSchema = createInsertSchema(skillNodes).omit({
  id: true,
  unlockedAt: true,
});

export const insertCharacterAvatarSchema = createInsertSchema(characterAvatars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParentTeenReportSchema = createInsertSchema(parentTeenReports).omit({
  id: true,
  sharedAt: true,
  createdAt: true,
});

export const insertPrivacyAgreementSchema = createInsertSchema(privacyAgreements).omit({
  id: true,
});

export const insertIndependenceProgressionSchema = createInsertSchema(independenceProgression).omit({
  id: true,
  approvedAt: true,
});

export const insertWearableDataSyncSchema = createInsertSchema(wearableDataSync).omit({
  id: true,
});

export const insertVisualizationPreferenceSchema = createInsertSchema(visualizationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExportLogSchema = createInsertSchema(exportLogs).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export const insertHabitStreakLogSchema = createInsertSchema(habitStreakLogs).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type InsertVoiceJournal = z.infer<typeof insertVoiceJournalSchema>;
export type InsertSleepEntry = z.infer<typeof insertSleepEntrySchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertAchievementDefinition = z.infer<typeof insertAchievementDefinitionSchema>;
export type InsertSkillTree = z.infer<typeof insertSkillTreeSchema>;
export type InsertSkillNode = z.infer<typeof insertSkillNodeSchema>;
export type InsertCharacterAvatar = z.infer<typeof insertCharacterAvatarSchema>;
export type InsertParentTeenReport = z.infer<typeof insertParentTeenReportSchema>;
export type InsertPrivacyAgreement = z.infer<typeof insertPrivacyAgreementSchema>;
export type InsertIndependenceProgression = z.infer<typeof insertIndependenceProgressionSchema>;
export type InsertWearableDataSync = z.infer<typeof insertWearableDataSyncSchema>;
export type InsertVisualizationPreference = z.infer<typeof insertVisualizationPreferenceSchema>;
export type InsertExportLog = z.infer<typeof insertExportLogSchema>;
export type InsertHabitStreakLog = z.infer<typeof insertHabitStreakLogSchema>;

export type User = typeof users.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type Friend = typeof friends.$inferSelect;
export type VoiceJournal = typeof voiceJournals.$inferSelect;
export type SleepEntry = typeof sleepEntries.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type SkillTree = typeof skillTrees.$inferSelect;
export type SkillNode = typeof skillNodes.$inferSelect;
export type CharacterAvatar = typeof characterAvatars.$inferSelect;
export type ParentTeenReport = typeof parentTeenReports.$inferSelect;
export type PrivacyAgreement = typeof privacyAgreements.$inferSelect;
export type IndependenceProgression = typeof independenceProgression.$inferSelect;
export type WearableDataSync = typeof wearableDataSync.$inferSelect;
export type VisualizationPreference = typeof visualizationPreferences.$inferSelect;
export type ExportLog = typeof exportLogs.$inferSelect;
export type HabitStreakLog = typeof habitStreakLogs.$inferSelect;

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

export interface SleepQualityData {
  date: string;
  quality: number;
  duration: number;
  deepSleepPercentage: number;
  remSleepPercentage: number;
  lightSleepPercentage: number;
  disturbances: number;
}

export interface SkillNodeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  level: number;
  isUnlocked: boolean;
  position: { x: number, y: number };
  parentNodes: number[];
}

export interface SkillTreeData {
  id: number;
  name: string;
  description: string;
  category: string;
  nodes: SkillNodeData[];
  connections: { source: number, target: number, completed: boolean }[];
}

export interface AchievementData {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  isHidden: boolean;
  isSecret: boolean;
  isPremium: boolean;
}

export interface CharacterAttributes {
  focus: number;
  creativity: number;
  discipline: number;
  consistency: number;
  resilience: number;
  adaptability: number;
  problemSolving: number;
  organization: number;
}

export interface CharacterAvatarData {
  id: number;
  name: string;
  type: string;
  level: number;
  attributes: CharacterAttributes;
  evolution: number;
  evolutionProgress: number;
  outfit: {
    head?: string;
    body: string;
    accessory?: string;
    background: string;
  };
}

export type VisualizationType = 
  'bar_chart' | 
  'line_chart' | 
  'pie_chart' | 
  'radar_chart' | 
  'heat_map' | 
  'mind_map' | 
  'network_graph' | 
  'tree_map' | 
  'calendar' | 
  '3d_bar' | 
  'sunburst';

export interface PrivacySettings {
  level: number; // 1-5
  dataShared: {
    goals: boolean;
    habits: boolean;
    timeTracking: boolean;
    sleep: boolean;
    achievements: boolean;
    voiceJournals: boolean;
  };
  exceptions: {
    hiddenCategories?: string[];
    limitedTimeframe?: boolean;
    onlyShowSummaries?: boolean;
  };
}

export interface WearableDeviceData {
  steps: number;
  heartRate: number;
  caloriesBurned: number;
  activeMinutes: number;
  distance: number;
  floors?: number;
  sleepData?: SleepQualityData;
  lastSynced: string;
}
