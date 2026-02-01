import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
export default function ForecastBooking() {
    const { error: toastError } = useToast();
    const [rows, setRows] = useState([]);
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
        }
        catch (e) {
            toastError(e?.response?.data?.message || e.message || "Failed to load data");
        }
        finally {
            setLoading(false);
        }
    }
    const filteredRows = useMemo(() => {
        return rows.filter(r => {
            if (!r.date)
                return false;
            if (startDate && r.date < startDate)
                return false;
            if (endDate && r.date > endDate)
                return false;
            return true;
        });
    }, [rows, startDate, endDate]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-bold", children: "Forecast Booking" }), _jsxs("div", { className: "card p-4 flex items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "From Date" }), _jsx("input", { type: "date", className: "input w-40 border p-2 rounded", value: startDate, onChange: e => setStartDate(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "To Date" }), _jsx("input", { type: "date", className: "input w-40 border p-2 rounded", value: endDate, onChange: e => setEndDate(e.target.value) })] })] }), _jsx("div", { className: "card overflow-x-auto border border-slate-200 rounded-lg", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-slate-700 font-medium", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: "Date / Time" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Ref" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Client" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Pickup / Dropoff" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Driver" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Vehicle" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Quote" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4 text-center", children: "Loading..." }) })) : filteredRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4 text-center text-slate-500", children: "No bookings in this range" }) })) : (filteredRows.map(r => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsxs("td", { className: "px-4 py-2", children: [_jsx("div", { className: "font-medium", children: r.date }), _jsx("div", { className: "text-slate-500 text-xs", children: r.time })] }), _jsx("td", { className: "px-4 py-2 font-mono text-xs", children: r.bookingRef }), _jsx("td", { className: "px-4 py-2", children: r.clientId }), _jsxs("td", { className: "px-4 py-2 max-w-[200px] truncate", children: [_jsx("div", { title: r.pickUpAddress || "", children: r.pickUpAddress }), _jsxs("div", { title: r.dropOffAddress || "", className: "text-slate-400", children: ["to ", r.dropOffAddress] })] }), _jsx("td", { className: "px-4 py-2", children: r.driverNo || "-" }), _jsx("td", { className: "px-4 py-2", children: r.vehicle || "-" }), _jsx("td", { className: "px-4 py-2 text-right font-medium", children: r.totalClient ? `£${r.totalClient}` : "-" })] }, r.id)))) })] }) })] }));
}
