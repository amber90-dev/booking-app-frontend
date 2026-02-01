import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
export default function MonthlyTotal() {
    const { error: toastError } = useToast();
    const [rows, setRows] = useState([]);
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
            // If start date is set, check it
            if (startDate && r.date < startDate)
                return false;
            // If end date is set, check it
            if (endDate && r.date > endDate)
                return false;
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-bold", children: "Monthly Total" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", children: "From" }), _jsx("input", { type: "date", className: "input w-40", value: startDate, onChange: e => setStartDate(e.target.value) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", children: "To" }), _jsx("input", { type: "date", className: "input w-40", value: endDate, onChange: e => setEndDate(e.target.value) })] })] })] }), _jsx("div", { className: "card p-0 overflow-hidden", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-slate-700 font-medium", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: "Account No" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Company Name" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Ref" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Job Total" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Driver No" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Driver Total" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Commission" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4 text-center", children: "Loading..." }) })) : filteredRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4 text-center text-slate-500", children: "No jobs found in this range" }) })) : (filteredRows.map((r) => {
                                const jt = parseFloat(r.totalClient || "0");
                                const dt = parseFloat(r.totalDriver || "0");
                                const comm = jt - dt;
                                return (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-4 py-2", children: r.accountNo || "-" }), _jsx("td", { className: "px-4 py-2 truncate max-w-[200px]", title: r.companyName || "", children: r.companyName || "-" }), _jsx("td", { className: "px-4 py-2 font-mono text-xs", children: r.bookingRef || "-" }), _jsx("td", { className: "px-4 py-2 text-right", children: jt !== 0 ? `£${jt.toFixed(2)}` : "£0.00" }), _jsx("td", { className: "px-4 py-2", children: r.driverMobile || "-" }), _jsx("td", { className: "px-4 py-2 text-right", children: dt !== 0 ? `£${dt.toFixed(2)}` : "£0.00" }), _jsx("td", { className: "px-4 py-2 text-right font-medium text-emerald-700", children: comm !== 0 ? `£${comm.toFixed(2)}` : "£0.00" })] }, r.id));
                            })) })] }) }), _jsxs("div", { className: "bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center shadow-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-500 mb-1", children: "Total Jobs" }), _jsx("div", { className: "text-2xl font-bold text-slate-800", children: stats.count })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-500 mb-1", children: "Job Total" }), _jsxs("div", { className: "text-2xl font-bold text-blue-600", children: ["\u00A3", stats.jobTotal.toFixed(0)] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-500 mb-1", children: "Driver Total" }), _jsxs("div", { className: "text-2xl font-bold text-amber-600", children: ["\u00A3", stats.driverTotal.toFixed(0)] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-500 mb-1", children: "Commission" }), _jsxs("div", { className: "text-2xl font-bold text-emerald-600", children: ["\u00A3", stats.commission.toFixed(0)] })] })] })] }));
}
