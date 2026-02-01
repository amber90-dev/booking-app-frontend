import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
const REQUIRED = ["registrationNo"];
const norm = (v) => String(v ?? "").trim();
function validate(m) {
    const e = {};
    REQUIRED.forEach((k) => {
        if (!norm(m[k]))
            e[k] = "Required";
    });
    if (m.keeperPostcode && !/^[A-Za-z0-9\s-]{3,10}$/.test(m.keeperPostcode))
        e.keeperPostcode = "Invalid";
    return e;
}
export default function VehicleForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { success, error: toastError } = useToast();
    const [model, setModel] = useState({ registrationNo: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dirty, setDirty] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (!isEdit)
            return;
        api
            .get(`/vehicles/${id}`)
            .then((r) => setModel(r.data))
            .catch((e) => toastError(e?.response?.data?.message || "Failed to load vehicle"));
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
                await api.put(`/vehicles/${id}`, model);
                success("Vehicle updated");
            }
            else {
                await api.post("/vehicles", model);
                success("Vehicle created");
            }
            nav("/vehicles");
        }
        catch (err) {
            toastError(err?.response?.data?.message || err.message || "Save failed");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto px-4 md:px-6 py-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: isEdit ? "Edit Vehicle" : "New Vehicle" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: "btn border border-slate-200", onClick: () => nav("/vehicles"), children: "Cancel" }), _jsx("button", { type: "submit", form: "vehicle-form", disabled: saving, className: "btn btn-primary disabled:opacity-60", children: saving ? "Saving…" : "Save" })] })] }), _jsxs("form", { id: "vehicle-form", onSubmit: onSubmit, className: "space-y-8", children: [_jsxs("div", { className: "bg-white border border-slate-200 rounded-xl shadow-sm", children: [_jsx("div", { className: "px-4 py-3 border-b font-medium", children: "Vehicle" }), _jsxs("div", { className: "p-4 grid md:grid-cols-2 gap-4", children: [_jsx(L, { label: "Vehicle ID", children: _jsx("input", { className: "input", value: model.vehicleId ?? "", onChange: set("vehicleId") }) }), _jsx(L, { label: "Driver No", children: _jsx("input", { className: "input", value: model.driverNo ?? "", onChange: set("driverNo") }) }), _jsx(L, { label: "Registered Keeper", children: _jsx("input", { className: "input", value: model.registeredKeeper ?? "", onChange: set("registeredKeeper") }) }), _jsx(L, { label: "Address of Reg Keeper", children: _jsx("input", { className: "input", value: model.keeperAddress ?? "", onChange: set("keeperAddress") }) }), _jsxs(L, { label: "Postcode of Reg Keeper", children: [_jsx("input", { className: "input", value: model.keeperPostcode ?? "", onChange: set("keeperPostcode") }), E("keeperPostcode")] }), _jsx(L, { label: "Make", children: _jsx("input", { className: "input", value: model.make ?? "", onChange: set("make") }) }), _jsx(L, { label: "Model", children: _jsx("input", { className: "input", value: model.model ?? "", onChange: set("model") }) }), _jsxs(L, { label: "Registration No *", children: [_jsx("input", { className: "input", value: model.registrationNo, onChange: set("registrationNo") }), E("registrationNo")] }), _jsx(L, { label: "Colour", children: _jsx("input", { className: "input", value: model.colour ?? "", onChange: set("colour") }) }), _jsx(L, { label: "MOT Expiry Date", children: _jsx("input", { type: "date", className: "input", value: model.motExpiryDate ?? "", onChange: set("motExpiryDate") }) }), _jsx(L, { label: "Cert Of Ins Expiry Date", children: _jsx("input", { type: "date", className: "input", value: model.certOfInsExpiryDate ?? "", onChange: set("certOfInsExpiryDate") }) }), _jsx(L, { label: "Car First Available", children: _jsx("input", { type: "date", className: "input", value: model.carFirstAvailable ?? "", onChange: set("carFirstAvailable") }) }), _jsx(L, { label: "Car Ceased To Be Available", children: _jsx("input", { type: "date", className: "input", value: model.carCeasedToBeAvailable ?? "", onChange: set("carCeasedToBeAvailable") }) }), _jsx(L, { label: "PCO Driver Expiry", children: _jsx("input", { type: "date", className: "input", value: model.pcoDriverExpiry ?? "", onChange: set("pcoDriverExpiry") }) }), _jsx(L, { label: "PCO Vehicle Expiry", children: _jsx("input", { type: "date", className: "input", value: model.pcoVehicleExpiry ?? "", onChange: set("pcoVehicleExpiry") }) })] })] }), _jsx("button", { type: "submit", className: "hidden" })] })] }));
}
function L({ label, children }) {
    return (_jsxs("label", { className: "block", children: [_jsx("div", { className: "text-sm text-slate-600 mb-1", children: label }), children] }));
}
