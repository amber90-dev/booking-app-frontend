import { useState, useEffect } from "react";
import {
  CalendarCheck,
  Users,
  Briefcase,
  Car,
  LineChart as LineChartIcon
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    bookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    monthlyCompleted: 0,
    contacts: 0,
    clients: 0,
    drivers: 0,
    vehicles: 0,
    monthlyTotal: 0,
    totalRevenue: 0,
    driverTotal: 0,
    totalCommission: 0,
  });
  const [chartData, setChartData] = useState<{ name: string, total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bkRes, ctRes, clRes, drRes, vhRes] = await Promise.allSettled([
          api.get('/bookings', { params: { limit: 10000 } }), // Fetch all to calculate totals
          api.get('/contacts', { params: { limit: 1 } }),
          api.get('/clients', { params: { limit: 1 } }),
          api.get('/drivers', { params: { limit: 1 } }),
          api.get('/vehicles', { params: { limit: 1 } }),
        ]);

        const contactsCount = ctRes.status === 'fulfilled' ? (ctRes.value.data.total ?? ctRes.value.data.items?.length ?? 0) : 0;
        const clientsCount = clRes.status === 'fulfilled' ? (clRes.value.data.total ?? clRes.value.data.items?.length ?? 0) : 0;
        const driversCount = drRes.status === 'fulfilled' ? (drRes.value.data.total ?? drRes.value.data.items?.length ?? 0) : 0;
        const vehiclesCount = vhRes.status === 'fulfilled' ? (vhRes.value.data.total ?? vhRes.value.data.items?.length ?? 0) : 0;

        let bookingsCount = 0;
        let completed = 0;
        let pending = 0;
        let cancelledBookings = 0;
        let monthlyCompleted = 0;
        let currentMonthTotal = 0;
        let totalRevenue = 0;
        let driverTotal = 0;
        const monthlyMap = new Map<number, number>();

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();

        // Initialize chart data with 0 for all 12 months
        for (let i = 0; i < 12; i++) {
          monthlyMap.set(i, 0);
        }

        if (bkRes.status === 'fulfilled') {
          const bookings = bkRes.value.data.items || [];
          bookingsCount = bkRes.value.data.total ?? bookings.length;

          bookings.forEach((b: any) => {
            if (b.cancelled) {
              cancelledBookings++;
            } else if (b.date) {
              const bDate = new Date(b.date);

              const rawStr = String(b.totalClient || "0").replace(/[^0-9.-]+/g,"");
              const val = parseFloat(rawStr);
              const isValidVal = !isNaN(val);

              const rawDriverStr = String(b.totalDriver || "0").replace(/[^0-9.-]+/g,"");
              const dVal = parseFloat(rawDriverStr);
              const isValidDVal = !isNaN(dVal);

              // Count completed vs pending
              if (bDate < now) {
                completed++;
                if (isValidVal) totalRevenue += val;
                if (isValidDVal) driverTotal += dVal;
                
                // Check if it's completed in the current month
                if (bDate.getFullYear() === currentYear && bDate.getMonth() === currentMonth) {
                  monthlyCompleted++;
                }
              } else {
                pending++;
              }

              if (isValidVal && bDate.getFullYear() === currentYear) {
                const m = bDate.getMonth();
                monthlyMap.set(m, (monthlyMap.get(m) || 0) + val);

                if (m === currentMonth) {
                  currentMonthTotal += val;
                }
              }
            }
          });
        }

        const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const finalChartData = Array.from(monthlyMap.entries()).map(([m, total]) => ({
          name: monthsStr[m],
          total: total
        }));

        setStats({
          bookings: bookingsCount,
          completedBookings: completed,
          pendingBookings: pending,
          cancelledBookings: cancelledBookings,
          monthlyCompleted: monthlyCompleted,
          contacts: contactsCount,
          clients: clientsCount,
          drivers: driversCount,
          vehicles: vehiclesCount,
          monthlyTotal: currentMonthTotal,
          totalRevenue: totalRevenue,
          driverTotal: driverTotal,
          totalCommission: totalRevenue - driverTotal,
        });
        setChartData(finalChartData);

      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* 5 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="All Bookings"
          value={loading ? "..." : stats.bookings.toString()}
          icon={<CalendarCheck className="text-blue-600" />}
        />
        <StatCard
          title="Contacts"
          value={loading ? "..." : stats.contacts.toString()}
          icon={<Users className="text-indigo-600" />}
        />
        <StatCard
          title="Clients"
          value={loading ? "..." : stats.clients.toString()}
          icon={<Briefcase className="text-teal-600" />}
        />
        <StatCard
          title="Drivers"
          value={loading ? "..." : stats.drivers.toString()}
          icon={<Users className="text-orange-600" />}
        />
        <StatCard
          title="Vehicles"
          value={loading ? "..." : stats.vehicles.toString()}
          icon={<Car className="text-rose-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        {/* Graph Section */}
        <div className="card p-5 shadow-sm border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-brand-500" />
              Monthly Total Overview ({new Date().getFullYear()})
            </h3>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `£${val}`} />
                <Tooltip
                  formatter={(value: any) => {
                    const num = Number(value);
                    return [`£${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Total'];
                  }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-4 flex flex-col justify-between shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {title}
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}
