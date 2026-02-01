import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type Booking = {
  id: string;
  bookingRef: string | null;
  accountNo: string | null;
  companyName: string | null;
  
  // Passenger
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
  driverCharge: string | null;       // Generic charge (maybe for CC/Toll?)
  driverMeetGreet: string | null;
  driverWaitingTime: string | null;
  driverWaitingTimePrice: string | null;
  driverLhrGtwCharge: string | null; // ULEZ/Site
  driverViaPrice: string | null;     // Via/Congestion?
  driverGratuity: string | null;
  totalDriver: string | null;
};

type DriverOption = {
  id: string;
  name: string;
  callsign: string;
};

export default function DriverSchedule() {
  const { error: toastError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const selectedDriver = useMemo(() => 
    drivers.find(d => d.id === selectedDriverId), 
  [drivers, selectedDriverId]);

  useEffect(() => {
    fetchDrivers();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDrivers() {
    try {
      const { data } = await api.get("/drivers", { params: { limit: 1000 } });
      const items = data.items || [];
      setDrivers(items.map((d: any) => ({
        id: String(d.id),
        name: `${d.forename} ${d.surname}`,
        callsign: d.callsign || d.id
      })));
    } catch (e) {
      console.error("Failed to load drivers", e);
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

      // Driver Filter (Exact Match on ID or No)
      if (selectedDriverId) {
        // Assuming driverNo matches the driver ID from /drivers
        if (b.driverNo !== selectedDriverId) return false; 
      }

      return true;
    });
  }, [bookings, startDate, endDate, selectedDriverId]);

  // Calculate Totals for Footer
  const totals = useMemo(() => {
    return filteredRows.reduce((acc, row) => {
      acc.waitingPrice += parseFloat(row.driverWaitingTimePrice || "0");
      acc.ulez += parseFloat(row.driverLhrGtwCharge || "0"); // Mapping ULEZ/Site
      acc.cc += parseFloat(row.driverViaPrice || "0");       // Mapping C.C
      acc.toll += parseFloat(row.driverCharge || "0");       // Mapping Toll
      acc.meetGreet += parseFloat(row.driverMeetGreet || "0");
      acc.fare += parseFloat(row.driverScheduledFare || "0");
      acc.total += parseFloat(row.totalDriver || "0");
      return acc;
    }, { waitingPrice: 0, ulez: 0, cc: 0, toll: 0, meetGreet: 0, fare: 0, total: 0 });
  }, [filteredRows]);

  const fmtMoney = (val: string | number | null) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (!num || isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      
      {/* Controls (Hidden when printing potentially, or keep for UI) */}
      <div className="card p-4 flex flex-wrap items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200 print:hidden">
        <div className="w-64">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Driver</label>
          <select 
            className="input w-full"
            value={selectedDriverId}
            onChange={e => setSelectedDriverId(e.target.value)}
          >
            <option value="">-- All Drivers --</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.callsign})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input 
            type="date" 
            className="input w-40" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input 
            type="date" 
            className="input w-40" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
          />
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
                <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
              </div>
              
              {/* Driver Box */}
              <div className="border border-slate-300 p-3 min-h-[100px] relative rounded-sm">
                <div className="font-bold text-sm mb-1 text-slate-800">
                  {selectedDriver ? selectedDriver.name : "No Driver Selected"}
                </div>
                <div className="whitespace-pre-line text-slate-500">
                  {/* Address would go here if available */}
                  [Address Line 1]
                  [Postcode]
                </div>
                <div className="absolute top-2 right-2 bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 rounded">
                  ID: {selectedDriverId || "—"}
                </div>
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
                   {selectedDriver ? new Date().toLocaleDateString('en-GB') : "—"}
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
                <th className="border border-slate-200 px-2 py-1.5 text-left">Pax Forename</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left">Pax Surname</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-16">Date</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-10">Time</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-8">Veh</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left w-32">Pick Up Address</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left w-32">Drop Off Address</th>
                <th className="border border-slate-200 px-2 py-1.5 text-left">Customer</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-10">Waiting Time</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-10">W/T Price</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">ULEZ/ Site</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">C.C</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">Toll Charge</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">M and G</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">Scheduled Fare</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center">Total Pay</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={18} className="p-4 text-center text-slate-500">Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                 <tr><td colSpan={18} className="p-8 text-center text-slate-400 italic">No records found. Select a driver and date range.</td></tr>
              ) : (
                filteredRows.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50 even:bg-slate-50/50">
                    <td className="border border-slate-200 px-2 py-1 text-center font-mono text-slate-500">{r.bookingRef || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center">{r.accountNo || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1">{r.clientForename || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1">{r.clientSurname || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center whitespace-nowrap">{r.date}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center">{r.time}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center">{r.vehicle || "Car"}</td>
                    <td className="border border-slate-200 px-2 py-1 truncate max-w-[150px]" title={r.pickUpAddress || ""}>{r.pickUpAddress}</td>
                    <td className="border border-slate-200 px-2 py-1 truncate max-w-[150px]" title={r.dropOffAddress || ""}>{r.dropOffAddress}</td>
                    <td className="border border-slate-200 px-2 py-1 truncate max-w-[100px]" title={r.companyName || ""}>{r.companyName || "-"}</td>
                    
                    {/* Financials */}
                    <td className="border border-slate-200 px-2 py-1 text-center text-slate-500">{r.driverWaitingTime || "0"}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.driverWaitingTimePrice)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.driverLhrGtwCharge)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.driverViaPrice)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.driverCharge)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.driverMeetGreet)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{fmtMoney(r.driverScheduledFare)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right font-semibold text-emerald-700 bg-emerald-50/50">{fmtMoney(r.totalDriver)}</td>
                  </tr>
                ))
              )}
              
              {/* Totals Row */}
               <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={10} className="border border-slate-200 px-2 py-2 text-right text-slate-600 uppercase text-[9px] tracking-wider">Totals</td>
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
