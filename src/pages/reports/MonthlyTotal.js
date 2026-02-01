import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
export default function MonthlyTotal() {
    const { error: toastError } = useToast();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    // Filters
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
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
            const val = parseFloat(r.totalClient || "0");
            if (minPrice !== "" && val < minPrice)
                return false;
            if (maxPrice !== "" && val > maxPrice)
                return false;
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-bold", children: "Monthly Total Report" }), _jsxs("div", { className: "card p-4 flex items-end gap-4 bg-white rounded-lg shadow-sm border border-slate-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Min Income" }), _jsx("input", { type: "number", className: "input w-32 border p-2 rounded", value: minPrice, onChange: e => setMinPrice(e.target.value ? parseFloat(e.target.value) : ""), placeholder: "0.00" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Max Income" }), _jsx("input", { type: "number", className: "input w-32 border p-2 rounded", value: maxPrice, onChange: e => setMaxPrice(e.target.value ? parseFloat(e.target.value) : ""), placeholder: "Max" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-6 bg-blue-50 border border-blue-100 rounded-xl", children: [_jsx("div", { className: "text-sm text-blue-600 font-medium uppercase", children: "Job Total (Client)" }), _jsxs("div", { className: "text-3xl font-bold text-blue-900 mt-2", children: ["\u00A3", stats.jobTotal] })] }), _jsxs("div", { className: "p-6 bg-amber-50 border border-amber-100 rounded-xl", children: [_jsx("div", { className: "text-sm text-amber-600 font-medium uppercase", children: "Driver Total" }), _jsxs("div", { className: "text-3xl font-bold text-amber-900 mt-2", children: ["\u00A3", stats.driverTotal] })] }), _jsxs("div", { className: "p-6 bg-emerald-50 border border-emerald-100 rounded-xl", children: [_jsx("div", { className: "text-sm text-emerald-600 font-medium uppercase", children: "Commission" }), _jsxs("div", { className: "text-3xl font-bold text-emerald-900 mt-2", children: ["\u00A3", stats.commission] })] })] }), _jsx("div", { className: "card overflow-hidden border border-slate-200 rounded-lg", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-slate-700 font-medium", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: "Date" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Ref" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Job Total" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Driver Total" }), _jsx("th", { className: "px-4 py-3 text-right", children: "Commission" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "p-4 text-center", children: "Loading..." }) })) : filteredRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "p-4 text-center text-slate-500", children: "No data found in range" }) })) : (filteredRows.map(r => {
                                const jt = parseFloat(r.totalClient || "0");
                                const dt = parseFloat(r.totalDriver || "0");
                                return (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-4 py-2", children: r.date }), _jsx("td", { className: "px-4 py-2 font-mono text-xs", children: r.bookingRef }), _jsxs("td", { className: "px-4 py-2 text-right", children: ["\u00A3", jt.toFixed(2)] }), _jsxs("td", { className: "px-4 py-2 text-right", children: ["\u00A3", dt.toFixed(2)] }), _jsxs("td", { className: "px-4 py-2 text-right font-medium", children: ["\u00A3", (jt - dt).toFixed(2)] })] }, r.id));
                            })) })] }) })] }));
}
