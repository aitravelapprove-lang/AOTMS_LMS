/**
 * Normalizes the backend base URL so that it always points to the '/api' prefix,
 * preventing 404 HTML responses or duplicated hostnames (e.g. 187.53.134.243/187.53.134.243/api).
 */
const getBaseApiUrl = (): string => {
  let envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_RENDER_URL;
  if (!envUrl) {
    return "/api";
  }
  let trimmed = envUrl.trim().replace(/\/+$/, "");
  // If envUrl contains raw IP 187.53.134.243, always return relative "/api"
  // to prevent HTTPS Mixed Content errors on domains like lms.academyoftechmasters.com
  if (trimmed.includes("187.53.134.243")) {
    return "/api";
  }
  // If envUrl does not start with http://, https://, or /, default safely to relative "/api"
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
    return "/api";
  }
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const API_URL = getBaseApiUrl();

/**
 * Safely parse JSON responses from backend. If the backend returns an HTML page
 * (e.g. 404 Not Found, 502 Bad Gateway during Render cold starts), this provides
 * a descriptive Error instead of throwing SyntaxError: Unexpected token '<', <!DOCTYPE.
 */
export const parseJsonResponse = async <T = any>(res: Response): Promise<T> => {
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`API endpoint not found (404) at ${res.url}. Please check the backend route.`);
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(
          `Backend server is waking up or temporarily unavailable (${res.status}). Please retry in a few seconds.`
        );
      }
      throw new Error(`Server returned error status ${res.status} (${res.statusText || 'Unknown'}).`);
    }
    throw new Error("Invalid response format received from server (expected JSON).");
  }
};

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

      const data = await parseJsonResponse<any>(res);
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

  const endpoint = url.startsWith("http") ? url : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;

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
      const err = await parseJsonResponse<any>(res);
      errStr =
        err.error || err.message || (err.data && err.data.message) || errStr;
    } catch (e: any) {
      errStr = e.message || errStr;
    }
    throw new Error(errStr);
  }

  // Support 204 No Content or empty responses
  if (res.status === 204) {
    return {} as T;
  }

  return parseJsonResponse<T>(res);
};
