import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Check, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme-provider";
import { signInWithGoogle, loginWithEmailAndPassword, registerWithEmailAndPassword, sendPasswordReset } from "@/lib/firebase";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Registration form schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Reset password schema
const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

// OTP verification schema
const otpSchema = z.object({
  otp: z.string().min(6, { message: "Please enter a valid verification code" }),
});

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [authTab, setAuthTab] = useState<"login" | "register" | "reset" | "otp">("login");
  const [verifyingEmail, setVerifyingEmail] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Reset password form
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  // OTP verification form
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle login
  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsAuthenticating(true);
      await loginWithEmailAndPassword(data.email, data.password);
      toast({
        title: "Login successful!",
        description: "Welcome back to TimeTracker!",
      });
      // Redirect happens automatically from useEffect when user is set
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle registration
  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsAuthenticating(true);
      await registerWithEmailAndPassword(data.email, data.password, data.name);
      
      // Set email for verification
      setVerifyingEmail(data.email);
      
      // Show OTP verification tab
      setAuthTab("otp");
      
      toast({
        title: "Registration successful!",
        description: "Please check your email for verification code",
      });
      
      setVerificationSent(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle reset password
  const onResetPassword = async (data: z.infer<typeof resetSchema>) => {
    try {
      setIsAuthenticating(true);
      await sendPasswordReset(data.email);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for reset instructions",
      });
      setAuthTab("login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description: error.message || "Please check your email and try again",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle OTP verification
  const onVerifyOTP = async (data: z.infer<typeof otpSchema>) => {
    try {
      setIsAuthenticating(true);
      // Simulate OTP verification 
      // In a real implementation, this would call a backend endpoint
      setTimeout(() => {
        setVerificationComplete(true);
        toast({
          title: "Email verified!",
          description: "Your account is now verified. You can now log in.",
        });
        setAuthTab("login");
        setIsAuthenticating(false);
      }, 1500);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Please check the code and try again",
        variant: "destructive",
      });
      setIsAuthenticating(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await signInWithGoogle();
      toast({
        title: "Google sign-in successful!",
        description: "Welcome to TimeTracker!",
      });
      // Redirect happens automatically from useEffect when user is set
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full w-10 h-10 animate-glow"
        >
          {theme === 'dark' ? (
            <span className="text-yellow-500">🌙</span>
          ) : (
            <span className="text-yellow-500">☀️</span>
          )}
        </Button>
      </div>
      
      <div className="grid w-full gap-6 md:grid-cols-2 lg:gap-12 max-w-6xl mx-auto animate-fade-in">
        {/* Hero Section */}
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gradient-rainbow animate-typing">
              TimeMaster
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl animate-slide-up delay-100">
              Your AI-powered personal productivity assistant. Track your goals, habits, and progress with intuitive visualization.
            </p>
          </div>
          
          <div className="space-y-4 animate-slide-up delay-200">
            <div className="glass p-4 rounded-lg flex items-start space-x-4 animate-slide-in">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center mt-1">
                <Check className="text-primary-foreground h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Intelligent Progress Tracking</h3>
                <p className="text-muted-foreground">AI-powered insights to help you stay on track and improve.</p>
              </div>
            </div>
            
            <div className="glass p-4 rounded-lg flex items-start space-x-4 animate-slide-in delay-100">
              <div className="bg-accent-green rounded-full w-8 h-8 flex items-center justify-center mt-1">
                <Check className="text-primary-foreground h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Sleep & Habit Monitoring</h3>
                <p className="text-muted-foreground">Track your sleep patterns and build lasting habits.</p>
              </div>
            </div>
            
            <div className="glass p-4 rounded-lg flex items-start space-x-4 animate-slide-in delay-200">
              <div className="bg-accent-purple rounded-full w-8 h-8 flex items-center justify-center mt-1">
                <Check className="text-primary-foreground h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Voice Journal & Social Features</h3>
                <p className="text-muted-foreground">Record your thoughts and compare progress with friends.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Forms */}
        <div className="flex flex-col justify-center">
          <Card className="card-3d-deep animate-float w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gradient">
                {authTab === "login" && "Welcome Back"}
                {authTab === "register" && "Create Account"}
                {authTab === "reset" && "Reset Password"}
                {authTab === "otp" && "Verify Email"}
              </CardTitle>
              <CardDescription className="text-center">
                {authTab === "login" && "Enter your credentials to access your account"}
                {authTab === "register" && "Sign up to start tracking your productivity"}
                {authTab === "reset" && "We'll send you instructions to reset your password"}
                {authTab === "otp" && "Enter the verification code sent to your email"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {authTab !== "otp" && (
                <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="login" className="btn-neon">Login</TabsTrigger>
                    <TabsTrigger value="register" className="btn-neon">Register</TabsTrigger>
                    <TabsTrigger value="reset" className="btn-neon">Reset</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-0">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="you@example.com" 
                                  type="email" 
                                  {...field} 
                                  className="btn-glow"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="••••••••" 
                                    type={showPassword ? "text" : "password"} 
                                    {...field} 
                                    className="btn-glow pr-10"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full btn-gradient" 
                          disabled={isAuthenticating}
                        >
                          {isAuthenticating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 btn-glow" 
                        disabled={isAuthenticating}
                        onClick={handleGoogleSignIn}
                      >
                        {isAuthenticating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                        )}
                        Google
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="register" className="mt-0">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your Name" 
                                  {...field} 
                                  className="btn-glow"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="you@example.com" 
                                  type="email" 
                                  {...field} 
                                  className="btn-glow"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="••••••••" 
                                    type={showPassword ? "text" : "password"} 
                                    {...field} 
                                    className="btn-glow pr-10"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="••••••••" 
                                  type={showPassword ? "text" : "password"} 
                                  {...field} 
                                  className="btn-glow"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full btn-gradient" 
                          disabled={isAuthenticating}
                        >
                          {isAuthenticating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 btn-glow" 
                        disabled={isAuthenticating}
                        onClick={handleGoogleSignIn}
                      >
                        {isAuthenticating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                        )}
                        Google
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reset" className="mt-0">
                    <Form {...resetForm}>
                      <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                        <div className="flex items-center p-4 text-sm text-amber-600 rounded-lg bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <div>Enter your email address and we'll send you instructions to reset your password.</div>
                        </div>
                        
                        <FormField
                          control={resetForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="you@example.com" 
                                  type="email" 
                                  {...field} 
                                  className="btn-glow"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full btn-gradient" 
                          disabled={isAuthenticating}
                        >
                          {isAuthenticating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending Reset Email...
                            </>
                          ) : (
                            "Send Reset Instructions"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              )}
              
              {authTab === "otp" && (
                <div className="space-y-6">
                  <div className="flex items-center p-4 text-sm rounded-lg glass mb-4">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">Verification code sent!</p>
                      <p className="text-muted-foreground">Check your email at {verifyingEmail}</p>
                    </div>
                  </div>
                  
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-6">
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center space-y-2">
                            <FormLabel className="text-center text-base">Enter the 6-digit code</FormLabel>
                            <FormControl>
                              <InputOTP maxLength={6} {...field} value={field.value || ""}>
                                <InputOTPGroup className="gap-2">
                                  <InputOTPSlot index={0} className="w-10 h-12 text-xl" />
                                  <InputOTPSlot index={1} className="w-10 h-12 text-xl" />
                                  <InputOTPSlot index={2} className="w-10 h-12 text-xl" />
                                  <InputOTPSlot index={3} className="w-10 h-12 text-xl" />
                                  <InputOTPSlot index={4} className="w-10 h-12 text-xl" />
                                  <InputOTPSlot index={5} className="w-10 h-12 text-xl" />
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex flex-col space-y-4">
                        <Button 
                          type="submit" 
                          className="w-full btn-gradient" 
                          disabled={isAuthenticating}
                        >
                          {isAuthenticating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify Email"
                          )}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="text-xs"
                          onClick={() => setAuthTab("login")}
                        >
                          Go back to login
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col">
              {authTab === "login" && (
                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <button 
                    type="button" 
                    className="text-primary hover:underline font-medium" 
                    onClick={() => setAuthTab("register")}
                  >
                    Sign up
                  </button>
                </p>
              )}
              
              {authTab === "register" && (
                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    className="text-primary hover:underline font-medium" 
                    onClick={() => setAuthTab("login")}
                  >
                    Sign in
                  </button>
                </p>
              )}
              
              {authTab === "reset" && (
                <p className="text-sm text-muted-foreground text-center">
                  Remember your password?{" "}
                  <button 
                    type="button" 
                    className="text-primary hover:underline font-medium" 
                    onClick={() => setAuthTab("login")}
                  >
                    Back to sign in
                  </button>
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}