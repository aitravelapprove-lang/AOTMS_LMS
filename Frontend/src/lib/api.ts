export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Shared promise for deduplicating concurrent refresh requests
let refreshPromise: Promise<string> | null = null;

/**
 * Silently refresh the access token using the backend's HttpOnly refresh_token cookie.
 * Deduplicates concurrent calls so only one refresh request is in flight at a time.
 */
export const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Transmit HttpOnly cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // If the refresh token is genuinely invalid or expired (401), session is dead
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          localStorage.removeItem("user_role");
          
          // Only redirect if we are not already on an auth / public page
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/auth") &&
            !window.location.pathname.startsWith("/login") &&
            window.location.pathname !== "/"
          ) {
            window.location.href = "/auth";
          }
        }
        throw new Error(`Session refresh failed with status ${res.status}`);
      }

      const data = await res.json();
      const newAccessToken = data?.session?.access_token;
      if (!newAccessToken) {
        throw new Error("Invalid refresh response: access token missing");
      }

      localStorage.setItem("access_token", newAccessToken);

      // Notify any listeners (e.g. useAuth hook or socket connections)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:token_refreshed", {
            detail: { token: newAccessToken },
          })
        );
      }

      return newAccessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Fetch wrapper that attaches the Bearer token and automatic credentials,
 * transparently refreshing the token on 401 responses before retrying.
 */
export const fetchWithAuth = async <T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  let token = localStorage.getItem("access_token");

  // Set up headers
  const getHeaders = (t: string | null): Record<string, string> => {
    const h: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type to application/json if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      h["Content-Type"] = "application/json";
    }

    if (t) {
      h["Authorization"] = `Bearer ${t}`;
    }
    return h;
  };

  const endpoint = url.startsWith("http") ? url : `${API_URL}${url}`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      ...options,
      credentials: "include", // Always include cookies for cross-origin or same-site sessions
      headers: getHeaders(token),
    });
  } catch (netErr) {
    // Network errors (e.g. offline, connection drop) should NOT log the user out
    throw netErr;
  }

  // Handle token expiration: attempt silent refresh once and retry
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      token = newToken;

      // Retry the original request with the fresh token
      res = await fetch(endpoint, {
        ...options,
        credentials: "include",
        headers: getHeaders(token),
      });
    } catch (refreshErr) {
      // If refresh failed because refresh token was rejected, an error is already handled
      throw refreshErr;
    }
  }

  if (!res.ok) {
    let errStr = `API Request Failed (${res.status})`;
    try {
      const err = await res.json();
      errStr =
        err.error || err.message || (err.data && err.data.message) || errStr;
    } catch {
      // Non-JSON error body, keep fallback
    }
    throw new Error(errStr);
  }

  // Support 204 No Content or empty responses
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
};
