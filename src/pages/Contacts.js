import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Avatar from '../components/Avatar';
export default function Contacts() {
    const data = [
        { name: 'Ali Raza', company: 'Acme', email: 'ali@acme.com', status: 'Active' },
        { name: 'Sara Khan', company: 'Globex', email: 'sara@globex.com', status: 'Prospect' },
        { name: 'Hassan Bari', company: 'Umbrella', email: 'hassan@umb.com', status: 'Churn Risk' },
        { name: 'Zehra Tariq', company: 'Wayne Corp', email: 'zehra@wayne.com', status: 'Active' },
    ];
    return (_jsxs("div", { className: "card p-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4", children: [_jsx("h3", { className: "font-semibold", children: "Contacts" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input w-64", placeholder: "Search contacts..." }), _jsx("button", { className: "btn btn-primary", children: "Add Contact" })] })] }), _jsx("div", { className: "overflow-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "text-left text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2 pr-4", children: "Name" }), _jsx("th", { className: "py-2 pr-4", children: "Company" }), _jsx("th", { className: "py-2 pr-4", children: "Email" }), _jsx("th", { className: "py-2 pr-4", children: "Status" })] }) }), _jsx("tbody", { children: data.map((r, i) => (_jsxs("tr", { className: "border-t border-slate-100 dark:border-slate-800", children: [_jsxs("td", { className: "py-2 pr-4 flex items-center gap-2", children: [_jsx(Avatar, { name: r.name }), " ", r.name] }), _jsx("td", { className: "py-2 pr-4", children: r.company }), _jsx("td", { className: "py-2 pr-4", children: _jsx("a", { className: "link", href: `mailto:${r.email}`, children: r.email }) }), _jsx("td", { className: "py-2 pr-4", children: _jsx("span", { className: `badge ${r.status === 'Active' ? 'badge-green' : r.status === 'Prospect' ? 'badge-amber' : 'badge-rose'}`, children: r.status }) })] }, i))) })] }) })] }));
}
