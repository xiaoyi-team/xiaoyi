
/**
 * src/auth/AuthContext.tsx
 *
 * 全局登录状态管理
 *
 * 核心规则：
 * 1. 登录成功后保存 Token。
 * 2. 自动请求 /user/info 获取用户资料。
 * 3. profile_finished 仅用于完善资料提示。
 * 4. 未完善资料的用户与已完善资料的用户权限相同。
 * 5. 刷新页面时自动恢复登录状态。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
} from "../api/auth";

import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthToken,
  hasAuthToken,
  getAuthorizationHeader,
  isSharedAuthStorageChange,
} from "../api/client";
import { createIdentitySession } from "./identitySession";
import { createAdminGrantTracker, type AdminGrant } from "./adminGrant";

import type {
  CurrentUser,
  LoginParams,
  RegisterParams,
} from "../types/auth";

/**
 * 判断用户资料是否完善。
 *
 * 优先使用后端 profile_finished 字段。
 * 如果后端没有返回该字段，
 * 则根据 nickname 是否为空进行判断。
 *
 * 注意：
 * 这个结果不参与用户权限控制。
 */
function checkProfileFinished(
  user: CurrentUser | null
): boolean {
  if (!user) {
    return false;
  }

  if (typeof user === "string") {
    return false;
  }

  if (
    typeof user.profile_finished === "boolean"
  ) {
    return user.profile_finished;
  }

  if (
    typeof user.nickname === "string"
  ) {
    return user.nickname.trim().length > 0;
  }

  return false;
}

/**
 * AuthContext 对外提供的数据和方法
 */
interface AuthContextValue {
  /**
   * 当前用户信息
   */
  user: CurrentUser | null;

  /**
   * 是否已经登录。
   *
   * 只取决于登录 Token 是否有效，
   * 不取决于个人资料是否完善。
   */
  isAuthenticated: boolean;
  isLogin: boolean;

  /**
   * 是否正在恢复登录状态
   */
  initializing: boolean;
  isLoading: boolean;
  reconfirmingIdentity: boolean;
  sharedIdentityRevision: number;
  adminGrant: AdminGrant | null;

  /**
   * 当前用户资料是否完善
   */
  profileFinished: boolean;

  /**
   * 登录
   */
  login: (
  params: LoginParams,
  remember?: boolean
) => Promise<CurrentUser | null>;

  /**
   * 注册
   *
   * 注册成功不自动登录。
   */
  register: (
    params: RegisterParams
  ) => Promise<string>;

  /**
   * 退出登录
   */
  logout: () => Promise<void>;

  /**
   * 重新获取当前用户资料
   */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session] = useState(() => createIdentitySession(getAuthorizationHeader, getCurrentUserApi));
  const [adminGrants] = useState(() => createAdminGrantTracker(session));
  const [reconfirmingIdentity, setReconfirmingIdentity] = useState(false);
  const [sharedIdentityRevision, setSharedIdentityRevision] = useState(0);

  /**
   * 当前用户资料
   */
  const [user, setCurrentUser] =
    useState<CurrentUser | null>(null);
  const [adminGrant, setAdminGrant] = useState<AuthContextValue["adminGrant"]>(null);
  const setUser = useCallback((nextUser: CurrentUser | null) => {
    // Revoke synchronously; async cache callbacks can run before React unmounts the admin tree.
    setAdminGrant(adminGrants.update(nextUser));
    setCurrentUser(nextUser);
  }, [adminGrants]);

  /**
   * 是否已经登录
   *
   * 初始化时读取本地 Token，
   * 不检查 profile_finished。
   */
  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState<boolean>(() =>
    hasAuthToken()
  );

  /**
   * 是否正在恢复登录状态
   */
  const [
    initializing,
    setInitializing,
  ] = useState<boolean>(true);

  /**
   * 当前用户资料是否完善
   *
   * 只用于页面提示和导航，
   * 不参与权限判断。
   */
  const profileFinished = useMemo(
    () => checkProfileFinished(user),
    [user]
  );

  /**
   * 重新读取当前用户资料
   *
   * GET /user/info
   */
  const refreshUser = useCallback(
    async (): Promise<void> => {
      const version = session.version;
      if (!session.isCurrent(version)) return;
      if (!hasAuthToken()) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      try {
        const currentUser =
          await session.load();

        if (!session.isCurrent(version)) return;
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        if (!session.isCurrent(version)) return;
        setAdminGrant(adminGrants.update(null));
        throw error;
      }
    },
    [session, setUser, adminGrants]
  );

  /**
   * 用户登录
   *
   * 1. 调用 /login。
   * 2. 保存 Token。
   * 3. 调用 /user/info。
   * 4. 保存当前用户资料。
   *
   * 不根据 profile_finished 限制权限。
   */

const login = useCallback(
  async (
    params: LoginParams,
    remember = false
  ): Promise<CurrentUser | null> => {
    const version = session.advance();
    setInitializing(false);
    setReconfirmingIdentity(false);
    // 1. 登录并保存 Token
    const credentials = await loginApi(params, remember, () => session.isCurrent(version));
    if (version !== session.version ||
        getAuthorizationHeader() !== `${credentials.token_type || "Bearer"} ${credentials.access_token}`) {
      throw new Error("登录请求已失效");
    }
    session.adoptAuthorization();

    // 清除上一个账号可能残留的资料
    setUser(null);
    setIsAuthenticated(true);

    try {
      // 2. 获取本次登录用户的资料
      const currentUser = await session.load();

      if (!session.isCurrent(version)) throw new Error("登录请求已失效");
      // 3. 更新全局状态
      setUser(currentUser);
      setIsAuthenticated(true);

      // 4. 直接返回本次登录的用户资料
      return currentUser;
    } catch (error) {
      if (!session.isCurrent(version)) throw error;

      // 仅用户资料请求失败，保留有效登录状态
      setUser(null);
      setIsAuthenticated(true);

      // null 表示资料暂时未知，而不是未完善
      return null;
    }
  },
  [session, setUser]
);


  /**
   * 用户注册
   *
   * 注册成功后不自动登录，
   * 也不调用 /user/info。
   *
   * 页面负责跳转回登录界面。
   */
  const register = useCallback(
    async (
      params: RegisterParams
    ): Promise<string> => {
      return registerApi(params);
    },
    []
  );

  /**
   * 退出登录
   */
  const logout = useCallback(
    async (): Promise<void> => {
      session.advance();
      // logoutApi synchronously captures the old authorization before local cleanup.
      const request = logoutApi();
      clearAuthToken();
      session.adoptAuthorization();
      setUser(null);
      setIsAuthenticated(false);
      setInitializing(false);
      setReconfirmingIdentity(false);
      await request;
    },
    [session, setUser]
  );

  /**
   * 首次恢复身份，以及在其他标签页变更共享凭证后重新确认身份。
   */
  useEffect(() => {
    let active = true;

    async function confirmIdentity(version: number) {
      try {
        const currentUser = await session.load();
        if (active && session.isCurrent(version)) setUser(currentUser);
      } catch {
        // The user is already unknown. Keep a valid credential for manual retry.
      } finally {
        if (active && session.isCurrent(version)) {
          setInitializing(false);
          setReconfirmingIdentity(false);
        }
      }
    }

    function handleUnauthorized() {
      session.advance();
      session.adoptAuthorization();
      setInitializing(false);
      setReconfirmingIdentity(false);
      setUser(null);
      setIsAuthenticated(false);
    }

    function syncSharedIdentity() {
      if (!session.syncAuthorization()) return false;
      const authenticated = hasAuthToken();
      setUser(null);
      setSharedIdentityRevision(session.version);
      setIsAuthenticated(authenticated);
      setInitializing(false);
      setReconfirmingIdentity(authenticated);
      if (authenticated) void confirmIdentity(session.version);
      return true;
    }

    function handleStorage(event: StorageEvent) {
      if (isSharedAuthStorageChange(event)) syncSharedIdentity();
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener("storage", handleStorage);
    const initialVersion = session.version;
    queueMicrotask(() => {
      if (!active || initialVersion !== session.version || syncSharedIdentity()) return;
      if (hasAuthToken()) void confirmIdentity(initialVersion);
      else setInitializing(false);
    });

    return () => {
      active = false;
      session.cancel();
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener("storage", handleStorage);
    };
  }, [session, setUser]);

  /**
   * 统一提供给其他页面使用
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLogin: isAuthenticated,
      initializing: initializing || reconfirmingIdentity,
      isLoading: initializing || reconfirmingIdentity,
      reconfirmingIdentity,
      sharedIdentityRevision,
      adminGrant,
      profileFinished,
      login,
      register,
      logout,
      refreshUser,
    }),
    [
      user,
      isAuthenticated,
      initializing,
      reconfirmingIdentity,
      sharedIdentityRevision,
      adminGrant,
      profileFinished,
      login,
      register,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 其他页面统一使用此 Hook
 * 获取用户登录状态及资料。
 */
// 保持现有 useAuth 导入路径兼容；仅豁免该 Hook 的 Fast Refresh 导出检查。
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth 必须在 AuthProvider 内使用"
    );
  }

  return context;
}
