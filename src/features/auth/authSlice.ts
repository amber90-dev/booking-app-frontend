import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

export type User = { id: string; username: string; role?: string };

type AuthState = {
  user: User | null;
  bootstrapped: boolean;
  accessToken: string | null; // keep token if you use Bearer; null is fine for cookie-only
};

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  bootstrapped: false, // will act as "loading" until verified, or we can rely on local data
  accessToken: localStorage.getItem("accessToken") || null,
};

// Try to restore session
export const initSession = createAsyncThunk(
  "auth/initSession",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      // 1. Try cookie refresh first (preferred)
      const { data } = await api.post("/auth/refresh"); 
      return {
        user: (data && (data.user ?? data?.data?.user)) || null,
        accessToken: (data && (data.accessToken ?? data?.data?.accessToken)) || null,
      };
    } catch (refreshError) {
      // 2. If cookie refresh fails, check if we have a valid access token in store/localstorage
      const state = getState() as any;
      const token = state.auth?.accessToken || localStorage.getItem("accessToken");

      if (token) {
        try {
          // Verify the existing token
          // We need to ensure the token is in the state for axios interceptor to pick it up, 
          // or manually attach it. store.getState() might be stale if we just got it from LS?
          // Actually axios interceptor reads from store. If store is empty (initial load), 
          // we might need to rely on the fact that we hydrated initialState from LS.
          
          const { data } = await api.get("/auth/me");
          // If successful, our token is valid.
          // /auth/me returns { id, username } usually.
          return {
             user: data,
             accessToken: token // keep existing token
          };
        } catch (meError) {
           // Token is also invalid/expired
           return rejectWithValue(null);
        }
      }
      return rejectWithValue(null);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    payload: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      const user = (data && (data.user ?? data?.data?.user)) || null;
      const token = (data && (data.accessToken ?? data?.data?.accessToken)) || null;
      
      // Persist
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("accessToken", token);
      
      return { user, accessToken: token };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Login failed");
    }
  }
);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutSlice(state) {
      state.user = null;
      state.accessToken = null;
      state.bootstrapped = true;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      if (action.payload) localStorage.setItem("user", JSON.stringify(action.payload));
      else localStorage.removeItem("user");
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      if (action.payload) localStorage.setItem("accessToken", action.payload);
      else localStorage.removeItem("accessToken");
    },
  },
  extraReducers: (b) => {
    b.addCase(initSession.fulfilled, (state, action) => {
      // Refresh succeeded, update persistence
      const u = action.payload?.user ?? null;
      const t = action.payload?.accessToken ?? null;
      
      state.user = u;
      state.accessToken = t;
      state.bootstrapped = true;
      
      if (u) localStorage.setItem("user", JSON.stringify(u));
      if (t) localStorage.setItem("accessToken", t);
    });
    b.addCase(initSession.rejected, (state) => {
      // If refresh explicitly fails, we assume session invalid.
      // CLEAR persistence to enforce login.
      state.user = null;
      state.accessToken = null;
      state.bootstrapped = true;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    });
    b.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload?.user ?? null;
      state.accessToken = action.payload?.accessToken ?? null;
      state.bootstrapped = true;
    });
  },
});

export const { logoutSlice, setUser, setAccessToken } = slice.actions;
export default slice.reducer;
