import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
const REQUIRED = ["clientId"];
const norm = (v) => String(v ?? "").trim();
function validate(m) {
    const e = {};
    REQUIRED.forEach((k) => {
        if (!norm(m[k]))
            e[k] = "Required";
    });
    // simple sanity for phones/postcode (non-blocking if empty)
    if (m.postcode && !/^[A-Za-z0-9\s-]{3,10}$/.test(m.postcode))
        e.postcode = "Invalid";
    if (m.telNo && !/^[+0-9()\s-]{5,20}$/.test(m.telNo))
        e.telNo = "Invalid";
    if (m.mobile && !/^[+0-9()\s-]{5,20}$/.test(m.mobile))
        e.mobile = "Invalid";
    return e;
}
export default function ClientForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { success, error: toastError } = useToast();
    const [model, setModel] = useState({ clientId: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dirty, setDirty] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (!isEdit)
            return;
        api
            .get(`/clients/${id}`)
            .then((r) => setModel(r.data))
            .catch((e) => {
            toastError(e?.response?.data?.message || "Failed to load client");
        });
    }, [id, isEdit, toastError]);
    useEffect(() => {
        setErrors(validate(model));
    }, [model]);
    const set = (k) => (e) => {
        const v = e?.target?.value?.trim?.() ?? e?.target?.value;
        setModel((m) => ({ ...m, [k]: v }));
        setTouched((t) => ({ ...t, [k]: true }));
        setDirty((d) => ({ ...d, [k]: true }));
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
                await api.put(`/clients/${id}`, model);
                success("Client updated");
            }
            else {
                await api.post("/clients", model);
                success("Client created");
            }
            nav("/clients");
        }
        catch (err) {
            toastError(err?.response?.data?.message || err.message || "Save failed");
        }
        finally {
            setSaving(false);
        }
    };
    const E = (k) => (submitted || touched[k] || dirty[k]) && errors[k] ? (_jsx("div", { className: "text-rose-600 text-xs mt-1", children: errors[k] })) : null;
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 md:px-6 py-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: isEdit ? "Edit Client" : "New Client" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: "btn border border-slate-200", onClick: () => nav("/clients"), children: "Cancel" }), _jsx("button", { type: "button", onClick: onSubmit, disabled: saving, className: "btn btn-primary disabled:opacity-60", children: saving ? "Saving…" : "Save" })] })] }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-8", children: [_jsxs("div", { className: "bg-white border border-slate-200 rounded-xl shadow-sm", children: [_jsx("div", { className: "px-4 py-3 border-b font-medium", children: "Client" }), _jsxs("div", { className: "p-4 grid md:grid-cols-2 gap-4", children: [_jsxs(L, { label: "Client ID *", children: [_jsx("input", { className: "input", value: model.clientId, onChange: set("clientId") }), E("clientId")] }), _jsxs(L, { label: "Account No", children: [_jsx("input", { className: "input", value: model.accountNo ?? "", onChange: set("accountNo") }), E("accountNo")] }), _jsxs(L, { label: "Forename", children: [_jsx("input", { className: "input", value: model.forename ?? "", onChange: set("forename") }), E("forename")] }), _jsxs(L, { label: "Surname", children: [_jsx("input", { className: "input", value: model.surname ?? "", onChange: set("surname") }), E("surname")] }), _jsx("div", { className: "md:col-span-2", children: _jsxs(L, { label: "Address 1", children: [_jsx("input", { className: "input", value: model.address1 ?? "", onChange: set("address1") }), E("address1")] }) }), _jsx("div", { className: "md:col-span-2", children: _jsxs(L, { label: "Address 2", children: [_jsx("input", { className: "input", value: model.address2 ?? "", onChange: set("address2") }), E("address2")] }) }), _jsxs(L, { label: "Town", children: [_jsx("input", { className: "input", value: model.town ?? "", onChange: set("town") }), E("town")] }), _jsxs(L, { label: "County", children: [_jsx("input", { className: "input", value: model.county ?? "", onChange: set("county") }), E("county")] }), _jsxs(L, { label: "Postcode", children: [_jsx("input", { className: "input", value: model.postcode ?? "", onChange: set("postcode") }), E("postcode")] }), _jsxs(L, { label: "Tel No", children: [_jsx("input", { className: "input", value: model.telNo ?? "", onChange: set("telNo") }), E("telNo")] }), _jsxs(L, { label: "Client Mobile", children: [_jsx("input", { className: "input", value: model.mobile ?? "", onChange: set("mobile") }), E("mobile")] })] })] }), _jsx("button", { type: "submit", className: "hidden" })] })] }));
}
function L({ label, children }) {
    return (_jsxs("label", { className: "block", children: [_jsx("div", { className: "text-sm text-slate-600 mb-1", children: label }), children] }));
}
