import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
import Swal from "sweetalert2";
export default function BookingsList() {
    const { error: toastError, success } = useToast();
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [q, setQ] = useState("");
    const [params, setParams] = useSearchParams();
    const page = parseInt(params.get("page") || "1", 10);
    const [tab, setTab] = useState(() => {
        const t = params.get("tab");
        return t === "active" || t === "cancelled" ? t : "all";
    });
    useEffect(() => {
        void fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, tab]);
    async function fetchList() {
        setLoading(true);
        try {
            // Only send cancelled=true for "cancelled" tab
            const query = {
                page,
                limit: 20,
                q: q || undefined,
            };
            if (tab === "cancelled")
                query.cancelled = true;
            const { data } = await api.get("/bookings", { params: query });
            setRows(data.items);
            setTotal(data.total);
        }
        catch (e) {
            toastError(e?.response?.data?.message || e.message || "Failed to load bookings");
        }
        finally {
            setLoading(false);
        }
    }
    async function onDelete(id) {
        const result = await Swal.fire({
            title: "Delete Booking?",
            text: "Are you sure you want to delete this booking? This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it",
        });
        if (!result.isConfirmed)
            return;
        try {
            setDeletingId(id);
            await api.delete(`/bookings/${id}`);
            success("Booking deleted");
            await fetchList();
        }
        catch (e) {
            toastError(e?.response?.data?.message || e.message || "Delete failed");
        }
        finally {
            setDeletingId(null);
        }
    }
    // Client-side filtering for Active (and safety for Cancelled)
    const visibleRows = useMemo(() => {
        if (tab === "active")
            return rows.filter((r) => !r.cancelled);
        if (tab === "cancelled")
            return rows.filter((r) => r.cancelled);
        return rows;
    }, [rows, tab]);
    // Pagination notes:
    // - All/Cancelled: server total is correct
    // - Active: client-side filter → use current page length as effective total
    const effectiveTotal = tab === "active" ? visibleRows.length : total;
    const pages = Math.max(1, Math.ceil(effectiveTotal / 20));
    const changeTab = (next) => {
        setTab(next);
        setParams({ page: "1", tab: next });
    };
    const onSearch = () => {
        setParams({ page: "1", tab });
        void fetchList();
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Bookings" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input w-64", placeholder: "Search...", value: q, onChange: (e) => setQ(e.target.value), onKeyDown: (e) => e.key === "Enter" && onSearch() }), _jsx("button", { className: "btn border border-slate-200", onClick: onSearch, children: "Search" }), _jsx(Link, { to: "/bookings/new", className: "btn btn-primary", children: "New" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Tab, { label: "All", active: tab === "all", onClick: () => changeTab("all") }), _jsx(Tab, { label: "Active", active: tab === "active", onClick: () => changeTab("active") }), _jsx(Tab, { label: "Cancelled", active: tab === "cancelled", onClick: () => changeTab("cancelled") })] }), _jsx("div", { className: "card p-0 overflow-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-slate-600", children: _jsxs("tr", { children: [_jsx(Th, { children: "Date" }), _jsx(Th, { children: "Time" }), _jsx(Th, { children: "Ref" }), _jsx(Th, { children: "Client" }), _jsx(Th, { children: "From" }), _jsx(Th, { children: "To" }), _jsx(Th, { children: "Vehicle" }), _jsx(Th, { children: "Status" }), _jsx(Th, { children: "Total" }), _jsx(Th, { className: "text-right", children: "Actions" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { className: "p-4", colSpan: 10, children: "Loading..." }) })) : visibleRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { className: "p-4", colSpan: 10, children: "No bookings" }) })) : (visibleRows.map((r) => (_jsxs("tr", { className: "border-t", children: [_jsx(Td, { children: r.date ?? "-" }), _jsx(Td, { children: r.time ?? "-" }), _jsx(Td, { children: r.bookingRef ?? "-" }), _jsx(Td, { children: r.clientForename || r.clientSurname
                                            ? `${r.clientForename || ""} ${r.clientSurname || ""}`.trim()
                                            : r.clientId ?? "-" }), _jsx(Td, { className: "max-w-[240px] truncate", title: r.pickUpAddress ?? undefined, children: r.pickUpAddress ?? "-" }), _jsx(Td, { className: "max-w-[240px] truncate", title: r.dropOffAddress ?? undefined, children: r.dropOffAddress ?? "-" }), _jsx(Td, { children: r.vehicle ?? "-" }), _jsx(Td, { children: r.cancelled ? (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs border border-rose-200 text-rose-700 bg-rose-50", children: "Cancelled" })) : (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs border border-emerald-200 text-emerald-700 bg-emerald-50", children: "Active" })) }), _jsx(Td, { children: r.totalClient ?? "-" }), _jsx(Td, { className: "text-right", children: _jsxs("div", { className: "inline-flex items-center gap-2", children: [_jsx(Link, { to: `/bookings/${r.id}`, className: "p-1 text-slate-600 hover:text-slate-900 transition", title: "Edit", children: _jsx(Pencil, { size: 18 }) }), _jsx("button", { onClick: () => onDelete(r.id), disabled: deletingId === r.id, "aria-disabled": deletingId === r.id, className: "p-1 text-rose-600 hover:text-rose-800 transition disabled:opacity-50", title: "Delete", children: deletingId === r.id ? (_jsxs("svg", { className: "animate-spin h-4 w-4 text-rose-600", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-2a6 6 0 00-6-6v2H9V6a6 6 0 00-6 6H4z" })] })) : (_jsx(Trash2, { size: 18 })) })] }) })] }, r.id)))) })] }) }), pages > 1 && (_jsx("div", { className: "flex gap-2", children: Array.from({ length: pages }, (_, i) => i + 1).map((n) => (_jsx("button", { onClick: () => setParams({ page: String(n), tab }), className: `px-3 py-1 rounded border ${n === page ? "bg-slate-900 text-white" : "border-slate-200"}`, children: n }, n))) }))] }));
}
function Th({ children, className = "" }) {
    return (_jsx("th", { className: `px-3 py-2 text-left font-medium ${className}`, children: children }));
}
function Td({ children, className = "" }) {
    return _jsx("td", { className: `px-3 py-2 ${className}`, children: children });
}
function Tab({ label, active, onClick, }) {
    return (_jsx("button", { onClick: onClick, className: "px-3 py-1.5 rounded-md text-sm border transition " +
            (active
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"), children: label }));
}
