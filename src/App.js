import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { initSession } from "./features/auth/authSlice";
export default function App() {
    const dispatch = useDispatch();
    const bootstrapped = useSelector((s) => s.auth.bootstrapped);
    useEffect(() => {
        dispatch(initSession());
    }, [dispatch]);
    if (!bootstrapped) {
        return (_jsx("div", { className: "h-screen grid place-items-center text-slate-500", children: "Loading\u2026" }));
    }
    // v7: remove the future prop completely
    return _jsx(RouterProvider, { router: router });
}
