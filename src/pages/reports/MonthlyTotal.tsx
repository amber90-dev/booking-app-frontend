import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type ReportRow = {
  id: string;
  totalClient: string | null;
  totalDriver: string | null;
  clientViaPrice: string | null;
  clientGratuity: string | null;
  // Add other fields if needed for display
  date: string | null;
  bookingRef: string | null;
};

export default function MonthlyTotal() {
  const { error: toastError } = useToast();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetching all bookings for now. In a real app, might want a specific report endpoint or date range.
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
      const val = parseFloat(r.totalClient || "0");
      if (minPrice !== "" && val < minPrice) return false;
      if (maxPrice !== "" && val > maxPrice) return false;
      return true;
    });
  }, [rows, minPrice, maxPrice]);

  const stats = useMemo(() => {
    let jobTotal = 0;
    let driverTotal = 0;
    
    filteredRows.forEach(r => {
      jobTotal += parseFloat(r.totalClient || "0");
      driverTotal += parseFloat(r.totalDriver || "0");
    });

    const commission = jobTotal - driverTotal;

    return {
      jobTotal: jobTotal.toFixed(2),
      driverTotal: driverTotal.toFixed(2),
      commission: commission.toFixed(2)
    };
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Monthly Total Report</h2>

      {/* Filters */}
      <div className="card p-4 flex items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Min Income</label>
          <input 
            type="number" 
            className="input w-32 border p-2 rounded" 
            value={minPrice} 
            onChange={e => setMinPrice(e.target.value ? parseFloat(e.target.value) : "")}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max Income</label>
          <input 
            type="number" 
            className="input w-32 border p-2 rounded" 
            value={maxPrice} 
            onChange={e => setMaxPrice(e.target.value ? parseFloat(e.target.value) : "")}
            placeholder="Max"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="text-sm text-blue-600 font-medium uppercase">Job Total (Client)</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">£{stats.jobTotal}</div>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="text-sm text-amber-600 font-medium uppercase">Driver Total</div>
          <div className="text-3xl font-bold text-amber-900 mt-2">£{stats.driverTotal}</div>
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="text-sm text-emerald-600 font-medium uppercase">Commission</div>
          <div className="text-3xl font-bold text-emerald-900 mt-2">£{stats.commission}</div>
        </div>
      </div>

      {/* Table Detail */}
      <div className="card overflow-hidden border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Ref</th>
              <th className="px-4 py-3 text-right">Job Total</th>
              <th className="px-4 py-3 text-right">Driver Total</th>
              <th className="px-4 py-3 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">No data found in range</td></tr>
            ) : (
              filteredRows.map(r => {
                 const jt = parseFloat(r.totalClient || "0");
                 const dt = parseFloat(r.totalDriver || "0");
                 return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">{r.date}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.bookingRef}</td>
                    <td className="px-4 py-2 text-right">£{jt.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">£{dt.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-medium">£{(jt - dt).toFixed(2)}</td>
                  </tr>
                 );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
