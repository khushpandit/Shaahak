import { 
  users, type User, type InsertUser, 
  goals, type Goal, type InsertGoal,
  tasks, type Task, type InsertTask,
  timeEntries, type TimeEntry, type InsertTimeEntry,
  habits, type Habit, type InsertHabit,
  friends, type Friend, type InsertFriend,
  voiceJournals, type VoiceJournal, type InsertVoiceJournal
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Goal methods
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: number): Promise<boolean>;

  // Task methods
  getTasks(userId: number, completed?: boolean): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<boolean>;

  // Time entry methods
  getTimeEntries(userId: number, startDate?: Date, endDate?: Date): Promise<TimeEntry[]>;
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, entry: Partial<InsertTimeEntry>): Promise<TimeEntry>;
  deleteTimeEntry(id: number): Promise<boolean>;
  getWeeklyActivity(userId: number): Promise<{ date: string, hours: number, category: string }[]>;

  // Habit methods
  getHabits(userId: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit>;
  deleteHabit(id: number): Promise<boolean>;

  // Friend methods
  getFriends(userId: number): Promise<Friend[]>;
  getFriend(id: number): Promise<Friend | undefined>;
  createFriend(friend: InsertFriend): Promise<Friend>;
  updateFriend(id: number, friend: Partial<InsertFriend>): Promise<Friend>;
  deleteFriend(id: number): Promise<boolean>;
  getFriendActivities(userId: number): Promise<{ id: number, name: string, hours: number, progress: number, recentActivity: string }[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private goals: Map<number, Goal>;
  private tasks: Map<number, Task>;
  private timeEntries: Map<number, TimeEntry>;
  private habits: Map<number, Habit>;
  private friends: Map<number, Friend>;
  currentId: {
    users: number;
    goals: number;
    tasks: number;
    timeEntries: number;
    habits: number;
    friends: number;
  };
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.goals = new Map();
    this.tasks = new Map();
    this.timeEntries = new Map();
    this.habits = new Map();
    this.friends = new Map();
    this.currentId = {
      users: 1,
      goals: 1,
      tasks: 1,
      timeEntries: 1,
      habits: 1,
      friends: 1,
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add demo data
    this.setupDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentId.goals++;
    const goal: Goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updateGoal: Partial<InsertGoal>): Promise<Goal> {
    const goal = this.goals.get(id);
    if (!goal) {
      throw new Error(`Goal with id ${id} not found`);
    }
    const updatedGoal = { ...goal, ...updateGoal };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Task methods
  async getTasks(userId: number, completed?: boolean): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && 
      (completed === undefined || task.isCompleted === completed)
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId.tasks++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateTask: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    const updatedTask = { ...task, ...updateTask };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Time entry methods
  async getTimeEntries(userId: number, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.userId === userId &&
      (!startDate || new Date(entry.date) >= startDate) &&
      (!endDate || new Date(entry.date) <= endDate)
    );
  }

  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async createTimeEntry(insertEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.currentId.timeEntries++;
    const entry: TimeEntry = { ...insertEntry, id };
    this.timeEntries.set(id, entry);
    return entry;
  }

  async updateTimeEntry(id: number, updateEntry: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    const entry = this.timeEntries.get(id);
    if (!entry) {
      throw new Error(`Time entry with id ${id} not found`);
    }
    const updatedEntry = { ...entry, ...updateEntry };
    this.timeEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    return this.timeEntries.delete(id);
  }

  async getWeeklyActivity(userId: number): Promise<{ date: string, hours: number, category: string }[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const entries = await this.getTimeEntries(userId, startOfWeek, endOfWeek);
    
    // Group by date and category
    const result: Record<string, Record<string, number>> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!result[date]) {
        result[date] = {};
      }
      if (!result[date][entry.category]) {
        result[date][entry.category] = 0;
      }
      result[date][entry.category] += entry.duration / 60; // Convert to hours
    });
    
    // Convert to the required format
    const activities: { date: string, hours: number, category: string }[] = [];
    
    Object.entries(result).forEach(([date, categories]) => {
      Object.entries(categories).forEach(([category, hours]) => {
        activities.push({ date, hours, category });
      });
    });
    
    return activities;
  }

  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(
      (habit) => habit.userId === userId,
    );
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.currentId.habits++;
    const habit: Habit = { ...insertHabit, id };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, updateHabit: Partial<InsertHabit>): Promise<Habit> {
    const habit = this.habits.get(id);
    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    const updatedHabit = { ...habit, ...updateHabit };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Friend methods
  async getFriends(userId: number): Promise<Friend[]> {
    return Array.from(this.friends.values()).filter(
      (friend) => friend.userId === userId || friend.friendId === userId,
    );
  }

  async getFriend(id: number): Promise<Friend | undefined> {
    return this.friends.get(id);
  }

  async createFriend(insertFriend: InsertFriend): Promise<Friend> {
    const id = this.currentId.friends++;
    const friend: Friend = { ...insertFriend, id };
    this.friends.set(id, friend);
    return friend;
  }

  async updateFriend(id: number, updateFriend: Partial<InsertFriend>): Promise<Friend> {
    const friend = this.friends.get(id);
    if (!friend) {
      throw new Error(`Friend with id ${id} not found`);
    }
    const updatedFriend = { ...friend, ...updateFriend };
    this.friends.set(id, updatedFriend);
    return updatedFriend;
  }

  async deleteFriend(id: number): Promise<boolean> {
    return this.friends.delete(id);
  }

  async getFriendActivities(userId: number): Promise<{ id: number, name: string, hours: number, progress: number, recentActivity: string }[]> {
    const friends = await this.getFriends(userId);
    const friendIds = friends
      .filter(f => f.status === 'accepted')
      .map(f => f.userId === userId ? f.friendId : f.userId);
    
    const result = [];
    
    for (const friendId of friendIds) {
      const friend = await this.getUser(friendId);
      if (!friend) continue;
      
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      const entries = await this.getTimeEntries(friendId, startOfWeek, endOfWeek);
      
      const totalHours = entries.reduce((sum, entry) => sum + entry.duration / 60, 0);
      const progress = Math.min(100, Math.round((totalHours / 25) * 100)); // Assuming 25 hours is 100%
      
      // Get most recent activity
      let recentActivity = "No recent activity";
      if (entries.length > 0) {
        const mostRecent = entries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        recentActivity = `${mostRecent.category} (${(mostRecent.duration / 60).toFixed(1)}h)`;
      }
      
      result.push({
        id: friendId,
        name: friend.displayName,
        hours: Math.round(totalHours),
        progress,
        recentActivity
      });
    }
    
    return result;
  }

  // Setup demo data for testing
  private setupDemoData() {
    // No demo data since we need users to register properly
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to avoid the type issue with session.SessionStore

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [createdGoal] = await db.insert(goals).values(goal).returning();
    return createdGoal;
  }

  async updateGoal(id: number, goalData: Partial<InsertGoal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goalData)
      .where(eq(goals.id, id))
      .returning();
    
    if (!updatedGoal) {
      throw new Error(`Goal with id ${id} not found`);
    }
    
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount > 0;
  }

  // Task methods
  async getTasks(userId: number, completed?: boolean): Promise<Task[]> {
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));
    
    if (completed !== undefined) {
      query = query.where(eq(tasks.isCompleted, completed));
    }
    
    return query;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [createdTask] = await db.insert(tasks).values(task).returning();
    return createdTask;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    
    if (!updatedTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Time entry methods
  async getTimeEntries(userId: number, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    let query = db.select().from(timeEntries).where(eq(timeEntries.userId, userId));
    
    if (startDate) {
      query = query.where(gte(timeEntries.date, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(timeEntries.date, endDate));
    }
    
    return query;
  }

  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return entry;
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const [createdEntry] = await db.insert(timeEntries).values(entry).returning();
    return createdEntry;
  }

  async updateTimeEntry(id: number, entryData: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    const [updatedEntry] = await db
      .update(timeEntries)
      .set(entryData)
      .where(eq(timeEntries.id, id))
      .returning();
    
    if (!updatedEntry) {
      throw new Error(`Time entry with id ${id} not found`);
    }
    
    return updatedEntry;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    const result = await db.delete(timeEntries).where(eq(timeEntries.id, id));
    return result.rowCount > 0;
  }

  async getWeeklyActivity(userId: number): Promise<{ date: string, hours: number, category: string }[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const entries = await this.getTimeEntries(userId, startOfWeek, endOfWeek);
    
    // Group by date and category
    const result: Record<string, Record<string, number>> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!result[date]) {
        result[date] = {};
      }
      if (!result[date][entry.category]) {
        result[date][entry.category] = 0;
      }
      result[date][entry.category] += entry.duration / 60; // Convert to hours
    });
    
    // Convert to the required format
    const activities: { date: string, hours: number, category: string }[] = [];
    
    Object.entries(result).forEach(([date, categories]) => {
      Object.entries(categories).forEach(([category, hours]) => {
        activities.push({ date, hours, category });
      });
    });
    
    return activities;
  }

  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return db.select().from(habits).where(eq(habits.userId, userId));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [createdHabit] = await db.insert(habits).values(habit).returning();
    return createdHabit;
  }

  async updateHabit(id: number, habitData: Partial<InsertHabit>): Promise<Habit> {
    const [updatedHabit] = await db
      .update(habits)
      .set(habitData)
      .where(eq(habits.id, id))
      .returning();
    
    if (!updatedHabit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const result = await db.delete(habits).where(eq(habits.id, id));
    return result.rowCount > 0;
  }

  // Friend methods
  async getFriends(userId: number): Promise<Friend[]> {
    return db
      .select()
      .from(friends)
      .where(
        sql`${friends.userId} = ${userId} OR ${friends.friendId} = ${userId}`
      );
  }

  async getFriend(id: number): Promise<Friend | undefined> {
    const [friend] = await db.select().from(friends).where(eq(friends.id, id));
    return friend;
  }

  async createFriend(friend: InsertFriend): Promise<Friend> {
    const [createdFriend] = await db.insert(friends).values(friend).returning();
    return createdFriend;
  }

  async updateFriend(id: number, friendData: Partial<InsertFriend>): Promise<Friend> {
    const [updatedFriend] = await db
      .update(friends)
      .set(friendData)
      .where(eq(friends.id, id))
      .returning();
    
    if (!updatedFriend) {
      throw new Error(`Friend with id ${id} not found`);
    }
    
    return updatedFriend;
  }

  async deleteFriend(id: number): Promise<boolean> {
    const result = await db.delete(friends).where(eq(friends.id, id));
    return result.rowCount > 0;
  }

  async getFriendActivities(userId: number): Promise<{ id: number, name: string, hours: number, progress: number, recentActivity: string }[]> {
    const friends = await this.getFriends(userId);
    const friendIds = friends
      .filter(f => f.status === 'accepted')
      .map(f => f.userId === userId ? f.friendId : f.userId);
    
    const result = [];
    
    for (const friendId of friendIds) {
      const friend = await this.getUser(friendId);
      if (!friend) continue;
      
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      const entries = await this.getTimeEntries(friendId, startOfWeek, endOfWeek);
      
      const totalHours = entries.reduce((sum, entry) => sum + entry.duration / 60, 0);
      const progress = Math.min(100, Math.round((totalHours / 25) * 100)); // Assuming 25 hours is 100%
      
      // Get most recent activity
      let recentActivity = "No recent activity";
      if (entries.length > 0) {
        const mostRecent = entries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        recentActivity = `${mostRecent.category} (${(mostRecent.duration / 60).toFixed(1)}h)`;
      }
      
      result.push({
        id: friendId,
        name: friend.displayName,
        hours: Math.round(totalHours),
        progress,
        recentActivity
      });
    }
    
    return result;
  }
}

// Switch from in-memory storage to database storage
export const storage = new DatabaseStorage();
