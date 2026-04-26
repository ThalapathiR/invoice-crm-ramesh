import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./queryClient";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

function getUserFromCookie(): User | null {
  const userDataStr = getCookie("user_data");
  if (!userDataStr) return null;
  try {
    return JSON.parse(decodeURIComponent(userDataStr));
  } catch {
    return null;
  }
}

type User = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobile?: string | null;
  role: string;
  user_role_id?: string;
  avatar?: string | null;
  createdAt: string;
  company?: {
    id: string;
    name: string;
  };
};

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  login: (usernameOrEmailOrUserObj: string | any, password?: string) => Promise<User>;
  googleLogin: (credential: string, type?: 'id_token' | 'access_token', mobile?: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: any, skipStateUpdate?: boolean) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "auth/me?t=" + Date.now());

        const data = await res.json();

        // ✅ Handle both 401 and 200-but-unauthorized responses
        if (res.status === 401 || data?.Type === "E" || data?.Message === "Unauthorized") {
          return null;
        }

        const userData = data.result || data;
        // Normalize role property
        if (userData && !userData.role && userData.user_role_name) {
          userData.role = userData.user_role_name;
        }
        return userData;
      } catch (err: any) {
        // ✅ Ignore Unauthorized (expected before login)
        if (err?.status === 401 || err?.message?.includes("Unauthorized")) {
          return null;
        }

        console.error("Auth error:", err);
        return null;
      }
    },
  });

  const syncAuthCookies = (data: any) => {
    if (!data || data.Type === "E") return null;

    const token = data.api_token || data.token;
    // The backend now returns { api_token, user: { ..., company: { ... } } }
    // Or it might be the raw result object from 'me'
    const userData = data.user || data.result || data;
    
    // Normalize role property if missing but user_role_name exists
    if (!userData.role && userData.user_role_name) {
      userData.role = userData.user_role_name;
    }
    
    // Set user_data cookie (accessible by JS for context)
    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax`;
    
    // Set token cookie (for Authorization header)
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return userData;
  };

  const login = async (usernameOrEmailOrUserObj: string | any, password?: string) => {
    if (typeof usernameOrEmailOrUserObj === "object") {
      const userData = syncAuthCookies(usernameOrEmailOrUserObj);
      queryClient.setQueryData(["auth", "me"], userData);
      return userData;
    }

    const res = await apiRequest("POST", "auth/login", {
      email: usernameOrEmailOrUserObj,
      password,
    });

    const data = await res.json();
    if (data.Type === "E") {
      throw new Error(data.Message || "Login failed");
    }
    const result = data.result || data;
    const userData = syncAuthCookies(result);
    
    queryClient.setQueryData(["auth", "me"], userData);
    return userData;
  };

  const googleLogin = async (credential: string, type: 'id_token' | 'access_token' = 'id_token', mobile?: string) => {
    const res = await apiRequest("POST", "auth/GoogleLogin", {
      credential,
      type,
      mobile,
    });

    const data = await res.json();
    if (data.Type === "E") {
      throw new Error(data.Message || "Google login failed");
    }
    const result = data.result || data;
    const userData = syncAuthCookies(result);

    queryClient.setQueryData(["auth", "me"], userData);
    return userData;
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "auth/logout");
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      // Clear cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
      window.location.href = "/login";
    }
  };

  const register = async (data: any) => {
    const res = await apiRequest("POST", "auth/register", data);
    const responseData = await res.json();
    if (responseData.Type === "E") {
      throw new Error(responseData.Message || "Registration failed");
    }
    const result = responseData.result || responseData.AddtionalData || responseData;
    
    const userData = syncAuthCookies(result);
    queryClient.setQueryData(["auth", "me"], userData);
    
    // Redirect to dashboard on success
    setTimeout(() => {
       window.location.href = "/dashboard";
    }, 1500);
    
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, googleLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
