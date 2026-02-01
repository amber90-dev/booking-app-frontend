import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
const REQUIRED = ["accountNo", "name"];
const norm = (v) => String(v ?? "").trim();
function validate(m) {
    const e = {};
    REQUIRED.forEach((k) => {
        if (!norm(m[k]))
            e[k] = "Required";
    });
    if (m.postcode && !/^[A-Za-z0-9\s-]{3,10}$/.test(m.postcode))
        e.postcode = "Invalid";
    if (m.telNo && !/^[+0-9()\s-]{5,20}$/.test(m.telNo))
        e.telNo = "Invalid";
    if (m.faxNo && !/^[+0-9()\s-]{5,20}$/.test(m.faxNo))
        e.faxNo = "Invalid";
    if (m.surcharge && !/^-?\d+(\.\d{1,2})?$/.test(m.surcharge))
        e.surcharge = "Invalid amount";
    if (m.daysToPay !== null &&
        m.daysToPay !== undefined &&
        String(m.daysToPay) !== "" &&
        !/^\d+$/.test(String(m.daysToPay)))
        e.daysToPay = "Must be integer";
    return e;
}
export default function CompanyForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { success, error: toastError } = useToast();
    const [model, setModel] = useState({ accountNo: "", name: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dirty, setDirty] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (!isEdit)
            return;
        api
            .get(`/companies/${id}`)
            .then((r) => setModel(r.data))
            .catch((e) => toastError(e?.response?.data?.message || "Failed to load company"));
    }, [id, isEdit, toastError]);
    useEffect(() => {
        setErrors(validate(model));
    }, [model]);
    const set = (k) => (e) => {
        let v = e.target.value;
        if (k === "daysToPay")
            v = v === "" ? null : Number(v);
        setModel((m) => ({ ...m, [k]: v }));
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
                await api.put(`/companies/${id}`, model);
                success("Company updated");
            }
            else {
                await api.post("/companies", model);
                success("Company created");
            }
            nav("/companies");
        }
        catch (err) {
            toastError(err?.response?.data?.message || err.message || "Save failed");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto px-4 md:px-6 py-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: isEdit ? "Edit Company" : "New Company" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: "btn border border-slate-200", onClick: () => nav("/companies"), children: "Cancel" }), _jsx("button", { type: "submit", form: "company-form", disabled: saving, className: "btn btn-primary disabled:opacity-60", children: saving ? "Saving…" : "Save" })] })] }), _jsxs("form", { id: "company-form", onSubmit: onSubmit, className: "space-y-8", children: [_jsxs("div", { className: "bg-white border border-slate-200 rounded-xl shadow-sm", children: [_jsx("div", { className: "px-4 py-3 border-b font-medium", children: "Company" }), _jsxs("div", { className: "p-4 grid md:grid-cols-2 gap-4", children: [_jsxs(L, { label: "Account No *", children: [_jsx("input", { className: "input", value: model.accountNo, onChange: set("accountNo") }), E("accountNo")] }), _jsxs(L, { label: "Company Name *", children: [_jsx("input", { className: "input", value: model.name, onChange: set("name") }), E("name")] }), _jsx("div", { className: "md:col-span-2", children: _jsxs(L, { label: "Company Address", children: [_jsx("input", { className: "input", value: model.address1 ?? "", onChange: set("address1") }), E("address1")] }) }), _jsx("div", { className: "md:col-span-2", children: _jsxs(L, { label: "Company Address 2", children: [_jsx("input", { className: "input", value: model.address2 ?? "", onChange: set("address2") }), E("address2")] }) }), _jsxs(L, { label: "Company Town", children: [_jsx("input", { className: "input", value: model.town ?? "", onChange: set("town") }), E("town")] }), _jsxs(L, { label: "Company County", children: [_jsx("input", { className: "input", value: model.county ?? "", onChange: set("county") }), E("county")] }), _jsxs(L, { label: "Company Postcode", children: [_jsx("input", { className: "input", value: model.postcode ?? "", onChange: set("postcode") }), E("postcode")] }), _jsxs(L, { label: "Company Tel No", children: [_jsx("input", { className: "input", value: model.telNo ?? "", onChange: set("telNo") }), E("telNo")] }), _jsxs(L, { label: "Company Fax No", children: [_jsx("input", { className: "input", value: model.faxNo ?? "", onChange: set("faxNo") }), E("faxNo")] }), _jsxs(L, { label: "Days to pay", children: [_jsx("input", { className: "input", inputMode: "numeric", value: model.daysToPay ?? "", onChange: set("daysToPay") }), E("daysToPay")] }), _jsxs(L, { label: "Surcharge", children: [_jsx("input", { className: "input", value: model.surcharge ?? "", onChange: set("surcharge") }), E("surcharge")] }), _jsx("div", { className: "md:col-span-2", children: _jsx(L, { label: "Notes", children: _jsx("textarea", { className: "input h-24", value: model.notes ?? "", onChange: set("notes") }) }) })] })] }), _jsx("button", { type: "submit", className: "hidden" })] })] }));
}
function L({ label, children }) {
    return (_jsxs("label", { className: "block", children: [_jsx("div", { className: "text-sm text-slate-600 mb-1", children: label }), children] }));
}
