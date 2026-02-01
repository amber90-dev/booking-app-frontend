import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type Company = {
  id?: string;
  accountNo: string;
  name: string;
  address1?: string | null;
  address2?: string | null;
  town?: string | null;
  county?: string | null;
  postcode?: string | null;
  telNo?: string | null;
  faxNo?: string | null;
  daysToPay?: number | null;
  surcharge?: string | null;
  notes?: string | null;
};

type Errors = Partial<Record<keyof Company, string>>;
const REQUIRED: (keyof Company)[] = ["accountNo", "name"];

const norm = (v: unknown) => String(v ?? "").trim();
function validate(m: Company): Errors {
  const e: Errors = {};
  REQUIRED.forEach((k) => {
    if (!norm((m as any)[k])) e[k] = "Required";
  });
  if (m.postcode && !/^[A-Za-z0-9\s-]{3,10}$/.test(m.postcode))
    e.postcode = "Invalid";
  if (m.telNo && !/^[+0-9()\s-]{5,20}$/.test(m.telNo)) e.telNo = "Invalid";
  if (m.faxNo && !/^[+0-9()\s-]{5,20}$/.test(m.faxNo)) e.faxNo = "Invalid";
  if (m.surcharge && !/^-?\d+(\.\d{1,2})?$/.test(m.surcharge))
    e.surcharge = "Invalid amount";
  if (
    m.daysToPay !== null &&
    m.daysToPay !== undefined &&
    String(m.daysToPay) !== "" &&
    !/^\d+$/.test(String(m.daysToPay))
  )
    e.daysToPay = "Must be integer";
  return e;
}

export default function CompanyForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { success, error: toastError } = useToast();

  const [model, setModel] = useState<Company>({ accountNo: "", name: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/companies/${id}`)
      .then((r) => setModel(r.data))
      .catch((e) =>
        toastError(e?.response?.data?.message || "Failed to load company")
      );
  }, [id, isEdit, toastError]);

  useEffect(() => {
    setErrors(validate(model));
  }, [model]);

  const set =
    (k: keyof Company) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let v: any = e.target.value;
      if (k === "daysToPay") v = v === "" ? null : Number(v);
      setModel((m) => ({ ...m, [k]: v }));
      setTouched((t) => ({ ...t, [k]: true }));
      setDirty((d) => ({ ...d, [k]: true }));
    };

  const E = (k: keyof Company) =>
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
        await api.put(`/companies/${id}`, model);
        success("Company updated");
      } else {
        await api.post("/companies", model);
        success("Company created");
      }
      nav("/companies");
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
          {isEdit ? "Edit Company" : "New Company"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn border border-slate-200"
            onClick={() => nav("/companies")}
          >
            Cancel
          </button>
          {/* Submit via the form, not onClick */}
          <button
            type="submit"
            form="company-form"
            disabled={saving}
            className="btn btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <form id="company-form" onSubmit={onSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b font-medium">Company</div>
          <div className="p-4 grid md:grid-cols-2 gap-4">
            <L label="Account No *">
              <input
                className="input"
                value={model.accountNo}
                onChange={set("accountNo")}
              />
              {E("accountNo")}
            </L>
            <L label="Company Name *">
              <input
                className="input"
                value={model.name}
                onChange={set("name")}
              />
              {E("name")}
            </L>

            <div className="md:col-span-2">
              <L label="Company Address">
                <input
                  className="input"
                  value={model.address1 ?? ""}
                  onChange={set("address1")}
                />
                {E("address1")}
              </L>
            </div>
            <div className="md:col-span-2">
              <L label="Company Address 2">
                <input
                  className="input"
                  value={model.address2 ?? ""}
                  onChange={set("address2")}
                />
                {E("address2")}
              </L>
            </div>

            <L label="Company Town">
              <input
                className="input"
                value={model.town ?? ""}
                onChange={set("town")}
              />
              {E("town")}
            </L>
            <L label="Company County">
              <input
                className="input"
                value={model.county ?? ""}
                onChange={set("county")}
              />
              {E("county")}
            </L>
            <L label="Company Postcode">
              <input
                className="input"
                value={model.postcode ?? ""}
                onChange={set("postcode")}
              />
              {E("postcode")}
            </L>

            <L label="Company Tel No">
              <input
                className="input"
                value={model.telNo ?? ""}
                onChange={set("telNo")}
              />
              {E("telNo")}
            </L>
            <L label="Company Fax No">
              <input
                className="input"
                value={model.faxNo ?? ""}
                onChange={set("faxNo")}
              />
              {E("faxNo")}
            </L>

            <L label="Days to pay">
              <input
                className="input"
                inputMode="numeric"
                value={model.daysToPay ?? ""}
                onChange={set("daysToPay")}
              />
              {E("daysToPay")}
            </L>
            <L label="Surcharge">
              <input
                className="input"
                value={model.surcharge ?? ""}
                onChange={set("surcharge")}
              />
              {E("surcharge")}
            </L>

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

        {/* Hidden submit allows Enter to submit inside inputs */}
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
