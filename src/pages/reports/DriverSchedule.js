import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
export default function DriverSchedule() {
    const { error: toastError } = useToast();
    const [rows, setRows] = useState([]);
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-bold", children: "Driver Job Schedule" }), _jsxs("div", { className: "card p-4 flex items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Start Date" }), _jsx("input", { type: "date", className: "input w-40 border p-2 rounded", value: startDate, onChange: e => setStartDate(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "End Date" }), _jsx("input", { type: "date", className: "input w-40 border p-2 rounded", value: endDate, onChange: e => setEndDate(e.target.value) })] })] }), _jsx("div", { className: "card overflow-x-auto border border-slate-200 rounded-lg", children: _jsxs("table", { className: "min-w-full text-xs whitespace-nowrap", children: [_jsx("thead", { className: "bg-slate-50 text-slate-700 font-medium", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left", children: "Date/Time" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Booking" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Route" }), _jsx("th", { className: "px-3 py-2 text-left bg-blue-50", children: "Client Breakdown" }), _jsx("th", { className: "px-3 py-2 text-right bg-blue-50", children: "Total Client" }), _jsx("th", { className: "px-3 py-2 text-left bg-amber-50", children: "Driver Breakdown" }), _jsx("th", { className: "px-3 py-2 text-right bg-amber-50", children: "Total Driver" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4 text-center", children: "Loading..." }) })) : filteredRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4 text-center text-slate-500", children: "No jobs in range" }) })) : (filteredRows.map(r => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsxs("td", { className: "px-3 py-2", children: [_jsx("div", { children: r.date }), _jsx("div", { className: "text-slate-500", children: r.time })] }), _jsxs("td", { className: "px-3 py-2", children: [_jsx("div", { className: "font-mono", children: r.bookingRef }), _jsxs("div", { className: "text-slate-500", children: ["Dr: ", r.driverNo || "-"] })] }), _jsxs("td", { className: "px-3 py-2 max-w-[200px] truncate", children: [_jsxs("div", { title: r.pickUpAddress || "", children: ["From: ", r.pickUpAddress] }), _jsxs("div", { title: r.dropOffAddress || "", children: ["To: ", r.dropOffAddress] }), r.via && _jsxs("div", { className: "text-slate-500 text-[10px]", title: r.via, children: ["Via: ", r.via] })] }), _jsx("td", { className: "px-3 py-2 bg-blue-50/30", children: _jsxs("div", { className: "grid grid-cols-2 gap-x-2", children: [_jsxs("span", { children: ["Fare: ", r.clientScheduledFare] }), _jsxs("span", { children: ["Via: ", r.clientViaPrice] }), _jsxs("span", { children: ["Grat: ", r.clientGratuity] }), _jsxs("span", { children: ["Wait: ", r.clientWaitingPrice] })] }) }), _jsxs("td", { className: "px-3 py-2 text-right font-bold bg-blue-50/50", children: ["\u00A3", r.totalClient] }), _jsx("td", { className: "px-3 py-2 bg-amber-50/30", children: _jsxs("div", { className: "grid grid-cols-2 gap-x-2", children: [_jsxs("span", { children: ["Fare: ", r.driverScheduledFare] }), _jsxs("span", { children: ["Via: ", r.driverViaPrice] }), _jsxs("span", { children: ["Grat: ", r.driverGratuity] }), _jsxs("span", { children: ["Wait: ", r.driverWaitingPrice] })] }) }), _jsxs("td", { className: "px-3 py-2 text-right font-bold bg-amber-50/50", children: ["\u00A3", r.totalDriver] })] }, r.id)))) })] }) })] }));
}
