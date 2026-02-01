import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
export default function DriversList() {
    const { error: toastError, success } = useToast();
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [params, setParams] = useSearchParams();
    const page = parseInt(params.get("page") || "1", 10);
    const [deletingId, setDeletingId] = useState(null);
    useEffect(() => {
        void fetchList(); /* eslint-disable-next-line */
    }, [page]);
    async function fetchList() {
        setLoading(true);
        try {
            const { data } = await api.get("/drivers", {
                params: { page, limit: 20, q: q || undefined },
            });
            setRows(data.items);
            setTotal(data.total);
        }
        catch (e) {
            toastError(e?.response?.data?.message || e.message || "Failed to load drivers");
        }
        finally {
            setLoading(false);
        }
    }
    const pages = Math.max(1, Math.ceil(total / 20));
    const onSearch = () => {
        setParams({ page: "1" });
        void fetchList();
    };
    async function onDelete(id) {
        const { isConfirmed } = await Swal.fire({
            title: "Delete Driver?",
            text: "This will permanently delete the record.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it",
        });
        if (!isConfirmed)
            return;
        try {
            setDeletingId(id);
            await api.delete(`/drivers/${id}`);
            success("Driver deleted");
            await fetchList();
        }
        catch (e) {
            toastError(e?.response?.data?.message || e.message || "Delete failed");
        }
        finally {
            setDeletingId(null);
        }
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Drivers" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input w-72", placeholder: "Search driver no, name, mobile, postcode", value: q, onChange: (e) => setQ(e.target.value), onKeyDown: (e) => e.key === "Enter" && onSearch() }), _jsx("button", { className: "btn border border-slate-200", onClick: onSearch, children: "Search" }), _jsx(Link, { to: "/drivers/new", className: "btn btn-primary", children: "New" })] })] }), _jsx("div", { className: "card p-0 overflow-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-slate-600", children: _jsxs("tr", { children: [_jsx(Th, { children: "Driver No" }), _jsx(Th, { children: "Name" }), _jsx(Th, { children: "Mobile" }), _jsx(Th, { children: "Postcode" }), _jsx(Th, { children: "Start" }), _jsx(Th, { children: "Finish" }), _jsx(Th, { className: "text-right", children: "Actions" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4", children: "Loading\u2026" }) })) : rows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4", children: "No drivers" }) })) : (rows.map((r) => (_jsxs("tr", { className: "border-t", children: [_jsx(Td, { children: r.driverNo }), _jsx(Td, { className: "max-w-[260px] truncate", children: [r.forename, r.surname].filter(Boolean).join(" ") || "—" }), _jsx(Td, { children: r.mobile || "—" }), _jsx(Td, { children: r.postcode || "—" }), _jsx(Td, { children: r.startDate || "—" }), _jsx(Td, { children: r.finishDate || "—" }), _jsx(Td, { className: "text-right", children: _jsxs("div", { className: "inline-flex items-center gap-2", children: [_jsx(Link, { to: `/drivers/${r.id}`, className: "p-1 text-slate-600 hover:text-slate-900", title: "Edit", children: _jsx(Pencil, { size: 18 }) }), _jsx("button", { onClick: () => onDelete(r.id), disabled: deletingId === r.id, className: "p-1 text-rose-600 hover:text-rose-800 disabled:opacity-50", title: "Delete", children: deletingId === r.id ? (_jsx("span", { className: "text-xs", children: "\u2026" })) : (_jsx(Trash2, { size: 18 })) })] }) })] }, r.id)))) })] }) }), pages > 1 && (_jsx("div", { className: "flex gap-2", children: Array.from({ length: pages }, (_, i) => i + 1).map((n) => (_jsx("button", { onClick: () => setParams({ page: String(n) }), className: `px-3 py-1 rounded border ${n === page ? "bg-slate-900 text-white" : "border-slate-200"}`, children: n }, n))) }))] }));
}
function Th({ children, className = "" }) {
    return (_jsx("th", { className: `px-3 py-2 text-left font-medium ${className}`, children: children }));
}
function Td({ children, className = "" }) {
    return _jsx("td", { className: `px-3 py-2 ${className}`, children: children });
}
