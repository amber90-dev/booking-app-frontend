import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import store from "../store"; // adjust path if your store is elsewhere

// Create instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // send cookies for cookie-based auth
});

// ---------- Request: attach Bearer if we have one ----------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const state = store.getState() as any;
  const token: string | null = state?.auth?.accessToken ?? null;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Response: refresh-on-401 (single-flight) ----------
let isRefreshing = false;
let waiters: Array<() => void> = [];

function enqueueWaiter(cb: () => void) {
  waiters.push(cb);
}
function releaseWaiters() {
  const cbs = waiters.slice();
  waiters = [];
  cbs.forEach((cb) => cb());
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const { response, config } = error || {};
    const original = config as any;

    // Only handle 401s once per request
    if (!response || response.status !== 401 || original?._retry) {
      throw error;
    }
    // Don't loop on the refresh call itself
    if ((original?.url || "").includes("/auth/refresh")) {
      throw error;
    }
    original._retry = true;

    if (isRefreshing) {
      // queue until the ongoing refresh finishes
      return new Promise((resolve, reject) => {
        enqueueWaiter(() => {
          api.request(original).then(resolve).catch(reject);
        });
      });
    }

    try {
      isRefreshing = true;
      // If your server is cookie-only, this sets fresh cookies.
      // If it returns { user, accessToken }, your init thunk should store it.
      await api.post("/auth/refresh");
      releaseWaiters();
      return api.request(original);
    } catch (e) {
      releaseWaiters();
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
