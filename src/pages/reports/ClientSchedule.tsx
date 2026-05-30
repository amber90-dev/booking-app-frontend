import { useEffect, useState, useMemo, useRef } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
import { Download, Printer, CalendarIcon } from "lucide-react";

type Booking = {
  id: string;
  bookingRef: string | null;
  accountNo: string | null;
  companyName: string | null;
  
  // Passenger
  clientId: string | null;
  clientForename: string | null;
  clientSurname: string | null;
  
  // Trip
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:mm
  pickUpAddress: string | null;
  dropOffAddress: string | null;
  vehicle: string | null;
  
  // Driver
  driverNo: string | null;
  driverForename: string | null;
  driverSurname: string | null;
  
  // Driver Financials
  driverScheduledFare: string | null;
  driverCharge: string | null;
  driverMeetGreet: string | null;
  driverWaitingTime: string | null;
  driverWaitingTimePrice: string | null;
  driverLhrGtwCharge: string | null;
  driverViaPrice: string | null;
  driverGratuity: string | null;
  totalDriver: string | null;

  // Client Financials
  clientScheduledFare: string | null;
  clientCharge: string | null;
  clientMeetGreet: string | null;
  clientWaitingTime: string | null;
  clientWaitingTimePrice: string | null;
  clientLhrGtwCharge: string | null;
  clientViaPrice: string | null;
  clientGratuity: string | null;
  totalClient: string | null;
};

type ClientOption = {
  id: string;
  name: string;
};

type CompanyOption = {
  id: string;
  name: string;
};

export default function ClientSchedule() {
  const { error: toastError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const selectedClient = useMemo(() => 
    clients.find(d => d.id === selectedClientId), 
  [clients, selectedClientId]);

  const selectedCompany = useMemo(() => 
    companies.find(c => c.id === selectedCompanyId), 
  [companies, selectedCompanyId]);

  useEffect(() => {
    fetchClients();
    fetchCompanies();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchClients() {
    try {
      const { data } = await api.get("/clients", { params: { limit: 1000 } });
      const items = data.items || [];
      setClients(items.map((c: any) => ({
        id: String(c.id),
        name: c.companyName || `${c.forename} ${c.surname}`.trim() || c.id
      })));
    } catch (e) {
      console.error("Failed to load clients", e);
    }
  }

  async function fetchCompanies() {
    try {
      const { data } = await api.get("/companies", { params: { limit: 1000 } });
      const items = data.items || [];
      setCompanies(items.map((c: any) => ({
        id: String(c.accountNo || c.id),
        name: c.companyName || c.name || String(c.id)
      })));
    } catch (e) {
      console.error("Failed to load companies", e);
    }
  }

  async function fetchBookings() {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings", { params: { limit: 2000 } }); 
      setBookings(data.items);
    } catch (e: any) {
      toastError(e?.response?.data?.message || e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = useMemo(() => {
    return bookings.filter(b => {
      // Date Filter
      if (startDate && (!b.date || b.date < startDate)) return false;
      if (endDate && (!b.date || b.date > endDate)) return false;

      // Client Filter
      if (selectedClientId) {
        if (b.clientId !== selectedClientId) return false; 
      }

      // Company Filter
      if (selectedCompanyId) {
        if (b.accountNo !== selectedCompanyId) return false;
      }

      return true;
    });
  }, [bookings, startDate, endDate, selectedClientId, selectedCompanyId]);

  // Calculate Totals for Footer
  const totals = useMemo(() => {
    return filteredRows.reduce((acc, row) => {
      acc.waitingPrice += parseFloat(row.clientWaitingTimePrice || "0");
      acc.ulez += parseFloat(row.clientLhrGtwCharge || "0"); // Mapping ULEZ/Site
      acc.cc += parseFloat(row.clientCharge || "0");         // Mapping C.C to C Charge
      acc.toll += parseFloat(row.clientViaPrice || "0");     // Mapping Toll to Via Price
      acc.meetGreet += parseFloat(row.clientMeetGreet || "0");
      acc.fare += parseFloat(row.clientScheduledFare || "0");
      acc.total += parseFloat(row.totalClient || "0");
      return acc;
    }, { waitingPrice: 0, ulez: 0, cc: 0, toll: 0, meetGreet: 0, fare: 0, total: 0 });
  }, [filteredRows]);

  const fmtMoney = (val: string | number | null) => {
    if (val === null || val === undefined) return "0.00";
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

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
      "Booking Ref", "Acc No", "Driver Name", "Client Name", "Date", "Time", "Veh", 
      "Pick Up Address", "Drop Off Address", "Company Name", "Waiting Time", "W/T Price", 
      "Drop Off charge", "C.C", "Via Price", "M and G", "Scheduled Fare", "Total Pay"
    ];

    const escapeCSV = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = filteredRows.map(r => [
      escapeCSV(r.bookingRef),
      escapeCSV(r.accountNo),
      escapeCSV(`${r.driverForename || ""} ${r.driverSurname || ""}`.trim() || "-"),
      escapeCSV(`${r.clientForename || ""} ${r.clientSurname || ""}`.trim() || "-"),
      escapeCSV(r.date),
      escapeCSV(r.time),
      escapeCSV(r.vehicle),
      escapeCSV(r.pickUpAddress),
      escapeCSV(r.dropOffAddress),
      escapeCSV(r.companyName),
      escapeCSV(r.clientWaitingTime),
      escapeCSV(fmtMoney(r.clientWaitingTimePrice)),
      escapeCSV(fmtMoney(r.clientLhrGtwCharge)),
      escapeCSV(fmtMoney(r.clientCharge)),
      escapeCSV(fmtMoney(r.clientViaPrice)),
      escapeCSV(fmtMoney(r.clientMeetGreet)),
      escapeCSV(fmtMoney(r.clientScheduledFare)),
      escapeCSV(fmtMoney(r.totalClient))
    ].join(","));

    const totalsRow = [
      escapeCSV("TOTALS"), "","","","","","","","","",
      "", 
      escapeCSV(fmtMoney(totals.waitingPrice)),
      escapeCSV(fmtMoney(totals.ulez)),
      escapeCSV(fmtMoney(totals.cc)),
      escapeCSV(fmtMoney(totals.toll)),
      escapeCSV(fmtMoney(totals.meetGreet)),
      escapeCSV(fmtMoney(totals.fare)),
      escapeCSV(fmtMoney(totals.total))
    ].join(",");

    const csvContent = [headers.join(","), ...rows, totalsRow].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `client_schedule_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Controls (Hidden when printing potentially, or keep for UI) */}
      <div className="card p-4 flex flex-wrap items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200 print:hidden">
        <div className="w-64">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
          <select 
            className="input w-full"
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
          >
            <option value="">-- All Clients --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Company</label>
          <select 
            className="input w-full"
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
          >
            <option value="">-- All Companies --</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <UKDateFilter 
          label="Start Date" 
          value={startDate} 
          onChange={setStartDate} 
        />
        <UKDateFilter 
          label="End Date" 
          value={endDate} 
          onChange={setEndDate} 
        />
        <div className="ml-auto flex items-center gap-2">
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

      {/* Report Container */}
      <div className="card bg-white p-8 print:shadow-none print:p-0 text-slate-900 text-xs">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="w-1/3 space-y-4">
              <div className="flex gap-2">
                <span className="font-semibold w-16 text-slate-700">Date:</span>
                <span>{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            <div className="w-1/3 text-right space-y-1">
               <div className="flex justify-end gap-2">
                <span className="font-semibold text-slate-700">Ref No</span>
                <span>01</span>
              </div>
               <div className="flex justify-end gap-2 mt-12">
                <span className="font-semibold text-slate-700">Date Payable</span>
                <span>
                   {selectedClient ? new Date().toLocaleDateString('en-GB') : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="border border-slate-200 px-2 py-1.5 text-left w-12">Booking Ref</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-8">Acc No</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left">Driver Name</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left">Client Name</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-16">Date / Time</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-8">Veh</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left w-32">Pick Up Address</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left w-32">Drop Off Address</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left">Company Name</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-10">Waiting Time</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-10">W/T Price</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">Drop Off charge</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">C.C</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">Via Price</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">M and G</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">Scheduled Fare</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">Total Pay</th>
              </tr>
            </thead>
            <tbody>
               {loading ? (
                 <tr><td colSpan={17} className="p-4 text-center text-slate-500">Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                 <tr><td colSpan={17} className="p-8 text-center text-slate-400 italic">No records found. Select a client and date range.</td></tr>
              ) : (
                filteredRows.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50 even:bg-slate-50/50">
                    <td className="border border-slate-200 px-2 py-1 text-center font-mono text-slate-500">{r.bookingRef || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center">{r.accountNo || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1">{`${r.driverForename || ""} ${r.driverSurname || ""}`.trim() || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1">{`${r.clientForename || ""} ${r.clientSurname || ""}`.trim() || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center whitespace-nowrap">
                      <div>{formatDate(r.date)}</div>
                      <div className="text-[10px] text-slate-500">{formatTime(r.time)}</div>
                    </td>
                    <td className="border border-slate-200 px-2 py-1 text-center">{r.vehicle || "Car"}</td>
                    <td className="border border-slate-200 px-2 py-1 truncate max-w-[150px]" title={r.pickUpAddress || ""}>{r.pickUpAddress}</td>
                    <td className="border border-slate-200 px-2 py-1 truncate max-w-[150px]" title={r.dropOffAddress || ""}>{r.dropOffAddress}</td>
                    <td className="border border-slate-200 px-2 py-1 truncate max-w-[100px]" title={r.companyName || ""}>{r.companyName || "-"}</td>
                    
                    {/* Financials */}
                    <td className="border border-slate-200 px-2 py-1 text-center text-slate-500">{r.clientWaitingTime || "0"}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.clientWaitingTimePrice)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.clientLhrGtwCharge)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.clientCharge)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.clientViaPrice)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.clientMeetGreet)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.clientScheduledFare)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right font-semibold text-emerald-700 bg-emerald-50/50">{fmtMoney(r.totalClient)}</td>
                  </tr>
                ))
              )}
              
              {/* Totals Row */}
               <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={9} className="border border-slate-200 px-2 py-2 text-right text-slate-600 uppercase text-[9px] tracking-wider">Totals</td>
                  <td className="border border-slate-200 px-2 py-2"></td>
                  <td className="border border-slate-200 px-2 py-2 text-right">{fmtMoney(totals.waitingPrice)}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">{fmtMoney(totals.ulez)}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">{fmtMoney(totals.cc)}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">{fmtMoney(totals.toll)}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">{fmtMoney(totals.meetGreet)}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">{fmtMoney(totals.fare)}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right text-emerald-700">{fmtMoney(totals.total)}</td>
               </tr>

            </tbody>
          </table>
        </div>
      

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
