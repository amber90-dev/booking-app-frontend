import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type ReportRow = {
  id: string;
  date: string | null;
  time: string | null;
  bookingRef: string | null;
  driverNo: string | null;
  pickUpAddress: string | null;
  dropOffAddress: string | null;
  via: string | null;
  
  // Breakdown
  clientScheduledFare: string | null;
  clientWaitingPrice: string | null;
  clientViaPrice: string | null;
  clientGratuity: string | null;
  totalClient: string | null;
  
  driverScheduledFare: string | null;
  driverWaitingPrice: string | null;
  driverViaPrice: string | null;
  driverGratuity: string | null;
  totalDriver: string | null;
};

export default function DriverSchedule() {
  const { error: toastError } = useToast();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Date Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
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
      <h2 className="text-xl font-bold">Driver Job Schedule</h2>

      <div className="card p-4 flex items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input 
            type="date" 
            className="input w-40 border p-2 rounded" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input 
            type="date" 
            className="input w-40 border p-2 rounded" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-3 py-2 text-left">Date/Time</th>
              <th className="px-3 py-2 text-left">Booking</th>
              <th className="px-3 py-2 text-left">Route</th>
              <th className="px-3 py-2 text-left bg-blue-50">Client Breakdown</th>
              <th className="px-3 py-2 text-right bg-blue-50">Total Client</th>
              <th className="px-3 py-2 text-left bg-amber-50">Driver Breakdown</th>
              <th className="px-3 py-2 text-right bg-amber-50">Total Driver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">No jobs in range</td></tr>
            ) : (
              filteredRows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div>{r.date}</div>
                    <div className="text-slate-500">{r.time}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-mono">{r.bookingRef}</div>
                    <div className="text-slate-500">Dr: {r.driverNo || "-"}</div>
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate">
                    <div title={r.pickUpAddress || ""}>From: {r.pickUpAddress}</div>
                    <div title={r.dropOffAddress || ""}>To: {r.dropOffAddress}</div>
                    {r.via && <div className="text-slate-500 text-[10px]" title={r.via}>Via: {r.via}</div>}
                  </td>
                  <td className="px-3 py-2 bg-blue-50/30">
                     <div className="grid grid-cols-2 gap-x-2">
                        <span>Fare: {r.clientScheduledFare}</span>
                        <span>Via: {r.clientViaPrice}</span>
                        <span>Grat: {r.clientGratuity}</span>
                        <span>Wait: {r.clientWaitingPrice}</span>
                     </div>
                  </td>
                  <td className="px-3 py-2 text-right font-bold bg-blue-50/50">
                    £{r.totalClient}
                  </td>
                  <td className="px-3 py-2 bg-amber-50/30">
                    <div className="grid grid-cols-2 gap-x-2">
                        <span>Fare: {r.driverScheduledFare}</span>
                        <span>Via: {r.driverViaPrice}</span>
                         <span>Grat: {r.driverGratuity}</span>
                        <span>Wait: {r.driverWaitingPrice}</span>
                     </div>
                  </td>
                  <td className="px-3 py-2 text-right font-bold bg-amber-50/50">
                    £{r.totalDriver}
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
