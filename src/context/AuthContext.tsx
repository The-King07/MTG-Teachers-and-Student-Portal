import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from '../api/client';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  phone?: string;
  created_at: string;
}

export interface Child {
  id: string;
  name: string;
  username: string;
  email: string;
  class_name: string;
  section: string;
  profile?: {
    student_code: string;
    class_id: string;
    section: string;
    roll_number?: string;
  };
}

interface AuthContextType {
  user: User | null;
  roleDetails: any;
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (child: Child | null) => void;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshChildren: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children: reactChildren }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roleDetails, setRoleDetails] = useState<any>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setRoleDetails(null);
      setChildren([]);
      setActiveChild(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: User; roleDetails: any }>('/auth/me');
      setUser(data.user);
      setRoleDetails(data.roleDetails);

      if (data.user.role === 'PARENT') {
        const childData = await apiRequest<{ children: Child[] }>('/classes/my-children');
        setChildren(childData.children || []);
        if (childData.children && childData.children.length > 0) {
          setActiveChild(prev => {
            if (prev) {
              const matched = childData.children.find(c => c.id === prev.id);
              return matched || childData.children[0];
            }
            return childData.children[0];
          });
        } else {
          setActiveChild(null);
        }
      }
    } catch (err) {
      console.error('Failed to load user auth session:', err);
      removeAuthToken();
      setUser(null);
      setRoleDetails(null);
      setChildren([]);
      setActiveChild(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshChildren = async () => {
    if (user?.role === 'PARENT') {
      try {
        const childData = await apiRequest<{ children: Child[] }>('/classes/my-children');
        setChildren(childData.children || []);
        if (childData.children && childData.children.length > 0 && !activeChild) {
          setActiveChild(childData.children[0]);
        }
      } catch (err) {
        console.error('Failed to refresh children:', err);
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (token: string, userData: User) => {
    setAuthToken(token);
    setUser(userData);
    await refreshUser();
  };

  const registerUser = async (formData: any) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setAuthToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setRoleDetails(null);
    setChildren([]);
    setActiveChild(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roleDetails,
        children,
        activeChild,
        setActiveChild,
        loading,
        login,
        registerUser,
        logout,
        refreshUser,
        refreshChildren
      }}
    >
      {reactChildren}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
