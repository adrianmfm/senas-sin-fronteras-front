import { User } from 'firebase/auth';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  isAuthenticated: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}