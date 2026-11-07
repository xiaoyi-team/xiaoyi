import { createContext, useContext } from "react";
import type {
  CurrentUser,
  LoginParams,
  RegisterParams,
} from "../types/auth";

export interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  initializing: boolean;
  profileFinished: boolean;
  login: (
    params: LoginParams,
    remember?: boolean
  ) => Promise<CurrentUser | null>;
  register: (params: RegisterParams) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth 必须在 AuthProvider 内使用"
    );
  }

  return context;
}