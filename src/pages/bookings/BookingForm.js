import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/toast/ToastProvider";
const REQUIRED = [
    "date",
    "time",
    "pickUpAddress",
    "dropOffAddress",
    "vehicle",
];
const STRING_FIELDS = new Set([
    "bookingRef",
    "accountNo",
    "costCentre",
    "companyName",
    "companyTelNo",
    "contactId",
    "contactForename",
    "contactSurname",
    "contactTelNo",
    "staffId",
    "staffForename",
    "staffSurname",
    "staffTelNo",
    "dateTaken",
    "timeTaken",
    "clientId",
    "clientForename",
    "clientSurname",
    "clientAddress1",
    "clientAddress2",
    "clientTown",
    "clientPostcode",
    "clientTelNo",
    "clientMobile",
    "driverNo",
    "driverForename",
    "driverSurname",
    "driverMobile",
    "date",
    "time",
    "pickUpAddress",
    "dropOffAddress",
    "via",
    "extraInfo",
    "vehicle",
    "clientScheduledFare",
    "clientCharge",
    "clientMeetGreet",
    "clientWaitingTime",
    "clientWaitingTimePrice",
    "clientLhrGtwCharge",
    // "clientTelCharge",
    "clientViaPrice",
    "clientGratuity",
    "clientCarPark",
    "totalClient",
    "driverScheduledFare",
    "driverCharge",
    "driverMeetGreet",
    "driverWaitingTime",
    "driverWaitingTimePrice",
    "driverLhrGtwCharge",
    // "driverTelCharge",
    "driverViaPrice",
    "driverGratuity",
    "driverCarPark",
    "totalDriver",
    "notes",
]);
const norm = (v) => String(v ?? "").trim();
function validate(m) {
    const e = {};
    for (const k of REQUIRED) {
        if (!norm(m[k]))
            e[k] = "Required";
    }
    // time (24h, H:mm or HH:mm)
    const t = norm(m.time);
    if (t && !/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(t))
        e.time = "Use HH:mm";
    // dateTaken/timeTaken (optional but validate if present)
    if (m.dateTaken && !/^\d{4}-\d{2}-\d{2}$/.test(norm(m.dateTaken)))
        e.dateTaken = "Use YYYY-MM-DD";
    if (m.timeTaken && !/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(norm(m.timeTaken)))
        e.timeTaken = "Use HH:mm";
    // money fields (optional but numeric with up to 2 decimals)
    const money = [
        "clientScheduledFare",
        "clientCharge",
        "clientMeetGreet",
        "clientWaitingTime",
        "clientWaitingTimePrice",
        "clientLhrGtwCharge",
        // "clientTelCharge",
        "clientViaPrice",
        "clientGratuity",
        "clientCarPark",
        "totalClient",
        "driverScheduledFare",
        "driverCharge",
        "driverMeetGreet",
        "driverWaitingTime",
        "driverWaitingTimePrice",
        "driverLhrGtwCharge",
        // "driverTelCharge",
        "driverViaPrice",
        "driverGratuity",
        "driverCarPark",
        "totalDriver",
    ];
    money.forEach((k) => {
        const v = norm(m[k]);
        if (v && !/^-?\d+(\.\d{1,2})?$/.test(v))
            e[k] = "Invalid amount";
    });
    // integer mins - REMOVED
    // (["clientTelUsedMins", "driverTelUsedMins"] as const).forEach((k) => {
    //   const raw = (m as any)[k];
    //   if (
    //     raw !== null &&
    //     raw !== undefined &&
    //     raw !== "" &&
    //     !/^-?\d+$/.test(String(raw))
    //   ) {
    //     e[k] = "Must be an integer";
    //   }
    // });
    return e;
}
/* =========================
   Helper Components (module-scope!)
   ========================= */
function Section({ title, children, }) {
    return (_jsxs("div", { className: "bg-white border border-slate-200 rounded-xl shadow-sm", children: [_jsx("div", { className: "px-4 py-3 border-b font-medium", children: title }), _jsx("div", { className: "p-4", children: children })] }));
}
function Grid({ children }) {
    return _jsx("div", { className: "grid md:grid-cols-2 gap-4", children: children });
}
function L({ label, children }) {
    return (_jsxs("label", { className: "block", children: [_jsx("div", { className: "text-sm text-slate-600 mb-1", children: label }), children] }));
}
function MoneyField({ name, label, model, setField, markTouched, showError, error, }) {
    return (_jsxs(L, { label: label, children: [_jsx("input", { className: "input", value: model[name] ?? "", onChange: setField(name), onBlur: markTouched(name) }), showError && error && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: error }))] }));
}
function useDebouncedValue(value, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}
function useEntityLookup(endpoint, query, limit = 10) {
    const [opts, setOpts] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dq = useDebouncedValue(query, 300);
    useEffect(() => {
        if (!dq) {
            setOpts([]);
            return;
        }
        (async () => {
            try {
                setLoading(true);
                const { data } = await api.get(endpoint, { params: { q: dq, limit } });
                const items = Array.isArray(data?.items) ? data.items : [];
                setOpts(items.map((x) => ({
                    id: String(x.id ?? x.code ?? x.employeeId ?? ""),
                    name: String(x.name ??
                        x.fullName ??
                        (x.forename && x.surname
                            ? `${x.forename} ${x.surname}`
                            : x.companyName ?? "")),
                    telNo: x.telNo ?? x.phone ?? x.mobile ?? x.companyTelNo ?? null,
                    _raw: x,
                })));
                setOpen(true);
            }
            catch {
                setOpts([]);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [dq, endpoint, limit]);
    return { opts, open, setOpen, loading };
}
function Dropdown({ open, loading, options, onPick, }) {
    if (!open || (!loading && options.length === 0))
        return null;
    return (_jsxs("div", { className: "absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow", children: [loading && (_jsx("div", { className: "px-3 py-2 text-sm text-slate-500", children: "Searching\u2026" })), !loading &&
                options.map((o) => (_jsxs("button", { type: "button", className: "w-full text-left px-3 py-2 text-sm hover:bg-slate-50", onMouseDown: (e) => e.preventDefault(), onClick: () => onPick(o), title: o.name, children: [_jsx("span", { className: "font-mono", children: o.id }), _jsx("span", { className: "mx-2 text-slate-400", children: "\u2014" }), _jsx("span", { className: "truncate inline-block max-w-[70%] align-middle", children: o.name || "Unnamed" })] }, o.id)))] }));
}
/* =========================
   Booking Form
   ========================= */
export default function BookingForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [model, setModel] = useState({
        vip: false,
        cancelled: false,
        detailsGiven: false,
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dirty, setDirty] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { success, error: toastError } = useToast();
    /* --- Lookup State & Locks --- */
    // Company (Account No)
    const [companyQuery, setCompanyQuery] = useState("");
    const companyBoxRef = useRef(null);
    const companyLookup = useEntityLookup("/companies", companyQuery);
    const [lockedCompany, setLockedCompany] = useState(false);
    // Contact
    const [contactQuery, setContactQuery] = useState("");
    const contactBoxRef = useRef(null);
    const contactLookup = useEntityLookup("/contacts", contactQuery);
    const [lockedContact, setLockedContact] = useState(false);
    // Staff
    const [staffQuery, setStaffQuery] = useState("");
    const staffBoxRef = useRef(null);
    const staffLookup = useEntityLookup("/staff", staffQuery);
    const [lockedStaff, setLockedStaff] = useState(false);
    // Client
    const [clientQuery, setClientQuery] = useState("");
    const clientBoxRef = useRef(null);
    const clientLookup = useEntityLookup("/clients", clientQuery);
    const [lockedClient, setLockedClient] = useState(false);
    // Driver
    const [driverQuery, setDriverQuery] = useState("");
    const driverBoxRef = useRef(null);
    const driverLookup = useEntityLookup("/drivers", driverQuery);
    const [lockedDriver, setLockedDriver] = useState(false);
    // click outside to close dropdowns
    useEffect(() => {
        const handler = (e) => {
            if (!(e.target instanceof Node))
                return;
            const boxes = [
                companyBoxRef.current,
                contactBoxRef.current,
                staffBoxRef.current,
                clientBoxRef.current,
                driverBoxRef.current,
            ];
            const clickedInside = boxes.some((n) => n && n.contains(e.target));
            if (!clickedInside) {
                companyLookup.setOpen(false);
                contactLookup.setOpen(false);
                staffLookup.setOpen(false);
                clientLookup.setOpen(false);
                driverLookup.setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // load booking if edit
    useEffect(() => {
        if (!isEdit)
            return;
        api
            .get(`/bookings/${id}`)
            .then((r) => {
            setModel(r.data);
            if (r.data?.accountNo &&
                (r.data?.companyName ||
                    r.data?.companyTelNo ||
                    typeof r.data?.vip === "boolean")) {
                setLockedCompany(true);
            }
            if (r.data?.contactId &&
                (r.data?.contactForename ||
                    r.data?.contactSurname ||
                    r.data?.contactTelNo)) {
                setLockedContact(true);
            }
            if (r.data?.staffId &&
                (r.data?.staffForename || r.data?.staffSurname || r.data?.staffTelNo)) {
                setLockedStaff(true);
            }
            if (r.data?.clientId &&
                (r.data?.clientForename || r.data?.clientSurname)) {
                setLockedClient(true);
            }
            if (r.data?.driverNo &&
                (r.data?.driverForename || r.data?.driverSurname)) {
                setLockedDriver(true);
            }
        })
            .catch((e) => toastError(e?.response?.data?.message || "Failed to load booking"));
    }, [id, isEdit, toastError]);
    // validation
    useEffect(() => {
        setErrors(validate(model));
    }, [model]);
    // Auto-calculate Totals
    useEffect(() => {
        const sum = (...vals) => {
            return vals.reduce((acc, v) => {
                const n = parseFloat(v || "0");
                return acc + (isNaN(n) ? 0 : n);
            }, 0);
        };
        const cTotal = sum(model.clientScheduledFare, model.clientCharge, model.clientMeetGreet, model.clientWaitingTimePrice, model.clientLhrGtwCharge, model.clientViaPrice, model.clientGratuity, model.clientCarPark);
        const dTotal = sum(model.driverScheduledFare, model.driverCharge, model.driverMeetGreet, model.driverWaitingTimePrice, model.driverLhrGtwCharge, model.driverViaPrice, model.driverGratuity, model.driverCarPark);
        setModel(prev => {
            // Only update if changed to avoid loops (though float comparison can be tricky, toFixed(2) helps)
            const newCT = cTotal.toFixed(2);
            const newDT = dTotal.toFixed(2);
            if (prev.totalClient === newCT && prev.totalDriver === newDT)
                return prev;
            return { ...prev, totalClient: newCT, totalDriver: newDT };
        });
    }, [
        model.clientScheduledFare,
        model.clientCharge,
        model.clientMeetGreet,
        model.clientWaitingTimePrice,
        model.clientLhrGtwCharge,
        model.clientViaPrice,
        model.clientGratuity,
        model.clientCarPark,
        model.driverScheduledFare,
        model.driverCharge,
        model.driverMeetGreet,
        model.driverWaitingTimePrice,
        model.driverLhrGtwCharge,
        model.driverViaPrice,
        model.driverGratuity,
        model.driverCarPark,
    ]);
    // unlock and clear company-related fields if accountNo cleared
    useEffect(() => {
        if (!lockedCompany)
            return;
        if (!norm(model.accountNo)) {
            setLockedCompany(false);
            setModel((m) => ({
                ...m,
                companyName: "",
                companyTelNo: "",
                vip: false,
            }));
        }
    }, [model.accountNo, lockedCompany]);
    const setField = (k) => (e) => {
        const el = e?.target;
        const type = el?.type;
        let v = type === "checkbox" ? !!el.checked : el?.value;
        // Lookups: open & unlock when user types IDs
        if (k === "accountNo") {
            setCompanyQuery(v ?? "");
            companyLookup.setOpen(true);
            if (lockedCompany)
                setLockedCompany(false);
        }
        if (k === "contactId") {
            setContactQuery(v ?? "");
            contactLookup.setOpen(true);
            if (lockedContact)
                setLockedContact(false);
        }
        if (k === "staffId") {
            setStaffQuery(v ?? "");
            staffLookup.setOpen(true);
            if (lockedStaff)
                setLockedStaff(false);
        }
        if (k === "clientId") {
            setClientQuery(v ?? "");
            clientLookup.setOpen(true);
            if (lockedClient)
                setLockedClient(false);
        }
        if (k === "driverNo") {
            setDriverQuery(v ?? "");
            driverLookup.setOpen(true);
            if (lockedDriver)
                setLockedDriver(false);
        }
        if (STRING_FIELDS.has(k) && typeof v === "string") {
            // v = v.trim(); // Do not trim while typing, it prevents spaces
        }
        // if ((k === "clientTelUsedMins" || k === "driverTelUsedMins") && v !== "") {
        //   v = Number.isNaN(Number(v)) ? v : Number(v);
        // }
        setModel((m) => ({ ...m, [k]: v }));
        setDirty((d) => ({ ...d, [k]: true }));
        setTouched((t) => ({ ...t, [k]: true }));
    };
    const markTouched = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
    // pick handlers
    const pickCompany = (o) => {
        setModel((m) => ({
            ...m,
            accountNo: o.id,
            companyName: o._raw?.name ?? o.name ?? m.companyName ?? "",
            companyTelNo: o.telNo ?? m.companyTelNo ?? "",
            vip: !!(o._raw?.vip ?? m.vip),
        }));
        setLockedCompany(true);
        setCompanyQuery(o.id);
        companyLookup.setOpen(false);
    };
    const pickContact = (o) => {
        setModel((m) => ({
            ...m,
            contactId: o.id,
            contactForename: o._raw?.forename ?? m.contactForename ?? "",
            contactSurname: o._raw?.surname ?? m.contactSurname ?? "",
            contactTelNo: o.telNo ?? m.contactTelNo ?? "",
        }));
        setLockedContact(true);
        setContactQuery(o.id);
        contactLookup.setOpen(false);
    };
    const pickStaff = (o) => {
        setModel((m) => ({
            ...m,
            staffId: o.id,
            staffForename: o._raw?.forename ?? m.staffForename ?? "",
            staffSurname: o._raw?.surname ?? m.staffSurname ?? "",
            staffTelNo: o.telNo ?? m.staffTelNo ?? "",
        }));
        setLockedStaff(true);
        setStaffQuery(o.id);
        staffLookup.setOpen(false);
    };
    const pickClient = (o) => {
        setModel((m) => ({
            ...m,
            clientId: o.id,
            clientForename: o._raw?.forename ?? m.clientForename ?? "",
            clientSurname: o._raw?.surname ?? m.clientSurname ?? "",
            clientAddress1: o._raw?.address1 ?? m.clientAddress1 ?? "",
            clientAddress2: o._raw?.address2 ?? m.clientAddress2 ?? "",
            clientTown: o._raw?.town ?? m.clientTown ?? "",
            clientPostcode: o._raw?.postcode ?? m.clientPostcode ?? "",
            clientTelNo: o.telNo ?? m.clientTelNo ?? "",
            clientMobile: o._raw?.mobile ?? m.clientMobile ?? "",
        }));
        setLockedClient(true);
        setClientQuery(o.id);
        clientLookup.setOpen(false);
    };
    const pickDriver = (o) => {
        setModel((m) => ({
            ...m,
            driverNo: o.id,
            driverForename: o._raw?.forename ?? m.driverForename ?? "",
            driverSurname: o._raw?.surname ?? m.driverSurname ?? "",
            driverMobile: o.telNo ?? m.driverMobile ?? "",
        }));
        setLockedDriver(true);
        setDriverQuery(o.id);
        driverLookup.setOpen(false);
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const touchedAll = REQUIRED.reduce((acc, k) => ((acc[k] = true), acc), {});
        setTouched((t) => ({ ...t, ...touchedAll }));
        const errs = validate(model);
        setErrors(errs);
        if (Object.keys(errs).length)
            return;
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/bookings/${id}`, model);
                success("Booking updated");
            }
            else {
                await api.post("/bookings", model);
                success("Booking created");
            }
            nav("/bookings");
        }
        catch (err) {
            toastError(err?.response?.data?.message || err.message || "Save failed");
        }
        finally {
            setSaving(false);
        }
    };
    const onDelete = async () => {
        if (!isEdit)
            return;
        if (!window.confirm("Delete this booking? This cannot be undone."))
            return;
        try {
            await api.delete(`/bookings/${id}`);
            success("Booking deleted");
            nav("/bookings");
        }
        catch (err) {
            toastError(err?.response?.data?.message || err.message || "Delete failed");
        }
    };
    const showErr = (k) => (submitted || touched[k] || dirty[k]) && !!errors[k];
    return (_jsxs("div", { className: "max-w-6xl mx-auto px-4 md:px-6 py-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: isEdit ? "Edit Booking" : "New Booking" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: "btn border border-slate-200", onClick: () => nav("/bookings"), children: "Cancel" }), isEdit && (_jsx("button", { type: "button", onClick: onDelete, className: "btn border border-rose-300 text-rose-700 hover:bg-rose-50", children: "Delete" })), _jsx("button", { type: "button", onClick: onSubmit, disabled: saving, className: "btn btn-primary disabled:opacity-60", children: saving ? "Saving…" : "Save" })] })] }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-8", children: [_jsx(Section, { title: "Booking & Company", children: _jsxs(Grid, { children: [_jsxs(L, { label: "Booking Ref", children: [_jsx("input", { className: "input", value: model.bookingRef ?? "", onChange: setField("bookingRef"), onBlur: markTouched("bookingRef") }), showErr("bookingRef") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.bookingRef }))] }), _jsxs("div", { ref: companyBoxRef, className: "relative", children: [_jsx(L, { label: "Account No", children: _jsx("input", { className: "input", value: model.accountNo ?? "", onChange: setField("accountNo"), onFocus: () => companyLookup.setOpen(!!(companyQuery || model.accountNo)) }) }), showErr("accountNo") && (_jsx("div", { className: "text-rose-600 text-xs mt-1 px-1", children: errors.accountNo })), _jsx(Dropdown, { open: companyLookup.open, loading: companyLookup.loading, options: companyLookup.opts, onPick: pickCompany })] }), _jsx(L, { label: "Cost Centre", children: _jsx("input", { className: "input", value: model.costCentre ?? "", onChange: setField("costCentre"), onBlur: markTouched("costCentre") }) }), _jsx(L, { label: "Company Name", children: _jsx("input", { className: `input ${lockedCompany ? "bg-slate-50" : ""}`, value: model.companyName ?? "", onChange: setField("companyName"), onBlur: markTouched("companyName"), disabled: lockedCompany }) }), _jsx(L, { label: "Company Tel No", children: _jsx("input", { className: `input ${lockedCompany ? "bg-slate-50" : ""}`, value: model.companyTelNo ?? "", onChange: setField("companyTelNo"), onBlur: markTouched("companyTelNo"), disabled: lockedCompany }) }), _jsx(L, { label: "VIP", children: _jsx("input", { type: "checkbox", className: "h-4 w-4", checked: !!model.vip, onChange: setField("vip"), onBlur: markTouched("vip"), disabled: lockedCompany }) })] }) }), _jsx(Section, { title: "Contact", children: _jsxs(Grid, { children: [_jsxs("div", { ref: contactBoxRef, className: "relative", children: [_jsx(L, { label: "Contact ID", children: _jsx("input", { className: "input", value: model.contactId ?? "", onChange: setField("contactId"), onFocus: () => contactLookup.setOpen(!!(contactQuery || model.contactId)) }) }), _jsx(Dropdown, { open: contactLookup.open, loading: contactLookup.loading, options: contactLookup.opts, onPick: pickContact })] }), _jsx(L, { label: "Forename", children: _jsx("input", { className: `input ${lockedContact ? "bg-slate-50" : ""}`, value: model.contactForename ?? "", onChange: setField("contactForename"), onBlur: markTouched("contactForename"), disabled: lockedContact }) }), _jsx(L, { label: "Surname", children: _jsx("input", { className: `input ${lockedContact ? "bg-slate-50" : ""}`, value: model.contactSurname ?? "", onChange: setField("contactSurname"), onBlur: markTouched("contactSurname"), disabled: lockedContact }) }), _jsx(L, { label: "Tel No", children: _jsx("input", { className: `input ${lockedContact ? "bg-slate-50" : ""}`, value: model.contactTelNo ?? "", onChange: setField("contactTelNo"), onBlur: markTouched("contactTelNo"), disabled: lockedContact }) })] }) }), _jsx(Section, { title: "Staff & Client", children: _jsxs(Grid, { children: [_jsxs("div", { ref: staffBoxRef, className: "relative", children: [_jsx(L, { label: "Staff ID", children: _jsx("input", { className: "input", value: model.staffId ?? "", onChange: setField("staffId"), onFocus: () => staffLookup.setOpen(!!(staffQuery || model.staffId)) }) }), _jsx(Dropdown, { open: staffLookup.open, loading: staffLookup.loading, options: staffLookup.opts, onPick: pickStaff })] }), _jsx(L, { label: "Staff Forename", children: _jsx("input", { className: `input ${lockedStaff ? "bg-slate-50" : ""}`, value: model.staffForename ?? "", onChange: setField("staffForename"), onBlur: markTouched("staffForename"), disabled: lockedStaff }) }), _jsx(L, { label: "Staff Surname", children: _jsx("input", { className: `input ${lockedStaff ? "bg-slate-50" : ""}`, value: model.staffSurname ?? "", onChange: setField("staffSurname"), onBlur: markTouched("staffSurname"), disabled: lockedStaff }) }), _jsx(L, { label: "Staff Tel No", children: _jsx("input", { className: `input ${lockedStaff ? "bg-slate-50" : ""}`, value: model.staffTelNo ?? "", onChange: setField("staffTelNo"), onBlur: markTouched("staffTelNo"), disabled: lockedStaff }) }), _jsxs(L, { label: "Date Taken", children: [_jsx("input", { type: "date", className: "input", value: model.dateTaken ?? "", onChange: setField("dateTaken"), onBlur: markTouched("dateTaken") }), showErr("dateTaken") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.dateTaken }))] }), _jsxs(L, { label: "Time Taken", children: [_jsx("input", { className: "input", placeholder: "HH:mm", value: model.timeTaken ?? "", onChange: setField("timeTaken"), onBlur: markTouched("timeTaken") }), showErr("timeTaken") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.timeTaken }))] }), _jsxs("div", { ref: clientBoxRef, className: "relative", children: [_jsx(L, { label: "Client ID", children: _jsx("input", { className: "input", value: model.clientId ?? "", onChange: setField("clientId"), onFocus: () => clientLookup.setOpen(!!(clientQuery || model.clientId)) }) }), _jsx(Dropdown, { open: clientLookup.open, loading: clientLookup.loading, options: clientLookup.opts, onPick: pickClient })] }), _jsx(L, { label: "Client Forename", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientForename ?? "", onChange: setField("clientForename"), onBlur: markTouched("clientForename"), disabled: lockedClient }) }), _jsx(L, { label: "Client Surname", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientSurname ?? "", onChange: setField("clientSurname"), onBlur: markTouched("clientSurname"), disabled: lockedClient }) }), _jsx(L, { label: "Client Address 1", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientAddress1 ?? "", onChange: setField("clientAddress1"), onBlur: markTouched("clientAddress1"), disabled: lockedClient }) }), _jsx(L, { label: "Client Address 2", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientAddress2 ?? "", onChange: setField("clientAddress2"), onBlur: markTouched("clientAddress2"), disabled: lockedClient }) }), _jsx(L, { label: "Client Town", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientTown ?? "", onChange: setField("clientTown"), onBlur: markTouched("clientTown"), disabled: lockedClient }) }), _jsx(L, { label: "Client Postcode", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientPostcode ?? "", onChange: setField("clientPostcode"), onBlur: markTouched("clientPostcode"), disabled: lockedClient }) }), _jsx(L, { label: "Client Tel No", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientTelNo ?? "", onChange: setField("clientTelNo"), onBlur: markTouched("clientTelNo"), disabled: lockedClient }) }), _jsx(L, { label: "Client Mobile", children: _jsx("input", { className: `input ${lockedClient ? "bg-slate-50" : ""}`, value: model.clientMobile ?? "", onChange: setField("clientMobile"), onBlur: markTouched("clientMobile"), disabled: lockedClient }) })] }) }), _jsx(Section, { title: "Driver & Trip", children: _jsxs(Grid, { children: [_jsxs("div", { ref: driverBoxRef, className: "relative", children: [_jsx(L, { label: "Driver No", children: _jsx("input", { className: "input", value: model.driverNo ?? "", onChange: setField("driverNo"), onFocus: () => driverLookup.setOpen(!!(driverQuery || model.driverNo)) }) }), _jsx(Dropdown, { open: driverLookup.open, loading: driverLookup.loading, options: driverLookup.opts, onPick: pickDriver })] }), _jsx(L, { label: "Driver Forename", children: _jsx("input", { className: `input ${lockedDriver ? "bg-slate-50" : ""}`, value: model.driverForename ?? "", onChange: setField("driverForename"), onBlur: markTouched("driverForename"), disabled: lockedDriver }) }), _jsx(L, { label: "Driver Surname", children: _jsx("input", { className: `input ${lockedDriver ? "bg-slate-50" : ""}`, value: model.driverSurname ?? "", onChange: setField("driverSurname"), onBlur: markTouched("driverSurname"), disabled: lockedDriver }) }), _jsx(L, { label: "Driver Mobile", children: _jsx("input", { className: `input ${lockedDriver ? "bg-slate-50" : ""}`, value: model.driverMobile ?? "", onChange: setField("driverMobile"), onBlur: markTouched("driverMobile"), disabled: lockedDriver }) }), _jsxs(L, { label: "Date *", children: [_jsx("input", { type: "date", className: "input", value: model.date ?? "", onChange: setField("date"), onBlur: markTouched("date") }), showErr("date") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.date }))] }), _jsxs(L, { label: "Time *", children: [_jsx("input", { className: "input", placeholder: "HH:mm", value: model.time ?? "", onChange: setField("time"), onBlur: markTouched("time") }), showErr("time") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.time }))] }), _jsxs(L, { label: "Vehicle *", children: [_jsx("input", { className: "input", value: model.vehicle ?? "", onChange: setField("vehicle"), onBlur: markTouched("vehicle") }), showErr("vehicle") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.vehicle }))] }), _jsx(L, { label: "Details Given", children: _jsx("input", { type: "checkbox", className: "h-4 w-4", checked: !!model.detailsGiven, onChange: setField("detailsGiven"), onBlur: markTouched("detailsGiven") }) }), _jsx(L, { label: "Cancelled", children: _jsx("input", { type: "checkbox", className: "h-4 w-4", checked: !!model.cancelled, onChange: setField("cancelled"), onBlur: markTouched("cancelled") }) }), _jsx("div", { className: "md:col-span-2", children: _jsxs(L, { label: "Pick Up Address *", children: [_jsx("textarea", { className: "input h-24", value: model.pickUpAddress ?? "", onChange: setField("pickUpAddress"), onBlur: markTouched("pickUpAddress") }), showErr("pickUpAddress") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.pickUpAddress }))] }) }), _jsx("div", { className: "md:col-span-2", children: _jsxs(L, { label: "Drop Off Address *", children: [_jsx("textarea", { className: "input h-24", value: model.dropOffAddress ?? "", onChange: setField("dropOffAddress"), onBlur: markTouched("dropOffAddress") }), showErr("dropOffAddress") && (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors.dropOffAddress }))] }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(L, { label: "Via", children: _jsx("textarea", { className: "input h-20", value: model.via ?? "", onChange: setField("via"), onBlur: markTouched("via") }) }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(L, { label: "Extra Info", children: _jsx("textarea", { className: "input h-20", value: model.extraInfo ?? "", onChange: setField("extraInfo"), onBlur: markTouched("extraInfo") }) }) })] }) }), _jsxs("details", { className: "bg-white border border-slate-200 rounded-xl open:shadow-sm", children: [_jsx("summary", { className: "cursor-pointer select-none px-4 py-3 font-medium", children: "Fare Breakdown" }), _jsxs("div", { className: "p-4 border-t grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-3", children: "Client" }), _jsxs(Grid, { children: [_jsx(MoneyField, { name: "clientScheduledFare", label: "Scheduled Fare", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientScheduledFare"), error: errors.clientScheduledFare }), _jsx(MoneyField, { name: "clientCharge", label: "C Charge", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientCharge"), error: errors.clientCharge }), _jsx(MoneyField, { name: "clientMeetGreet", label: "Meet & Greet", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientMeetGreet"), error: errors.clientMeetGreet }), _jsx(MoneyField, { name: "clientLhrGtwCharge", label: "LHR/GTW Charge", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientLhrGtwCharge"), error: errors.clientLhrGtwCharge }), _jsx(MoneyField, { name: "clientViaPrice", label: "Via Price", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientViaPrice"), error: errors.clientViaPrice }), _jsx(MoneyField, { name: "clientGratuity", label: "Gratuity", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientGratuity"), error: errors.clientGratuity }), _jsx(MoneyField, { name: "clientWaitingTime", label: "Waiting Time", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientWaitingTime"), error: errors.clientWaitingTime }), _jsx(MoneyField, { name: "clientWaitingTimePrice", label: "Waiting Time Price", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientWaitingTimePrice"), error: errors.clientWaitingTimePrice }), _jsx(MoneyField, { name: "clientCarPark", label: "Car Park", model: model, setField: setField, markTouched: markTouched, showError: showErr("clientCarPark"), error: errors.clientCarPark }), _jsx(MoneyField, { name: "totalClient", label: "Total", model: model, setField: setField, markTouched: markTouched, showError: showErr("totalClient"), error: errors.totalClient })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-3", children: "Driver" }), _jsxs(Grid, { children: [_jsx(MoneyField, { name: "driverScheduledFare", label: "Scheduled Fare", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverScheduledFare"), error: errors.driverScheduledFare }), _jsx(MoneyField, { name: "driverCharge", label: "C Charge", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverCharge"), error: errors.driverCharge }), _jsx(MoneyField, { name: "driverMeetGreet", label: "Meet & Greet", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverMeetGreet"), error: errors.driverMeetGreet }), _jsx(MoneyField, { name: "driverWaitingTime", label: "Waiting Time", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverWaitingTime"), error: errors.driverWaitingTime }), _jsx(MoneyField, { name: "driverWaitingTimePrice", label: "Waiting Time Price", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverWaitingTimePrice"), error: errors.driverWaitingTimePrice }), _jsx(MoneyField, { name: "driverLhrGtwCharge", label: "LHR/GTW Charge", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverLhrGtwCharge"), error: errors.driverLhrGtwCharge }), _jsx(MoneyField, { name: "driverViaPrice", label: "Via Price", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverViaPrice"), error: errors.driverViaPrice }), _jsx(MoneyField, { name: "driverGratuity", label: "Gratuity", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverGratuity"), error: errors.driverGratuity }), _jsx(MoneyField, { name: "driverCarPark", label: "Car Park", model: model, setField: setField, markTouched: markTouched, showError: showErr("driverCarPark"), error: errors.driverCarPark }), _jsx(MoneyField, { name: "totalDriver", label: "Total", model: model, setField: setField, markTouched: markTouched, showError: showErr("totalDriver"), error: errors.totalDriver })] })] })] })] }), _jsx("div", { className: "md:col-span-2", children: _jsx(L, { label: "Notes", children: _jsx("textarea", { className: "input h-24", value: model.notes ?? "", onChange: setField("notes"), onBlur: markTouched("notes") }) }) }), _jsx("button", { type: "submit", className: "hidden" })] })] }));
}
