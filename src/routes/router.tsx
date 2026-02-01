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
  return (
    <div className="h-screen grid place-items-center text-slate-600">
      <div>
        <div className="text-lg font-semibold">Something went wrong</div>
        <div className="text-sm text-slate-500">Check console for details.</div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    { path: "/login", element: <LoginPage />, errorElement: <RouteError /> },

    {
      element: (
        <ProtectedRoute>
          <Shell />
        </ProtectedRoute>
      ),
      errorElement: <RouteError />,
      children: [
        { index: true, element: <Dashboard /> },

        // Bookings
        { path: "bookings", element: <BookingsList /> },
        { path: "bookings/new", element: <BookingForm /> },
        { path: "bookings/:id", element: <BookingForm /> },

        // Clients
        { path: "clients", element: <ClientsList /> },
        { path: "clients/new", element: <ClientForm /> },
        { path: "clients/:id", element: <ClientForm /> },

        // Companies
        { path: "companies", element: <CompaniesList /> },
        { path: "companies/new", element: <CompanyForm /> },
        { path: "companies/:id", element: <CompanyForm /> },

        // Vehicles
        { path: "vehicles", element: <VehiclesList /> },
        { path: "vehicles/new", element: <VehicleForm /> },
        { path: "vehicles/:id", element: <VehicleForm /> },

        // Drivers
        { path: "drivers", element: <DriversList /> },
        { path: "drivers/new", element: <DriverForm /> },
        { path: "drivers/:id", element: <DriverForm /> },

        // Contacts
        { path: "contacts", element: <ContactsList /> },
        { path: "contacts/new", element: <ContactForm /> },
        { path: "contacts/:id", element: <ContactForm /> },

        // Staff
        { path: "staff", element: <StaffList /> },
        { path: "staff/new", element: <StaffForm /> },
        { path: "staff/:id", element: <StaffForm /> },

        // Reports
        { path: "reports/monthly", element: <MonthlyTotal /> },
        { path: "reports/driver-schedule", element: <DriverSchedule /> },
        { path: "reports/forecast", element: <ForecastBooking /> },


        // 404
        { path: "*", element: <div className="p-6">Not Found</div> },
      ],
    },
  ]
  // optional: basename if you deploy under a subpath
);
