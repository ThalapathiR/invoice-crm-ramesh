import { CommonService } from "@/service/commonservice.page";
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const TOAST_COOLDOWN = 500; // ms to prevent duplicate toasts
const toastCache: Record<string, number> = {};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

function getAuthToken() {
  return getCookie("token");
}

function showDeDupToast(options: any) {
  const cacheKey = `${options.title}-${options.description}-${options.variant}`;
  const now = Date.now();
  if (toastCache[cacheKey] && now - toastCache[cacheKey] < TOAST_COOLDOWN) {
    return;
  }
  toastCache[cacheKey] = now;
  toast(options);
}

async function handleGlobalToasts(res: Response, method: string) {
  // ✅ CRITICAL FIX: Ignore auth/me completely for toasts
  if (res.url.toLowerCase().includes("auth/me")) return;

  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());

  if (res.headers.get("content-type")?.includes("application/json")) {
    const clone = res.clone();
    try {
      const data = await clone.json();

      if (data && (data.Message || data.message)) {
        const rawMessage = data.Message || data.message;

        if (rawMessage === "S" || rawMessage === "E" || rawMessage === "EMAIL_NOT_VERIFIED") return;

        const isError = !res.ok || data.Type === 'E';

        if (isError || isMutation) {
          showDeDupToast({
            title: isError ? "Error" : (data.Type === 'S' ? "Success" : "Notification"),
            description: rawMessage,
            variant: isError ? "destructive" : "success",
          });
        }
      }
    } catch { }
  }
}

async function throwIfResNotOk(res: Response, method: string) {
  // 🔥 FULL BLOCK for auth/me
  const isAuthMe = res.url.toLowerCase().includes("auth/me");
  if (isAuthMe) {
    if (res.status === 401) {
      return; // ✅ completely ignore
    }
  }

  if (res.status === 401) {
    const isAuthMe = res.url.toLowerCase().includes("auth/me");
    if (!isAuthMe) {
      console.warn("Unauthorized API call, redirecting to login.");
      // Clear cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      queryClient.setQueryData(["auth", "me"], null);
      window.location.href = "/login";
      return;
    }
  }

  await handleGlobalToasts(res, method);

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.Message || data.message || data.error?.message || JSON.stringify(data);
    } catch { }

    throw new Error(message || `${res.status}: Unknown Error`);
  }

  // Also throw if the status is 2xx but the body explicitly says it's an error
  if (res.headers.get("content-type")?.includes("application/json")) {
    const clone = res.clone();
    try {
      const data = await clone.json();
      if (data && data.Type === 'E') {
        throw new Error(data.Message || data.message || "Operation failed");
      }
    } catch { }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // ✅ ADDED: Get token from cookies and add to headers
  const token = getAuthToken();
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const formattedUrl = (CommonService as any).formatUrl(url);

  const res = await fetch(formattedUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res, method);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const headers: Record<string, string> = {};
      
      // ✅ ADDED: Get token from cookies and add to headers
      const token = getAuthToken();
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = queryKey.join("/");
      const formattedUrl = (CommonService as any).formatUrl(url);

      const res = await fetch(formattedUrl, {
        headers,
        credentials: "include",
      });
      if (res.url.toLowerCase().includes("auth/me") && res.status === 401) {
        return null; // 🔥 HARD STOP
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res, "GET");
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
      // Global error toasting is now handled in handleGlobalToasts via throwIfResNotOk
      // We only keep this as a fallback for unexpected errors or to provide additional context
      onError: (error: any) => {
        if (!error.message) {
          showDeDupToast({
            title: "Action Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      },
    },
  },
});
