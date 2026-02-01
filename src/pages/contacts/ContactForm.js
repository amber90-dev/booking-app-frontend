import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
const REQUIRED = []; // none strictly required per legacy UI
const norm = (v) => String(v ?? "").trim();
function validate(m) {
    const e = {};
    REQUIRED.forEach((k) => {
        if (!norm(m[k]))
            e[k] = "Required";
    });
    if (m.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))
        e.email = "Invalid";
    return e;
}
export default function ContactForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { success, error: toastError } = useToast();
    const [model, setModel] = useState({});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dirty, setDirty] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (!isEdit)
            return;
        api
            .get(`/contacts/${id}`)
            .then((r) => setModel(r.data))
            .catch((e) => toastError(e?.response?.data?.message || "Failed to load contact"));
    }, [id, isEdit, toastError]);
    useEffect(() => {
        setErrors(validate(model));
    }, [model]);
    const set = (k) => (e) => {
        setModel((m) => ({ ...m, [k]: e.target.value }));
        setTouched((t) => ({ ...t, [k]: true }));
        setDirty((d) => ({ ...d, [k]: true }));
    };
    const E = (k) => (submitted || touched[k] || dirty[k]) && errors[k] ? (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors[k] })) : null;
    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const errs = validate(model);
        setErrors(errs);
        if (Object.keys(errs).length)
            return;
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/contacts/${id}`, model);
                success("Contact updated");
            }
            else {
                await api.post("/contacts", model);
                success("Contact created");
            }
            nav("/contacts");
        }
        catch (err) {
            toastError(err?.response?.data?.message || err.message || "Save failed");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 md:px-6 py-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: isEdit ? "Edit Contact" : "New Contact" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: "btn border border-slate-200", onClick: () => nav("/contacts"), children: "Cancel" }), _jsx("button", { type: "submit", form: "contact-form", disabled: saving, className: "btn btn-primary disabled:opacity-60", children: saving ? "Saving…" : "Save" })] })] }), _jsxs("form", { id: "contact-form", onSubmit: onSubmit, className: "bg-white border border-slate-200 rounded-xl shadow-sm p-4 grid md:grid-cols-2 gap-4", children: [_jsxs(L, { label: "Contact ID", children: [_jsx("input", { className: "input", value: model.contactId ?? "", onChange: set("contactId") }), E("contactId")] }), _jsxs(L, { label: "Account No", children: [_jsx("input", { className: "input", value: model.accountNo ?? "", onChange: set("accountNo") }), E("accountNo")] }), _jsxs(L, { label: "Forename", children: [_jsx("input", { className: "input", value: model.forename ?? "", onChange: set("forename") }), E("forename")] }), _jsxs(L, { label: "Surname", children: [_jsx("input", { className: "input", value: model.surname ?? "", onChange: set("surname") }), E("surname")] }), _jsxs(L, { label: "Tel No", children: [_jsx("input", { className: "input", value: model.telNo ?? "", onChange: set("telNo") }), E("telNo")] }), _jsxs(L, { label: "Email", children: [_jsx("input", { className: "input", value: model.email ?? "", onChange: set("email") }), E("email")] }), _jsx("button", { type: "submit", className: "hidden" })] })] }));
}
function L({ label, children }) {
    return (_jsxs("label", { className: "block", children: [_jsx("div", { className: "text-sm text-slate-600 mb-1", children: label }), children] }));
}
