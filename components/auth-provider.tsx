"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string;
  affiliateCode?: string;
  affiliateEarnings?: number;
  affiliateReferrals?: number;
  usdtWalletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    isAdmin?: boolean
  ) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate checking for an existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("susmanga-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication
    const mockUser: User = {
      id: "user-1",
      name: "Demo User",
      email: email,
      avatar: "/placeholder.svg?height=40&width=40",
      isAdmin: email.includes("admin"),
      isPremium: email.includes("premium"),
      premiumExpiresAt: email.includes("premium")
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        : undefined,
      affiliateCode: "DEMO123",
      affiliateEarnings: 36,
      affiliateReferrals: 9,
    };

    setUser(mockUser);
    localStorage.setItem("susmanga-user", JSON.stringify(mockUser));
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    isAdmin = false
  ) => {
    // Mock registration
    const mockUser: User = {
      id: "user-" + Date.now(),
      name: name,
      email: email,
      avatar: "/placeholder.svg?height=40&width=40",
      isAdmin: isAdmin,
      isPremium: false,
      affiliateCode: "USER" + Math.floor(Math.random() * 10000),
      affiliateEarnings: 0,
      affiliateReferrals: 0,
    };

    setUser(mockUser);
    localStorage.setItem("susmanga-user", JSON.stringify(mockUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("susmanga-user");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("susmanga-user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSignedIn: !!user,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
