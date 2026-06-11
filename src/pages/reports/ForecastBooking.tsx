import { useEffect, useState, useMemo, useRef } from "react";
import { Download, Printer, CalendarIcon } from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type BookingRow = {
  id: string;
  date: string | null;
  time: string | null;
  bookingRef: string | null;
  clientForename: string | null;
  clientSurname: string | null;
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB');
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    if (timeStr.includes('T')) {
       const d = new Date(timeStr);
       if (!isNaN(d.getTime())) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return timeStr;
  };

  const exportCSV = () => {
    if (!filteredRows.length) {
      toastError("No data to export");
      return;
    }

    const headers = [
      "Date", "Time", "Ref", "Client Name", "Pick Up", "Drop Off", "Driver No", "Vehicle", "Quote"
    ];

    const escapeCSV = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = filteredRows.map(r => [
      escapeCSV(formatDate(r.date)),
      escapeCSV(formatTime(r.time)),
      escapeCSV(r.bookingRef),
      escapeCSV(`${r.clientForename || ""} ${r.clientSurname || ""}`.trim() || "-"),
      escapeCSV(r.pickUpAddress),
      escapeCSV(r.dropOffAddress),
      escapeCSV(r.driverNo),
      escapeCSV(r.vehicle),
      escapeCSV(r.totalClient ? parseFloat(r.totalClient).toFixed(2) : "0.00")
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `forecast_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-2 print:hidden">Forecast Booking</h2>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-end justify-between gap-4 bg-white rounded-lg shadow-sm border border-slate-200 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <UKDateFilter label="From Date" value={startDate} onChange={setStartDate} />
          <UKDateFilter label="To Date" value={endDate} onChange={setEndDate} />
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => window.print()} 
            className="btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            title="Print Report"
          >
            <Printer size={18} className="mr-2 inline" /> Print
          </button>
          <button 
            type="button" 
            onClick={exportCSV} 
            className="btn bg-indigo-600 text-white hover:bg-indigo-700"
            title="Export CSV"
          >
            <Download size={18} className="mr-2 inline" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Ref</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Pickup</th>
              <th className="px-4 py-3 text-left">Dropoff</th>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-right">Quote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={9} className="p-4 text-center">Loading...</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={9} className="p-4 text-center text-slate-500">No bookings in this range</td></tr>
            ) : (
              filteredRows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="px-4 py-2 text-slate-500 text-xs whitespace-nowrap">{formatTime(r.time)}</td>
                  <td className="px-4 py-2 font-mono text-xs">{r.bookingRef}</td>
                  <td className="px-4 py-2 font-medium">
                    {(`${r.clientForename || ""} ${r.clientSurname || ""}`).trim() || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-normal break-words min-w-[150px]" title={r.pickUpAddress ?? undefined}>
                    {r.pickUpAddress && r.pickUpAddress.length > 30 ? r.pickUpAddress.substring(0, 30) + '...' : (r.pickUpAddress || "-")}
                  </td>
                  <td className="px-4 py-2 whitespace-normal break-words min-w-[150px]" title={r.dropOffAddress ?? undefined}>
                    {r.dropOffAddress && r.dropOffAddress.length > 30 ? r.dropOffAddress.substring(0, 30) + '...' : (r.dropOffAddress || "-")}
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

function UKDateFilter({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div 
        className="input w-40 flex items-center justify-between bg-white text-slate-700 cursor-pointer relative"
        onClick={() => inputRef.current?.showPicker()}
      >
        <span>{value ? new Date(value).toLocaleDateString('en-GB') : "DD/MM/YYYY"}</span>
        <CalendarIcon size={16} className="text-slate-400" />
        <input 
          ref={inputRef}
          type="date" 
          className="absolute w-0 h-0 opacity-0" 
          style={{ bottom: 0, left: 0 }}
          value={value} 
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
