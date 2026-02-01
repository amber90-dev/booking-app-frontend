import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api/axios";
import { logoutSlice } from "../features/auth/authSlice";
import {
  LayoutDashboard,
  Users,
  Handshake,
  LogOut,
  CalendarIcon,
  Contact2,
  Building2,
  Car,
  UserRound,
  Badge,
  Landmark,
} from "lucide-react";
import Avatar from "./Avatar";

export default function Shell() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const doLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      dispatch(logoutSlice());
      nav("/login");
    }
  };

  return (
    // Fix overall layout to viewport height so columns don't stretch with content
    <div className="h-screen grid" style={{ gridTemplateColumns: "240px 1fr" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        {/* Header (fixed) */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200 shrink-0">
          <div className="h-8 w-8 rounded bg-slate-900 mr-2" />
          <div className="font-semibold">RoadServe</div>
        </div>

        {/* Scrollable nav area */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          <NavItem
            to="/"
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
          />
          <NavItem
            to="/bookings"
            label="Bookings"
            icon={<CalendarIcon size={18} />}
          />
          <NavItem
            to="/companies"
            label="Companies"
            icon={<Building2 size={18} />}
          />
          <NavItem to="/contacts" label="Contacts" icon={<Users size={18} />} />
          <NavItem
            to="/clients"
            label="Clients"
            icon={<Contact2 size={18} />}
          />
          <NavItem
            to="/drivers"
            label="Drivers"
            icon={<UserRound size={18} />}
          />
          <NavItem to="/vehicles" label="Vehicles" icon={<Car size={18} />} />
          <NavItem to="/staff" label="Staff" icon={<Badge size={18} />} />
          
          <div className="pt-4 pb-1 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reports</div>
          <NavItem to="/reports/monthly" label="Monthly Total" icon={<Landmark size={18} />} />
          <NavItem to="/reports/driver-schedule" label="Driver Schedule" icon={<Handshake size={18} />} />
          <NavItem to="/reports/forecast" label="Forecast" icon={<CalendarIcon size={18} />} />
        </nav>

        {/* Sticky footer pinned to bottom of the sidebar viewport */}
        <div className="p-3 border-t border-slate-200 sticky bottom-0 bg-white">
          <button
            onClick={doLogout}
            className="w-full flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <LogOut size={16} /> Logout
          </button>
          <div className="text-xs text-slate-500 mt-3 px-1">
            Signed in as <b>{user?.username ?? "—"}</b>
          </div>
        </div>
      </aside>

      {/* Main column: header fixed, content scrolls independently */}
      <div className="flex flex-col min-h-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
          <h1 className="text-lg font-semibold"></h1>
          <div className="flex items-center gap-3">
            <Avatar name={user?.username || "User"} />
          </div>
        </header>

        {/* Make main area scrollable, not the whole page */}
        <main className="p-4 md:p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-700 hover:bg-slate-50"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
