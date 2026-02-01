import { jsx as _jsx } from "react/jsx-runtime";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children, }) {
    const { user, bootstrapped } = useSelector((s) => s.auth);
    if (!bootstrapped) {
        return (_jsx("div", { className: "h-screen grid place-items-center text-slate-500", children: "Loading\u2026" }));
    }
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return children;
}
