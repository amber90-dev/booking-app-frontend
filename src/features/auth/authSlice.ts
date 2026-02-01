import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

export type User = { id: string; username: string; role?: string };

type AuthState = {
  user: User | null;
  bootstrapped: boolean;
  accessToken: string | null; // keep token if you use Bearer; null is fine for cookie-only
};

const initialState: AuthState = {
  user: null,
  bootstrapped: false,
  accessToken: null,
};

// Try to restore session from refresh cookie on app start
export const initSession = createAsyncThunk(
  "auth/initSession",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/refresh"); // server should set new access token cookie or return { user, accessToken }
      // Support both shapes:
      //  - cookie-only: maybe returns { user }
      //  - bearer: returns { user, accessToken }
      return {
        user: (data && (data.user ?? data?.data?.user)) || null,
        accessToken:
          (data && (data.accessToken ?? data?.data?.accessToken)) || null,
      };
    } catch {
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
      // Expect either { user } or { user, accessToken }
      return {
        user: (data && (data.user ?? data?.data?.user)) || null,
        accessToken:
          (data && (data.accessToken ?? data?.data?.accessToken)) || null,
      };
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
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(initSession.fulfilled, (state, action) => {
      state.user = action.payload?.user ?? null;
      state.accessToken = action.payload?.accessToken ?? null;
      state.bootstrapped = true;
    });
    b.addCase(initSession.rejected, (state) => {
      state.user = null;
      state.accessToken = null;
      state.bootstrapped = true;
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
