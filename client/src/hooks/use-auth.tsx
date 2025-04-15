import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      // If Firebase user changes, refresh the backend user
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    });

    return () => unsubscribe();
  }, []);

  // Get user from backend
  const {
    data: user,
    error,
    isLoading,
    refetch: refreshUser,
  } = useQuery<AuthUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        firebaseUser,
        isLoading,
        error: error || null,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}