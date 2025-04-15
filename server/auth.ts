import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin (only if not already initialized)
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

// Get Firebase Auth instance
const firebaseAuth = getAuth();

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware to verify Firebase token
async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  
  if (!idToken) {
    return next(); // No token, proceed to next auth method
  }
  
  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const firebaseUser = await firebaseAuth.getUser(decodedToken.uid);
    
    // Check if user exists in our database by email
    let user = await storage.getUserByEmail(firebaseUser.email!);
    
    // If user doesn't exist, create one
    if (!user) {
      user = await storage.createUser({
        username: firebaseUser.email!,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
        password: await hashPassword(randomBytes(16).toString("hex")),
        photoURL: firebaseUser.photoURL,
        firebaseUid: firebaseUser.uid,
      });
    }
    
    // Login user
    req.login(user, (err) => {
      if (err) return next(err);
      next();
    });
  } catch (error) {
    console.error("Firebase token verification error:", error);
    next(); // Error verifying token, proceed to next auth method
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "timemaster-app-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Add Firebase token verification middleware
  app.use(verifyFirebaseToken);

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // Google authentication endpoint
  app.post("/api/auth/google", async (req, res, next) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "No ID token provided" });
      }
      
      // Verify the ID token
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      const firebaseUser = await firebaseAuth.getUser(decodedToken.uid);
      
      // Check if user exists in our database by email
      let user = await storage.getUserByEmail(firebaseUser.email!);
      
      // If user doesn't exist, create one
      if (!user) {
        user = await storage.createUser({
          username: firebaseUser.email!,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
          password: await hashPassword(randomBytes(16).toString("hex")),
          avatar: firebaseUser.photoURL,
          firebaseUid: firebaseUser.uid,
        });
      }
      
      // Login user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });
}
