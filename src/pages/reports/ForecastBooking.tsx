import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type BookingRow = {
  id: string;
  date: string | null;
  time: string | null;
  bookingRef: string | null;
  clientId: string | null;
  pickUpAddress: string | null;
  dropOffAddress: string | null;
  vehicle: string | null;
  totalClient: string | null;
  driverNo: string | null;
};

export default function ForecastBooking() {
  const { error: toastError } = useToast();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to today and a month out? Or just empty?
  // User asked for "Booking Range date filter"
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // In real world, pass filters to API to avoid over-fetching
      const { data } = await api.get("/bookings", { params: { limit: 1000 } });
      setRows(data.items);
    } catch (e: any) {
      toastError(e?.response?.data?.message || e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (!r.date) return false;
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });
  }, [rows, startDate, endDate]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Forecast Booking</h2>

      {/* Filters */}
      <div className="card p-4 flex items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
          <input 
            type="date" 
            className="input w-40 border p-2 rounded" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
          <input 
            type="date" 
            className="input w-40 border p-2 rounded" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Date / Time</th>
              <th className="px-4 py-3 text-left">Ref</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Pickup / Dropoff</th>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-right">Quote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">No bookings in this range</td></tr>
            ) : (
              filteredRows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="font-medium">{r.date}</div>
                    <div className="text-slate-500 text-xs">{r.time}</div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{r.bookingRef}</td>
                  <td className="px-4 py-2">{r.clientId}</td>
                  <td className="px-4 py-2 max-w-[200px] truncate">
                    <div title={r.pickUpAddress || ""}>{r.pickUpAddress}</div>
                    <div title={r.dropOffAddress || ""} className="text-slate-400">to {r.dropOffAddress}</div>
                  </td>
                  <td className="px-4 py-2">{r.driverNo || "-"}</td>
                  <td className="px-4 py-2">{r.vehicle || "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {r.totalClient ? `£${r.totalClient}` : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
