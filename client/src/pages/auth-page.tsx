import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Clock, Key, Mail, User, UserPlus, LogIn, CircleCheckBig } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLoginForm, setIsLoginForm] = useState(true);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      email: '',
      avatar: '',
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center animate-pulse">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-4 text-2xl font-display font-bold bg-gradient-to-r from-primary to-[#f45d96] bg-clip-text text-transparent">
              TimeMaster
            </h1>
          </div>

          <div className="bg-dark-secondary rounded-xl p-6 border border-gray-800 shadow-lg">
            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 text-center ${
                  isLoginForm ? 'text-white border-b-2 border-primary' : 'text-gray-400'
                }`}
                onClick={() => setIsLoginForm(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  !isLoginForm ? 'text-white border-b-2 border-primary' : 'text-gray-400'
                }`}
                onClick={() => setIsLoginForm(false)}
              >
                Register
              </button>
            </div>

            {isLoginForm ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              className="pl-10 bg-dark-tertiary border-gray-700" 
                              placeholder="Enter your username" 
                            />
                          </div>
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
                            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              type="password" 
                              className="pl-10 bg-dark-tertiary border-gray-700" 
                              placeholder="Enter your password" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-light"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <div className="flex items-center">
                        <Clock className="animate-spin mr-2 h-4 w-4" /> Logging in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <LogIn className="mr-2 h-4 w-4" /> Login
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              className="pl-10 bg-dark-tertiary border-gray-700" 
                              placeholder="Choose a username" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              className="pl-10 bg-dark-tertiary border-gray-700" 
                              placeholder="Your name to display" 
                            />
                          </div>
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
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              type="email"
                              className="pl-10 bg-dark-tertiary border-gray-700" 
                              placeholder="Your email address" 
                            />
                          </div>
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
                            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              type="password" 
                              className="pl-10 bg-dark-tertiary border-gray-700" 
                              placeholder="Create a password" 
                            />
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
                          <div className="relative">
                            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              type="password" 
                              className="pl-10 bg-dark-tertiary border-gray-700" 
                              placeholder="Confirm your password" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-light"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <div className="flex items-center">
                        <Clock className="animate-spin mr-2 h-4 w-4" /> Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" /> Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-dark-secondary to-dark p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-[#f45d96] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Track your progress and <span className="bg-gradient-to-r from-primary to-[#f45d96] bg-clip-text text-transparent">achieve more</span>
          </h2>
          
          <p className="text-lg text-gray-300 mb-8">
            TimeMaster helps you monitor your productivity, set goals, and visualize your progress with AI-powered insights.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-[#38b6ff] mr-3">
                <CircleCheckBig className="h-5 w-5" />
              </div>
              <p>Set and track weekly/daily goals</p>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-[#f45d96] mr-3">
                <CircleCheckBig className="h-5 w-5" />
              </div>
              <p>Monitor your time usage for different activities</p>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-[#32d196] mr-3">
                <CircleCheckBig className="h-5 w-5" />
              </div>
              <p>Get AI-powered suggestions to improve productivity</p>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-primary-light mr-3">
                <CircleCheckBig className="h-5 w-5" />
              </div>
              <p>Compare progress with friends for motivation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
