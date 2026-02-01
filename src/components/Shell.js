import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axios";
import { logoutSlice } from "../features/auth/authSlice";
import { LayoutDashboard, Users, Handshake, LogOut, CalendarIcon, Contact2, Building2, Car, UserRound, Badge, Landmark, } from "lucide-react";
import Avatar from "./Avatar";
export default function Shell() {
    const user = useSelector((s) => s.auth.user);
    const dispatch = useDispatch();
    const nav = useNavigate();
    const doLogout = async () => {
        try {
            await api.post("/auth/logout");
        }
        finally {
            dispatch(logoutSlice());
            nav("/login");
        }
    };
    return (
    // Fix overall layout to viewport height so columns don't stretch with content
    _jsxs("div", { className: "h-screen grid", style: { gridTemplateColumns: "240px 1fr" }, children: [_jsxs("aside", { className: "hidden md:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen", children: [_jsxs("div", { className: "h-16 flex items-center px-4 border-b border-slate-200 shrink-0", children: [_jsx("div", { className: "h-8 w-8 rounded bg-slate-900 mr-2" }), _jsx("div", { className: "font-semibold", children: "RoadServe" })] }), _jsxs("nav", { className: "p-3 space-y-1 overflow-y-auto flex-1", children: [_jsx(NavItem, { to: "/", label: "Dashboard", icon: _jsx(LayoutDashboard, { size: 18 }) }), _jsx(NavItem, { to: "/bookings", label: "Bookings", icon: _jsx(CalendarIcon, { size: 18 }) }), _jsx(NavItem, { to: "/companies", label: "Companies", icon: _jsx(Building2, { size: 18 }) }), _jsx(NavItem, { to: "/contacts", label: "Contacts", icon: _jsx(Users, { size: 18 }) }), _jsx(NavItem, { to: "/clients", label: "Clients", icon: _jsx(Contact2, { size: 18 }) }), _jsx(NavItem, { to: "/drivers", label: "Drivers", icon: _jsx(UserRound, { size: 18 }) }), _jsx(NavItem, { to: "/vehicles", label: "Vehicles", icon: _jsx(Car, { size: 18 }) }), _jsx(NavItem, { to: "/staff", label: "Staff", icon: _jsx(Badge, { size: 18 }) }), _jsx("div", { className: "pt-4 pb-1 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "Reports" }), _jsx(NavItem, { to: "/reports/monthly", label: "Monthly Total", icon: _jsx(Landmark, { size: 18 }) }), _jsx(NavItem, { to: "/reports/driver-schedule", label: "Driver Schedule", icon: _jsx(Handshake, { size: 18 }) }), _jsx(NavItem, { to: "/reports/forecast", label: "Forecast", icon: _jsx(CalendarIcon, { size: 18 }) })] }), _jsxs("div", { className: "p-3 border-t border-slate-200 sticky bottom-0 bg-white", children: [_jsxs("button", { onClick: doLogout, className: "w-full flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50", children: [_jsx(LogOut, { size: 16 }), " Logout"] }), _jsxs("div", { className: "text-xs text-slate-500 mt-3 px-1", children: ["Signed in as ", _jsx("b", { children: user?.username ?? "—" })] })] })] }), _jsxs("div", { className: "flex flex-col min-h-0", children: [_jsxs("header", { className: "h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0", children: [_jsx("h1", { className: "text-lg font-semibold" }), _jsx("div", { className: "flex items-center gap-3", children: _jsx(Avatar, { name: user?.username || "User" }) })] }), _jsx("main", { className: "p-4 md:p-6 overflow-y-auto flex-1", children: _jsx(Outlet, {}) })] })] }));
}
function NavItem({ to, label, icon, }) {
    return (_jsxs(NavLink, { to: to, end: true, className: ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-700 hover:bg-slate-50"}`, children: [icon, _jsx("span", { children: label })] }));
}
