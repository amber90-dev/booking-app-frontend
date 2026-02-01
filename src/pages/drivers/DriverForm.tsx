import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type Driver = {
  id?: string;
  driverNo: string;
  forename?: string | null;
  surname?: string | null;
  telNo?: string | null;
  mobile?: string | null;
  address1?: string | null;
  address2?: string | null;
  town?: string | null;
  county?: string | null;
  postcode?: string | null;
  dateOfBirth?: string | null;
  nationalInsuranceNo?: string | null;
  startDate?: string | null;
  finishDate?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
};

type Errors = Partial<Record<keyof Driver, string>>;
const REQUIRED: (keyof Driver)[] = ["driverNo"];

const norm = (v: unknown) => String(v ?? "").trim();
function validate(m: Driver): Errors {
  const e: Errors = {};
  REQUIRED.forEach((k) => {
    if (!norm((m as any)[k])) e[k] = "Required";
  });
  if (m.postcode && !/^[A-Za-z0-9\s-]{3,10}$/.test(m.postcode))
    e.postcode = "Invalid";
  return e;
}

export default function DriverForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { success, error: toastError } = useToast();

  const [model, setModel] = useState<Driver>({ driverNo: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/drivers/${id}`)
      .then((r) => setModel(r.data))
      .catch((e) =>
        toastError(e?.response?.data?.message || "Failed to load driver")
      );
  }, [id, isEdit, toastError]);

  useEffect(() => {
    setErrors(validate(model));
  }, [model]);

  const set =
    (k: keyof Driver) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setModel((m) => ({ ...m, [k]: e.target.value }));
      setTouched((t) => ({ ...t, [k]: true }));
      setDirty((d) => ({ ...d, [k]: true }));
    };

  const E = (k: keyof Driver) =>
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
        await api.put(`/drivers/${id}`, model);
        success("Driver updated");
      } else {
        await api.post("/drivers", model);
        success("Driver created");
      }
      nav("/drivers");
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
          {isEdit ? "Edit Driver" : "New Driver"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn border border-slate-200"
            onClick={() => nav("/drivers")}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="driver-form"
            disabled={saving}
            className="btn btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <form id="driver-form" onSubmit={onSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b font-medium">Driver</div>
          <div className="p-4 grid md:grid-cols-2 gap-4">
            <L label="Driver No *">
              <input
                className="input"
                value={model.driverNo}
                onChange={set("driverNo")}
              />
              {E("driverNo")}
            </L>
            <div className="grid grid-cols-2 gap-4">
              <L label="Forename">
                <input
                  className="input"
                  value={model.forename ?? ""}
                  onChange={set("forename")}
                />
              </L>
              <L label="Surname">
                <input
                  className="input"
                  value={model.surname ?? ""}
                  onChange={set("surname")}
                />
              </L>
            </div>

            <L label="Tel No">
              <input
                className="input"
                value={model.telNo ?? ""}
                onChange={set("telNo")}
              />
            </L>
            <L label="Mobile">
              <input
                className="input"
                value={model.mobile ?? ""}
                onChange={set("mobile")}
              />
            </L>

            <div className="md:col-span-2">
              <L label="Address">
                <input
                  className="input"
                  value={model.address1 ?? ""}
                  onChange={set("address1")}
                />
              </L>
            </div>
            <div className="md:col-span-2">
              <L label="Address 2">
                <input
                  className="input"
                  value={model.address2 ?? ""}
                  onChange={set("address2")}
                />
              </L>
            </div>

            <L label="Town">
              <input
                className="input"
                value={model.town ?? ""}
                onChange={set("town")}
              />
            </L>
            <L label="County">
              <input
                className="input"
                value={model.county ?? ""}
                onChange={set("county")}
              />
            </L>
            <L label="Postcode">
              <input
                className="input"
                value={model.postcode ?? ""}
                onChange={set("postcode")}
              />
              {E("postcode")}
            </L>

            <L label="Date Of Birth">
              <input
                type="date"
                className="input"
                value={model.dateOfBirth ?? ""}
                onChange={set("dateOfBirth")}
              />
            </L>
            <L label="National Insurance No">
              <input
                className="input"
                value={model.nationalInsuranceNo ?? ""}
                onChange={set("nationalInsuranceNo")}
              />
            </L>

            <L label="Start Date">
              <input
                type="date"
                className="input"
                value={model.startDate ?? ""}
                onChange={set("startDate")}
              />
            </L>
            <L label="Finish Date">
              <input
                type="date"
                className="input"
                value={model.finishDate ?? ""}
                onChange={set("finishDate")}
              />
            </L>

            <div className="md:col-span-2">
              <L label="Photo URL">
                <input
                  className="input"
                  value={model.photoUrl ?? ""}
                  onChange={set("photoUrl")}
                />
              </L>
            </div>

            <div className="md:col-span-2">
              <L label="Notes">
                <textarea
                  className="input h-24"
                  value={model.notes ?? ""}
                  onChange={set("notes")}
                />
              </L>
            </div>
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
