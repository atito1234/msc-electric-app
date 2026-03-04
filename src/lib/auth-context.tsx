import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from './database';
import { supabase } from './supabase';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map DB profile to User interface
const mapProfileToUser = (profile: any): User => ({
  ...profile,
  hourlyRate: profile.hourly_rate,
  isActive: profile.availability !== 'unavailable', // simplified mapping
  lastLogin: new Date().toISOString(), // Supabase handles this internally usually
  createdAt: profile.created_at,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
      } else if (data) {
        setUser(mapProfileToUser(data));
      }
    } catch (err) {
      console.error('Profile fetch failed', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session) {
        // Only fetch if we don't have the user or it's a different user
        // But simpler to just fetch to be safe on switch
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // DEMO Bypass (Leftover for clients/employees for UI testing)
    const demoUsers: Record<string, { role: UserRole, name: string, pass: string }> = {
      'johnson.family@email.com': { role: 'client', name: 'Michael Johnson', pass: 'client123' },
      'carlos.martinez@mscelectric.com': { role: 'employee', name: 'Carlos Martinez', pass: 'employee123' },
      'juan.rodriguez@jrelectric.com': { role: 'subcontractor', name: 'Juan Rodriguez', pass: 'sub123456' },
      'builder@apexconstruction.com': { role: 'gc', name: 'Apex Construction', pass: 'gc123456' },
    };

    if (demoUsers[email] && password === demoUsers[email].pass) {
      setUser({
        id: `mock-${demoUsers[email].role}-id`,
        email: email,
        password: '', // Required by the legacy User type
        name: demoUsers[email].name,
        role: demoUsers[email].role,
        isActive: true,
        createdAt: new Date().toISOString()
      } as User);
      setIsLoading(false);
      toast.success('Welcome back! (Demo Mode)');
      return true;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return false;
    }

    if (data.user) {
      await fetchProfile(data.user.id);
      toast.success(`Welcome back!`);
      return true;
    }

    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const refreshUser = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based route guard component
interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

export function RequireAuth({ children, allowedRoles, fallback }: RequireAuthProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F2C94C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If we have a fallback (like forcing login redirect), use it. 
    // Otherwise show access denied or redirect logic could be here.
    // The original code showed a login prompt/link.
    return fallback || (
      <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A9AFB8] mb-4">Please log in to access this page</p>
          <a href="/login" className="btn-primary" onClick={(e) => {
            e.preventDefault();
            window.location.href = '/login';
          }}>Go to Login</a>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">You don't have permission to access this page</p>
          <p className="text-[#A9AFB8] text-sm">Your role: {user!.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
