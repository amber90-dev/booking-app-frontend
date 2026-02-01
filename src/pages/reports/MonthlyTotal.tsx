import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type ReportRow = {
  id: string;
  accountNo: string | null;
  companyName: string | null;
  bookingRef: string | null;
  totalClient: string | null;
  driverMobile: string | null;
  totalDriver: string | null;
  date: string | null; // YYYY-MM-DD
};

export default function MonthlyTotal() {
  const { error: toastError } = useToast();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to all records (empty strings)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetching all bookings for client-side filtering (limit increased)
      const { data } = await api.get("/bookings", { params: { limit: 2000 } }); 
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
      // If start date is set, check it
      if (startDate && r.date < startDate) return false;
      // If end date is set, check it
      if (endDate && r.date > endDate) return false;
      
      return true;
    });
  }, [rows, startDate, endDate]);

  const stats = useMemo(() => {
    let jobTotal = 0;
    let driverTotal = 0;
    
    filteredRows.forEach(r => {
      jobTotal += parseFloat(r.totalClient || "0");
      driverTotal += parseFloat(r.totalDriver || "0");
    });

    const commission = jobTotal - driverTotal;

    return {
      count: filteredRows.length,
      jobTotal,
      driverTotal,
      commission
    };
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Monthly Total</h2>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <label className="text-sm font-medium text-slate-700">From</label>
             <input 
              type="date" 
              className="input w-40"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
           </div>
           <div className="flex items-center gap-2">
             <label className="text-sm font-medium text-slate-700">To</label>
             <input 
              type="date" 
              className="input w-40"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
           </div>
        </div>
      </div>
      
      <div className="card p-0 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Account No</th>
              <th className="px-4 py-3 text-left">Company Name</th>
              <th className="px-4 py-3 text-left">Ref</th>
              <th className="px-4 py-3 text-right">Job Total</th>
              <th className="px-4 py-3 text-left">Driver No</th>
              <th className="px-4 py-3 text-right">Driver Total</th>
              <th className="px-4 py-3 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">No jobs found in this range</td></tr>
            ) : (
              filteredRows.map((r) => {
                 const jt = parseFloat(r.totalClient || "0");
                 const dt = parseFloat(r.totalDriver || "0");
                 const comm = jt - dt;
                 return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">{r.accountNo || "-"}</td>
                    <td className="px-4 py-2 truncate max-w-[200px]" title={r.companyName || ""}>{r.companyName || "-"}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.bookingRef || "-"}</td>
                    <td className="px-4 py-2 text-right">{jt !== 0 ? `£${jt.toFixed(2)}` : "£0.00"}</td>
                    <td className="px-4 py-2">{r.driverMobile || "-"}</td>
                    <td className="px-4 py-2 text-right">{dt !== 0 ? `£${dt.toFixed(2)}` : "£0.00"}</td>
                    <td className="px-4 py-2 text-right font-medium text-emerald-700">{comm !== 0 ? `£${comm.toFixed(2)}` : "£0.00"}</td>
                  </tr>
                 );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center shadow-sm">
        <div>
           <div className="text-sm text-slate-500 mb-1">Total Jobs</div>
           <div className="text-2xl font-bold text-slate-800">{stats.count}</div>
        </div>
        <div>
           <div className="text-sm text-slate-500 mb-1">Job Total</div>
           <div className="text-2xl font-bold text-blue-600">£{stats.jobTotal.toFixed(0)}</div>
        </div>
        <div>
           <div className="text-sm text-slate-500 mb-1">Driver Total</div>
           <div className="text-2xl font-bold text-amber-600">£{stats.driverTotal.toFixed(0)}</div>
        </div>
        <div>
           <div className="text-sm text-slate-500 mb-1">Commission</div>
           <div className="text-2xl font-bold text-emerald-600">£{stats.commission.toFixed(0)}</div>
        </div>
      </div>

      </div>
  );
}
