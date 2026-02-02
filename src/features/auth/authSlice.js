import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
const initialState = {
    user: JSON.parse(localStorage.getItem("user") || "null"),
    bootstrapped: false, // will act as "loading" until verified, or we can rely on local data
    accessToken: localStorage.getItem("accessToken") || null,
};
// Try to restore session
export const initSession = createAsyncThunk("auth/initSession", async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        // If we already have a token from localStorage, verify it via /auth/me (or similar)
        // For now, we stick to the existing /auth/refresh logic to rotate/verify the httpOnly cookie.
        // If /auth/refresh works, it gives us a fresh token.
        const { data } = await api.post("/auth/refresh");
        return {
            user: (data && (data.user ?? data?.data?.user)) || null,
            accessToken: (data && (data.accessToken ?? data?.data?.accessToken)) || null,
        };
    }
    catch (e) {
        // If refresh fails (e.g. no cookie), but we have a token in localStorage,
        // we could try to verify that token instead. 
        // But usually, if refresh fails, session is dead.
        // However, to prevent "logout on refresh" if cookie is blocked but token is valid:
        const state = getState();
        if (state.auth.accessToken) {
            // Optionally: return existing state if we want to "trust" the local token until 401
            // return { user: state.auth.user, accessToken: state.auth.accessToken };
        }
        return rejectWithValue(null);
    }
});
export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/login", payload);
        const user = (data && (data.user ?? data?.data?.user)) || null;
        const token = (data && (data.accessToken ?? data?.data?.accessToken)) || null;
        // Persist
        if (user)
            localStorage.setItem("user", JSON.stringify(user));
        if (token)
            localStorage.setItem("accessToken", token);
        return { user, accessToken: token };
    }
    catch (e) {
        return rejectWithValue(e?.response?.data?.message || "Login failed");
    }
});
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
        setUser(state, action) {
            state.user = action.payload;
            if (action.payload)
                localStorage.setItem("user", JSON.stringify(action.payload));
            else
                localStorage.removeItem("user");
        },
        setAccessToken(state, action) {
            state.accessToken = action.payload;
            if (action.payload)
                localStorage.setItem("accessToken", action.payload);
            else
                localStorage.removeItem("accessToken");
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
            if (u)
                localStorage.setItem("user", JSON.stringify(u));
            if (t)
                localStorage.setItem("accessToken", t);
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
