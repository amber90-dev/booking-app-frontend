import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Shell from "../components/Shell";
// pages
import LoginPage from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import BookingsList from "../pages/bookings/BookingsList";
import BookingForm from "../pages/bookings/BookingForm";
import ClientsList from "../pages/clients/ClientsList";
import ClientForm from "../pages/clients/ClientForm";
import CompaniesList from "../pages/companies/CompaniesList";
import CompanyForm from "../pages/companies/CompanyForm";
import VehiclesList from "../pages/vehicles/VehiclesList";
import VehicleForm from "../pages/vehicles/VehicleForm";
import DriversList from "../pages/drivers/DriversList";
import DriverForm from "../pages/drivers/DriverForm";
import ContactsList from "../pages/contacts/ContactsList";
import ContactForm from "../pages/contacts/ContactForm";
import StaffList from "../pages/staff/StaffList";
import StaffForm from "../pages/staff/StaffForm";
import MonthlyTotal from "../pages/reports/MonthlyTotal";
import DriverSchedule from "../pages/reports/DriverSchedule";
import ForecastBooking from "../pages/reports/ForecastBooking";
function RouteError() {
    // keeps you from seeing a blank screen if something throws in a route
    return (_jsx("div", { className: "h-screen grid place-items-center text-slate-600", children: _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: "Something went wrong" }), _jsx("div", { className: "text-sm text-slate-500", children: "Check console for details." })] }) }));
}
export const router = createBrowserRouter([
    { path: "/login", element: _jsx(LoginPage, {}), errorElement: _jsx(RouteError, {}) },
    {
        element: (_jsx(ProtectedRoute, { children: _jsx(Shell, {}) })),
        errorElement: _jsx(RouteError, {}),
        children: [
            { index: true, element: _jsx(Dashboard, {}) },
            // Bookings
            { path: "bookings", element: _jsx(BookingsList, {}) },
            { path: "bookings/new", element: _jsx(BookingForm, {}) },
            { path: "bookings/:id", element: _jsx(BookingForm, {}) },
            // Clients
            { path: "clients", element: _jsx(ClientsList, {}) },
            { path: "clients/new", element: _jsx(ClientForm, {}) },
            { path: "clients/:id", element: _jsx(ClientForm, {}) },
            // Companies
            { path: "companies", element: _jsx(CompaniesList, {}) },
            { path: "companies/new", element: _jsx(CompanyForm, {}) },
            { path: "companies/:id", element: _jsx(CompanyForm, {}) },
            // Vehicles
            { path: "vehicles", element: _jsx(VehiclesList, {}) },
            { path: "vehicles/new", element: _jsx(VehicleForm, {}) },
            { path: "vehicles/:id", element: _jsx(VehicleForm, {}) },
            // Drivers
            { path: "drivers", element: _jsx(DriversList, {}) },
            { path: "drivers/new", element: _jsx(DriverForm, {}) },
            { path: "drivers/:id", element: _jsx(DriverForm, {}) },
            // Contacts
            { path: "contacts", element: _jsx(ContactsList, {}) },
            { path: "contacts/new", element: _jsx(ContactForm, {}) },
            { path: "contacts/:id", element: _jsx(ContactForm, {}) },
            // Staff
            { path: "staff", element: _jsx(StaffList, {}) },
            { path: "staff/new", element: _jsx(StaffForm, {}) },
            { path: "staff/:id", element: _jsx(StaffForm, {}) },
            // Reports
            { path: "reports/monthly", element: _jsx(MonthlyTotal, {}) },
            { path: "reports/driver-schedule", element: _jsx(DriverSchedule, {}) },
            { path: "reports/forecast", element: _jsx(ForecastBooking, {}) },
            // 404
            { path: "*", element: _jsx("div", { className: "p-6", children: "Not Found" }) },
        ],
    },
]
// optional: basename if you deploy under a subpath
);
