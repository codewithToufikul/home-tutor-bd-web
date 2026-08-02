import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  role: 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching';
  isVerified: boolean;
  isApproved: boolean;
  name?: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching') => Promise<void>;
  register: (name: string, email: string, password: string, role: 'tutor' | 'student' | 'guardian' | 'coaching') => Promise<void>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching' = 'tutor') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const cleanEmail = email.trim().toLowerCase();

    // Default Demo Credentials
    if (role === 'admin' && cleanEmail === 'shakil.infox@gmail.com') {
      const newUser: User = { email: cleanEmail, role: 'admin', isVerified: true, isApproved: true, name: 'Super Admin' };
      setUser(newUser);
      localStorage.setItem('user_session', JSON.stringify(newUser));
    } else if (role === 'tutor' && cleanEmail === 'tutor@example.com') {
      const newUser: User = { email: cleanEmail, role: 'tutor', isVerified: true, isApproved: true, name: 'Demo Tutor' };
      setUser(newUser);
      localStorage.setItem('user_session', JSON.stringify(newUser));
    } else if (role === 'student' && cleanEmail === 'student@example.com') {
      const newUser: User = { email: cleanEmail, role: 'student', isVerified: true, isApproved: true, name: 'Demo Student' };
      setUser(newUser);
      localStorage.setItem('user_session', JSON.stringify(newUser));
    } else if (role === 'guardian' && cleanEmail === 'guardian@example.com') {
      const newUser: User = { email: cleanEmail, role: 'guardian', isVerified: true, isApproved: true, name: 'Demo Guardian' };
      setUser(newUser);
      localStorage.setItem('user_session', JSON.stringify(newUser));
    } else if (role === 'coaching' && cleanEmail === 'coaching@example.com') {
      const newUser: User = { email: cleanEmail, role: 'coaching', isVerified: true, isApproved: true, name: 'Demo Coaching Center' };
      setUser(newUser);
      localStorage.setItem('user_session', JSON.stringify(newUser));
    } else {
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      let foundUser = registeredUsers.find((u: any) => u.email.trim().toLowerCase() === cleanEmail);
      
      if (foundUser) {
        const newUser: User = { 
          ...foundUser, 
          role: role, 
          isVerified: true, 
          isApproved: true 
        };
        setUser(newUser);
        localStorage.setItem('user_session', JSON.stringify(newUser));
      } else {
        const fallbackUser: User = { email: cleanEmail, role: role, isVerified: true, isApproved: true, name: 'User' };
        setUser(fallbackUser);
        localStorage.setItem('user_session', JSON.stringify(fallbackUser));
      }
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string, role: 'tutor' | 'student' | 'guardian' | 'coaching') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const cleanEmail = email.trim().toLowerCase();
    const newUser = { 
      name, 
      email: cleanEmail, 
      password, 
      role, 
      isVerified: true, 
      isApproved: true, 
      id: `HTPBD-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const filtered = registeredUsers.filter((u: any) => u.email.trim().toLowerCase() !== cleanEmail);
    localStorage.setItem('registered_users', JSON.stringify([...filtered, newUser]));

    setUser(newUser);
    localStorage.setItem('user_session', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const verifyEmail = async (_code: string) => {
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, verifyEmail, isLoading }}>
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