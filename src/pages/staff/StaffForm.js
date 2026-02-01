import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
const REQUIRED = ["staffId"];
const norm = (v) => String(v ?? "").trim();
function validate(m) {
    const e = {};
    REQUIRED.forEach((k) => {
        if (!norm(m[k]))
            e[k] = "Required";
    });
    if (m.postcode && !/^[A-Za-z0-9\s-]{3,10}$/.test(m.postcode))
        e.postcode = "Invalid";
    return e;
}
export default function StaffForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { success, error: toastError } = useToast();
    const [model, setModel] = useState({ staffId: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dirty, setDirty] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (!isEdit)
            return;
        api
            .get(`/staff/${id}`)
            .then((r) => setModel(r.data))
            .catch((e) => toastError(e?.response?.data?.message || "Failed to load staff"));
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
                await api.put(`/staff/${id}`, model);
                success("Staff updated");
            }
            else {
                await api.post("/staff", model);
                success("Staff created");
            }
            nav("/staff");
        }
        catch (err) {
            toastError(err?.response?.data?.message || err.message || "Save failed");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto px-4 md:px-6 py-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: isEdit ? "Edit Staff" : "New Staff" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: "btn border border-slate-200", onClick: () => nav("/staff"), children: "Cancel" }), _jsx("button", { type: "submit", form: "staff-form", disabled: saving, className: "btn btn-primary disabled:opacity-60", children: saving ? "Saving…" : "Save" })] })] }), _jsxs("form", { id: "staff-form", onSubmit: onSubmit, className: "space-y-8", children: [_jsxs("div", { className: "bg-white border border-slate-200 rounded-xl shadow-sm", children: [_jsx("div", { className: "px-4 py-3 border-b font-medium", children: "Staff" }), _jsxs("div", { className: "p-4 grid md:grid-cols-2 gap-4", children: [_jsxs(L, { label: "Staff ID *", children: [_jsx("input", { className: "input", value: model.staffId, onChange: set("staffId") }), E("staffId")] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(L, { label: "Forename", children: _jsx("input", { className: "input", value: model.forename ?? "", onChange: set("forename") }) }), _jsx(L, { label: "Surname", children: _jsx("input", { className: "input", value: model.surname ?? "", onChange: set("surname") }) })] }), _jsx("div", { className: "md:col-span-2", children: _jsx(L, { label: "Address", children: _jsx("input", { className: "input", value: model.address1 ?? "", onChange: set("address1") }) }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(L, { label: "Address 2", children: _jsx("input", { className: "input", value: model.address2 ?? "", onChange: set("address2") }) }) }), _jsx(L, { label: "Town", children: _jsx("input", { className: "input", value: model.town ?? "", onChange: set("town") }) }), _jsx(L, { label: "County", children: _jsx("input", { className: "input", value: model.county ?? "", onChange: set("county") }) }), _jsxs(L, { label: "Postcode", children: [_jsx("input", { className: "input", value: model.postcode ?? "", onChange: set("postcode") }), E("postcode")] }), _jsx(L, { label: "Tel No", children: _jsx("input", { className: "input", value: model.telNo ?? "", onChange: set("telNo") }) }), _jsx(L, { label: "Mobile", children: _jsx("input", { className: "input", value: model.mobile ?? "", onChange: set("mobile") }) }), _jsx(L, { label: "DOB", children: _jsx("input", { type: "date", className: "input", value: model.dob ?? "", onChange: set("dob") }) }), _jsx(L, { label: "National Insurance No", children: _jsx("input", { className: "input", value: model.nationalInsuranceNo ?? "", onChange: set("nationalInsuranceNo") }) }), _jsx(L, { label: "Start Date", children: _jsx("input", { type: "date", className: "input", value: model.startDate ?? "", onChange: set("startDate") }) }), _jsx(L, { label: "Finish Date", children: _jsx("input", { type: "date", className: "input", value: model.finishDate ?? "", onChange: set("finishDate") }) })] })] }), _jsx("button", { type: "submit", className: "hidden" })] })] }));
}
function L({ label, children }) {
    return (_jsxs("label", { className: "block", children: [_jsx("div", { className: "text-sm text-slate-600 mb-1", children: label }), children] }));
}
