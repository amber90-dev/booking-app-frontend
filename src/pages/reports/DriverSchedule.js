import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
export default function DriverSchedule() {
    const { error: toastError } = useToast();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    // Filters
    const [drivers, setDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const selectedDriver = useMemo(() => drivers.find(d => d.id === selectedDriverId), [drivers, selectedDriverId]);
    useEffect(() => {
        fetchDrivers();
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function fetchDrivers() {
        try {
            const { data } = await api.get("/drivers", { params: { limit: 1000 } });
            const items = data.items || [];
            setDrivers(items.map((d) => ({
                id: String(d.id),
                name: `${d.forename} ${d.surname}`,
                callsign: d.callsign || d.id
            })));
        }
        catch (e) {
            console.error("Failed to load drivers", e);
        }
    }
    async function fetchBookings() {
        setLoading(true);
        try {
            const { data } = await api.get("/bookings", { params: { limit: 2000 } });
            setBookings(data.items);
        }
        catch (e) {
            toastError(e?.response?.data?.message || e.message || "Failed to load data");
        }
        finally {
            setLoading(false);
        }
    }
    const filteredRows = useMemo(() => {
        return bookings.filter(b => {
            // Date Filter
            if (startDate && (!b.date || b.date < startDate))
                return false;
            if (endDate && (!b.date || b.date > endDate))
                return false;
            // Driver Filter (Exact Match on ID or No)
            if (selectedDriverId) {
                // Assuming driverNo matches the driver ID from /drivers
                if (b.driverNo !== selectedDriverId)
                    return false;
            }
            return true;
        });
    }, [bookings, startDate, endDate, selectedDriverId]);
    // Calculate Totals for Footer
    const totals = useMemo(() => {
        return filteredRows.reduce((acc, row) => {
            acc.waitingPrice += parseFloat(row.driverWaitingTimePrice || "0");
            acc.ulez += parseFloat(row.driverLhrGtwCharge || "0"); // Mapping ULEZ/Site
            acc.cc += parseFloat(row.driverViaPrice || "0"); // Mapping C.C
            acc.toll += parseFloat(row.driverCharge || "0"); // Mapping Toll
            acc.meetGreet += parseFloat(row.driverMeetGreet || "0");
            acc.fare += parseFloat(row.driverScheduledFare || "0");
            acc.total += parseFloat(row.totalDriver || "0");
            return acc;
        }, { waitingPrice: 0, ulez: 0, cc: 0, toll: 0, meetGreet: 0, fare: 0, total: 0 });
    }, [filteredRows]);
    const fmtMoney = (val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (!num || isNaN(num))
            return "0.00";
        return num.toFixed(2);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "card p-4 flex flex-wrap items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200 print:hidden", children: [_jsxs("div", { className: "w-64", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Select Driver" }), _jsxs("select", { className: "input w-full", value: selectedDriverId, onChange: e => setSelectedDriverId(e.target.value), children: [_jsx("option", { value: "", children: "-- All Drivers --" }), drivers.map(d => (_jsxs("option", { value: d.id, children: [d.name, " (", d.callsign, ")"] }, d.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Start Date" }), _jsx("input", { type: "date", className: "input w-40", value: startDate, onChange: e => setStartDate(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "End Date" }), _jsx("input", { type: "date", className: "input w-40", value: endDate, onChange: e => setEndDate(e.target.value) })] })] }), _jsxs("div", { className: "card bg-white p-8 print:shadow-none print:p-0 text-slate-900 text-xs", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "w-1/3 space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("span", { className: "font-semibold w-16 text-slate-700", children: "Date:" }), _jsx("span", { children: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) })] }), _jsxs("div", { className: "border border-slate-300 p-3 min-h-[100px] relative rounded-sm", children: [_jsx("div", { className: "font-bold text-sm mb-1 text-slate-800", children: selectedDriver ? selectedDriver.name : "No Driver Selected" }), _jsx("div", { className: "whitespace-pre-line text-slate-500", children: "[Address Line 1] [Postcode]" }), _jsxs("div", { className: "absolute top-2 right-2 bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 rounded", children: ["ID: ", selectedDriverId || "—"] })] })] }), _jsxs("div", { className: "w-1/3 text-right space-y-1", children: [_jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("span", { className: "font-semibold text-slate-700", children: "Ref No" }), _jsx("span", { children: "01" })] }), _jsxs("div", { className: "flex justify-end gap-2 mt-12", children: [_jsx("span", { className: "font-semibold text-slate-700", children: "Date Payable" }), _jsx("span", { children: selectedDriver ? new Date().toLocaleDateString('en-GB') : "—" })] })] })] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full border-collapse border border-slate-200", children: [_jsx("thead", { className: "bg-slate-50 text-slate-700 font-semibold border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-left w-12", children: "Booking Ref" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center w-8", children: "Acc No" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-left", children: "Pax Forename" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-left", children: "Pax Surname" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center w-16", children: "Date" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center w-10", children: "Time" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center w-8", children: "Veh" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-left w-32", children: "Pick Up Address" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-left w-32", children: "Drop Off Address" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-left", children: "Customer" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center w-10", children: "Waiting Time" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center w-10", children: "W/T Price" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center", children: "ULEZ/ Site" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center", children: "C.C" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center", children: "Toll Charge" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center", children: "M and G" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center", children: "Scheduled Fare" }), _jsx("th", { className: "border border-slate-200 px-2 py-1.5 text-center", children: "Total Pay" })] }) }), _jsxs("tbody", { children: [loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 18, className: "p-4 text-center text-slate-500", children: "Loading..." }) })) : filteredRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 18, className: "p-8 text-center text-slate-400 italic", children: "No records found. Select a driver and date range." }) })) : (filteredRows.map((r, i) => (_jsxs("tr", { className: "hover:bg-slate-50 even:bg-slate-50/50", children: [_jsx("td", { className: "border border-slate-200 px-2 py-1 text-center font-mono text-slate-500", children: r.bookingRef || "-" }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-center", children: r.accountNo || "-" }), _jsx("td", { className: "border border-slate-200 px-2 py-1", children: r.clientForename || "-" }), _jsx("td", { className: "border border-slate-200 px-2 py-1", children: r.clientSurname || "-" }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-center whitespace-nowrap", children: r.date }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-center", children: r.time }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-center", children: r.vehicle || "Car" }), _jsx("td", { className: "border border-slate-200 px-2 py-1 truncate max-w-[150px]", title: r.pickUpAddress || "", children: r.pickUpAddress }), _jsx("td", { className: "border border-slate-200 px-2 py-1 truncate max-w-[150px]", title: r.dropOffAddress || "", children: r.dropOffAddress }), _jsx("td", { className: "border border-slate-200 px-2 py-1 truncate max-w-[100px]", title: r.companyName || "", children: r.companyName || "-" }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-center text-slate-500", children: r.driverWaitingTime || "0" }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-right", children: fmtMoney(r.driverWaitingTimePrice) }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-right", children: fmtMoney(r.driverLhrGtwCharge) }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-right", children: fmtMoney(r.driverViaPrice) }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-right", children: fmtMoney(r.driverCharge) }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-right", children: fmtMoney(r.driverMeetGreet) }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-right", children: fmtMoney(r.driverScheduledFare) }), _jsx("td", { className: "border border-slate-200 px-2 py-1 text-right font-semibold text-emerald-700 bg-emerald-50/50", children: fmtMoney(r.totalDriver) })] }, r.id || i)))), _jsxs("tr", { className: "bg-slate-100 font-bold border-t-2 border-slate-300", children: [_jsx("td", { colSpan: 10, className: "border border-slate-200 px-2 py-2 text-right text-slate-600 uppercase text-[9px] tracking-wider", children: "Totals" }), _jsx("td", { className: "border border-slate-200 px-2 py-2" }), _jsx("td", { className: "border border-slate-200 px-2 py-2 text-right", children: fmtMoney(totals.waitingPrice) }), _jsx("td", { className: "border border-slate-200 px-2 py-2 text-right", children: fmtMoney(totals.ulez) }), _jsx("td", { className: "border border-slate-200 px-2 py-2 text-right", children: fmtMoney(totals.cc) }), _jsx("td", { className: "border border-slate-200 px-2 py-2 text-right", children: fmtMoney(totals.toll) }), _jsx("td", { className: "border border-slate-200 px-2 py-2 text-right", children: fmtMoney(totals.meetGreet) }), _jsx("td", { className: "border border-slate-200 px-2 py-2 text-right", children: fmtMoney(totals.fare) }), _jsx("td", { className: "border border-slate-200 px-2 py-2 text-right text-emerald-700", children: fmtMoney(totals.total) })] })] })] }) })] })] }));
}
