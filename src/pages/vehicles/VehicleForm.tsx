import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type Vehicle = {
  id?: string;
  vehicleId?: string | null;
  driverNo?: string | null;
  registeredKeeper?: string | null;
  keeperAddress?: string | null;
  keeperPostcode?: string | null;
  make?: string | null;
  model?: string | null;
  registrationNo: string; // required
  colour?: string | null;

  motExpiryDate?: string | null;
  certOfInsExpiryDate?: string | null;
  carFirstAvailable?: string | null;
  carCeasedToBeAvailable?: string | null;
  pcoDriverExpiry?: string | null;
  pcoVehicleExpiry?: string | null;
};

type Errors = Partial<Record<keyof Vehicle, string>>;
const REQUIRED: (keyof Vehicle)[] = ["registrationNo"];

const norm = (v: unknown) => String(v ?? "").trim();
function validate(m: Vehicle): Errors {
  const e: Errors = {};
  REQUIRED.forEach((k) => {
    if (!norm((m as any)[k])) e[k] = "Required";
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

  const [model, setModel] = useState<Vehicle>({ registrationNo: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/vehicles/${id}`)
      .then((r) => setModel(r.data))
      .catch((e) =>
        toastError(e?.response?.data?.message || "Failed to load vehicle")
      );
  }, [id, isEdit, toastError]);

  useEffect(() => {
    setErrors(validate(model));
  }, [model]);

  const set =
    (k: keyof Vehicle) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setModel((m) => ({ ...m, [k]: e.target.value }));
      setTouched((t) => ({ ...t, [k]: true }));
      setDirty((d) => ({ ...d, [k]: true }));
    };

  const E = (k: keyof Vehicle) =>
    (submitted || touched[k] || dirty[k]) && errors[k] ? (
      <div className="text-rose-600 text-xs mt-1">{errors[k]}</div>
    ) : null;

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(model);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/vehicles/${id}`, model);
        success("Vehicle updated");
      } else {
        await api.post("/vehicles", model);
        success("Vehicle created");
      }
      nav("/vehicles");
    } catch (err: any) {
      toastError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Vehicle" : "New Vehicle"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn border border-slate-200"
            onClick={() => nav("/vehicles")}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="vehicle-form"
            disabled={saving}
            className="btn btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <form id="vehicle-form" onSubmit={onSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b font-medium">Vehicle</div>
          <div className="p-4 grid md:grid-cols-2 gap-4">
            <L label="Vehicle ID">
              <input
                className="input"
                value={model.vehicleId ?? ""}
                onChange={set("vehicleId")}
              />
            </L>
            <L label="Driver No">
              <input
                className="input"
                value={model.driverNo ?? ""}
                onChange={set("driverNo")}
              />
            </L>

            <L label="Registered Keeper">
              <input
                className="input"
                value={model.registeredKeeper ?? ""}
                onChange={set("registeredKeeper")}
              />
            </L>
            <L label="Address of Reg Keeper">
              <input
                className="input"
                value={model.keeperAddress ?? ""}
                onChange={set("keeperAddress")}
              />
            </L>
            <L label="Postcode of Reg Keeper">
              <input
                className="input"
                value={model.keeperPostcode ?? ""}
                onChange={set("keeperPostcode")}
              />
              {E("keeperPostcode")}
            </L>

            <L label="Make">
              <input
                className="input"
                value={model.make ?? ""}
                onChange={set("make")}
              />
            </L>
            <L label="Model">
              <input
                className="input"
                value={model.model ?? ""}
                onChange={set("model")}
              />
            </L>

            <L label="Registration No *">
              <input
                className="input"
                value={model.registrationNo}
                onChange={set("registrationNo")}
              />
              {E("registrationNo")}
            </L>
            <L label="Colour">
              <input
                className="input"
                value={model.colour ?? ""}
                onChange={set("colour")}
              />
            </L>

            <L label="MOT Expiry Date">
              <input
                type="date"
                className="input"
                value={model.motExpiryDate ?? ""}
                onChange={set("motExpiryDate")}
              />
            </L>
            <L label="Cert Of Ins Expiry Date">
              <input
                type="date"
                className="input"
                value={model.certOfInsExpiryDate ?? ""}
                onChange={set("certOfInsExpiryDate")}
              />
            </L>

            <L label="Car First Available">
              <input
                type="date"
                className="input"
                value={model.carFirstAvailable ?? ""}
                onChange={set("carFirstAvailable")}
              />
            </L>
            <L label="Car Ceased To Be Available">
              <input
                type="date"
                className="input"
                value={model.carCeasedToBeAvailable ?? ""}
                onChange={set("carCeasedToBeAvailable")}
              />
            </L>

            <L label="PCO Driver Expiry">
              <input
                type="date"
                className="input"
                value={model.pcoDriverExpiry ?? ""}
                onChange={set("pcoDriverExpiry")}
              />
            </L>
            <L label="PCO Vehicle Expiry">
              <input
                type="date"
                className="input"
                value={model.pcoVehicleExpiry ?? ""}
                onChange={set("pcoVehicleExpiry")}
              />
            </L>
          </div>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}
